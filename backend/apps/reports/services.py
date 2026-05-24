# reports/services.py
import openai
from django.conf import settings
from .models import LabReport, TestResult
import json

openai.api_key = settings.OPENAI_API_KEY

def process_lab_report(report_id):
    try:
        report = LabReport.objects.get(id=report_id)
        report.status = LabReport.Status.PROCESSING
        report.save()

        # Read file content 
        with report.file.open('rb') as f:
            file_bytes = f.read()

        # Encode the file for the API (simplified – real implementation depends on file type)
        import base64
        encoded_file = base64.b64encode(file_bytes).decode('utf-8')
        file_media_type = 'application/pdf' if report.file.name.endswith('.pdf') else 'image/jpeg'

        # GPT-4 Vision prompt
        prompt = """
        You are a medical lab report explainer. Extract every test result from the lab report image/PDF.
        Return a JSON array where each object has:
        - test_name: string
        - value: string
        - unit: string
        - reference_range: string (as shown on the report, or common normal range if absent)
        - is_abnormal: boolean (true if value is outside reference range)
        - explanation_urdu: simple explanation in Urdu language
        - explanation_english: simple explanation in English
        """

        response = openai.ChatCompletion.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{file_media_type};base64,{encoded_file}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=2000
        )

        # Parse AI response
        ai_content = response.choices[0].message.content
        # Remove possible markdown code fences
        if '```' in ai_content:
            ai_content = ai_content.split('```')[1]
            if ai_content.startswith('json'):
                ai_content = ai_content[4:]
        data = json.loads(ai_content)

        # Save test results
        for item in data:
            TestResult.objects.create(
                report=report,
                test_name=item['test_name'],
                value=item['value'],
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
        try:
            report = LabReport.objects.get(id=report_id)
            report.status = LabReport.Status.FAILED
            report.error_message = str(e)
            report.save()
        except:
            pass