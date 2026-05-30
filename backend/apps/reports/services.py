# reports/services.py
import os
import json
import google.generativeai as genai
from django.conf import settings
from .models import LabReport, TestResult
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure the Gemini API client
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def process_lab_report(report_id):
    try:
        report = LabReport.objects.get(id=report_id)
        report.status = LabReport.Status.PROCESSING
        report.save()

        # Read file content directly as bytes
        with report.file.open('rb') as f:
            file_bytes = f.read()

        # Determine mime type (Gemini needs to know if it's looking at an image or a document)
        file_media_type = 'application/pdf' if report.file.name.lower().endswith('.pdf') else 'image/jpeg'

        # The Prompt
        prompt = """
        You are a medical lab report explainer. Extract every test result from the lab report.
        Return a JSON array where each object has EXACTLY these keys:
        - test_name: string
        - value: string
        - unit: string
        - reference_range: string (as shown on the report, or common normal range if absent)
        - is_abnormal: boolean (true if value is outside reference range)
        - explanation_urdu: simple explanation in Urdu language
        - explanation_english: simple explanation in English
        """

        # Initialize the model 
        # gemini-1.5-flash is perfect here: it's fast, multimodal, and has a great free tier.
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Call the API
        # We pass the prompt and the file bytes together. 
        # We also enforce strict JSON output via generation_config.
        response = model.generate_content(
            [
                prompt,
                {"mime_type": file_media_type, "data": file_bytes}
            ],
            generation_config={"response_mime_type": "application/json"}
        )

        # Parse the guaranteed JSON response directly
        data = json.loads(response.text)

        # Save test results
        for item in data:
            TestResult.objects.create(
                report=report,
                test_name=item.get('test_name', 'Unknown'),
                value=item.get('value', ''),
                unit=item.get('unit', ''),
                reference_range=item.get('reference_range', ''),
                is_abnormal=item.get('is_abnormal', False),
                explanation_urdu=item.get('explanation_urdu', ''),
                explanation_english=item.get('explanation_english', ''),
            )

        report.status = LabReport.Status.COMPLETED
        report.save()

    except LabReport.DoesNotExist:
        pass
    except Exception as e:
        # Mark report as failed and store the error
        print(f"\n--- GEMINI PROCESSING ERROR ---\n{str(e)}\n-------------------------------\n")
        try:
            report = LabReport.objects.get(id=report_id)
            report.status = LabReport.Status.FAILED
            report.error_message = str(e)
            report.save()
        except:
            pass