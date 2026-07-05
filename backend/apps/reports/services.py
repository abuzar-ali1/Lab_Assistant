import os
import json
import time
import google.generativeai as genai
from django.conf import settings
from django.utils import timezone
from .models import LabReport, TestResult
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

env_path = os.path.join(settings.BASE_DIR, '.env')
load_dotenv(dotenv_path=env_path)

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


def process_lab_report(report_id):
    """
    Process uploaded lab report using Gemini Vision API
    
    Steps:
    1. Read file directly from R2 (no local storage)
    2. Send to Gemini for AI analysis
    3. Parse JSON response
    4. Save test results to database
    5. Mark report as completed
    
    Args:
        report_id: UUID of the LabReport
    """
    try:
        # Get report from database
        report = LabReport.objects.get(id=report_id)
        
        # Mark as processing
        report.status = LabReport.Status.PROCESSING
        report.save()

        start_time = time.time()
        logger.info(f"Starting processing for report {report_id}")

       
        with report.file.open('rb') as f:
            file_bytes = f.read()
        
        logger.info(f"Read {len(file_bytes)} bytes from R2")

        file_extension = report.original_filename.lower().split('.')[-1]
        mime_type_map = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
        }
        file_media_type = mime_type_map.get(file_extension, 'application/octet-stream')

        prompt = """
        You are a medical lab report explainer for Pakistani patients.
        Your job is to extract and explain every test result from the lab report.
        
        IMPORTANT: Return ONLY valid JSON array, nothing else. No markdown, no extra text.
        
        Each test object MUST have these exact keys:
        {
            "test_name": "Test name like HbA1c, ALT, etc",
            "value": "The numeric value from the report",
            "unit": "Unit like mg/dL, %, U/L etc",
            "reference_range": "Normal range shown on report or standard range",
            "is_abnormal": true/false,
            "explanation_urdu": "2 simple sentences in Urdu explaining what this test means for the patient",
            "explanation_english": "2 simple sentences in English explaining what this test means",
            "doctor_questions": ["Question 1 to ask doctor", "Question 2 to ask doctor"]
        }
        
        Rules for explanations:
        - Use SIMPLE language, NO medical jargon
        - Use Urdu script (اردو) for Urdu explanations
        - Focus on what the value means for the patient's health
        - If abnormal, explain what it could indicate
        - Maximum 2 sentences per explanation
        
        Examples:
        - Urdu: "یہ آپ کے خون میں شکر کی سطح ہے۔ اگر یہ بہت زیادہ ہے تو ذیابیطس ہو سکتی ہے۔"
        - English: "This measures the sugar level in your blood. If high, you might have diabetes."
        
        Return array with all tests found in the report.
        """

        logger.info(f"Sending {file_media_type} to Gemini for analysis")

        model = genai.GenerativeModel('gemini-3.5-flash')
        response = model.generate_content(
            [
                prompt,
                {"mime_type": file_media_type, "data": file_bytes}
            ],
            generation_config={"response_mime_type": "application/json"}
        )

        logger.info("Received response from Gemini")

        # Parse JSON response
        data = json.loads(response.text)
        logger.info(f"Parsed {len(data)} test results")

        # Save each test result to database
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
                doctor_questions=item.get('doctor_questions', []),
            )

        # Mark report as completed
        report.status = LabReport.Status.COMPLETED
        report.completed_at = timezone.now()
        report.processing_time = time.time() - start_time
        report.save()

        logger.info(f"Report {report_id} processed successfully in {report.processing_time:.2f}s")

    except LabReport.DoesNotExist:
        logger.error(f"Report {report_id} not found")
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {str(e)}")
        try:
            report = LabReport.objects.get(id=report_id)
            report.status = LabReport.Status.FAILED
            report.error_message = f"AI response was not valid JSON: {str(e)}"
            report.save()
        except:
            pass
            
    except Exception as e:
        logger.error(f"Processing error: {str(e)}")
        try:
            report = LabReport.objects.get(id=report_id)
            report.status = LabReport.Status.FAILED
            report.error_message = str(e)
            report.save()
        except:
            pass