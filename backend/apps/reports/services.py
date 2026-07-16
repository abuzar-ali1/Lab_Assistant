import json
import logging
import os
import time

from django.db import transaction
from django.utils import timezone
from google import genai
from google.genai import types

from .models import LabReport, TestResult

logger = logging.getLogger(__name__)

TEST_RESULTS_SCHEMA = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "test_name": {"type": "string"},
            "value": {"type": "string"},
            "unit": {"type": "string"},
            "reference_range": {"type": "string"},
            "is_abnormal": {"type": "boolean"},
            "explanation_urdu": {"type": "string"},
            "explanation_english": {"type": "string"},
            "doctor_questions": {"type": "array", "items": {"type": "string"}},
        },
        "required": [
            "test_name",
            "value",
            "unit",
            "reference_range",
            "is_abnormal",
            "explanation_urdu",
            "explanation_english",
            "doctor_questions",
        ],
    },
}


def process_lab_report(report_id):
    """Extract lab markers and patient-friendly explanations from an uploaded report."""
    try:
        report = LabReport.objects.get(id=report_id)
        report.status = LabReport.Status.PROCESSING
        report.error_message = None
        report.save(update_fields=["status", "error_message", "updated_at"])
        started_at = time.time()

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise RuntimeError("GOOGLE_API_KEY is not configured")

        with report.file.open("rb") as report_file:
            file_bytes = report_file.read()

        extension = report.original_filename.lower().rsplit(".", 1)[-1]
        media_type = {
            "pdf": "application/pdf",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
        }.get(extension, "application/octet-stream")

        prompt = """
        You explain Pakistani laboratory reports to patients without diagnosing them.
        Extract every clearly readable test result. Preserve the value, unit, and the
        laboratory's own reference range exactly as shown. Mark a result abnormal only
        when the report itself flags it or it is visibly outside the printed range.

        Write two short, calm sentences in plain English and two short sentences in
        natural Urdu script for each marker. Explain what the test generally measures
        and what this specific value may be useful to discuss with a clinician. Avoid
        certainty, treatment advice, and alarmist words. Add up to three concise,
        specific questions the patient could ask their doctor. If text is unreadable,
        do not invent it.
        """

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-3.5-flash"),
            contents=[
                prompt,
                types.Part.from_bytes(data=file_bytes, mime_type=media_type),
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_json_schema=TEST_RESULTS_SCHEMA,
                temperature=0.15,
            ),
        )

        results = response.parsed
        if results is None:
            results = json.loads(response.text or "[]")
        if not isinstance(results, list) or not results:
            raise ValueError("No readable lab results were found in this document")

        with transaction.atomic():
            report.test_results.all().delete()
            TestResult.objects.bulk_create(
                [
                    TestResult(
                        report=report,
                        test_name=item.get("test_name", "Unknown test").strip(),
                        value=str(item.get("value", "")).strip(),
                        unit=str(item.get("unit", "")).strip(),
                        reference_range=str(item.get("reference_range", "")).strip(),
                        is_abnormal=bool(item.get("is_abnormal", False)),
                        explanation_urdu=item.get("explanation_urdu", "").strip(),
                        explanation_english=item.get("explanation_english", "").strip(),
                        doctor_questions=item.get("doctor_questions", [])[:3],
                    )
                    for item in results
                ]
            )
            report.status = LabReport.Status.COMPLETED
            report.completed_at = timezone.now()
            report.processing_time = time.time() - started_at
            report.error_message = None
            report.save(
                update_fields=[
                    "status",
                    "completed_at",
                    "processing_time",
                    "error_message",
                    "updated_at",
                ]
            )

        logger.info("Report %s processed in %.2fs", report_id, report.processing_time)
    except LabReport.DoesNotExist:
        logger.error("Report %s does not exist", report_id)
    except Exception as error:
        logger.exception("Report %s processing failed", report_id)
        LabReport.objects.filter(id=report_id).update(
            status=LabReport.Status.FAILED,
            error_message=str(error)[:1000],
        )
