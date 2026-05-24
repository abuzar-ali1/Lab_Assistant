# reports/models.py
from django.db import models
from django.conf import settings

class LabReport(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lab_reports')
    file = models.FileField(upload_to='lab_reports/%Y/%m/%d/')
    original_filename = models.CharField(max_length=255, blank=True)   # store the original name
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    error_message = models.TextField(blank=True, null=True)           # if AI extraction fails
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Lab Report'
        verbose_name_plural = 'Lab Reports'

    def __str__(self):
        return f"{self.user.email} - {self.original_filename or self.file.name} ({self.status})"


class TestResult(models.Model):
    report = models.ForeignKey(LabReport, on_delete=models.CASCADE, related_name='test_results')
    test_name = models.CharField(max_length=200)            # e.g., "HbA1c", "ALT"
    value = models.CharField(max_length=50)                 # e.g., "7.8" (could be numeric or text like "Negative")
    unit = models.CharField(max_length=50, blank=True)      # e.g., "mg/dL", "%"
    reference_range = models.CharField(max_length=100, blank=True)  # e.g., "4.0 - 5.6"
    is_abnormal = models.BooleanField(default=False)

    explanation_urdu = models.TextField(blank=True)         # simple Urdu explanation
    explanation_english = models.TextField(blank=True)      # simple English explanation

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['test_name']
        verbose_name = 'Test Result'
        verbose_name_plural = 'Test Results'

    def __str__(self):
        return f"{self.test_name}: {self.value} {self.unit} ({'Abnormal' if self.is_abnormal else 'Normal'})"