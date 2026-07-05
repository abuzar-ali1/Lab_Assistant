from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from .serializers import LabReportUploadSerializer


class LabReportUploadSerializerTests(TestCase):
    def test_accepts_report_file_field_name(self):
        uploaded_file = SimpleUploadedFile(
            "report.pdf",
            b"%PDF-1.4\n%test",
            content_type="application/pdf",
        )

        serializer = LabReportUploadSerializer(data={"report_file": uploaded_file})

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data["file"].name, uploaded_file.name)
