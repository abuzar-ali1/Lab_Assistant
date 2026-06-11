from django.db import models
from django.conf import settings
from django.core.validators import FileExtensionValidator
from django.utils import timezone
import uuid

class LabReport(models.Model):
    """
    Lab Report Model - Files stored in Cloudflare R2
    No local storage needed
    """
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lab_reports',
        db_index=True
    )
    
    # File stored in R2 (not on disk)
    file = models.FileField(
        upload_to='%Y/%m/%d/',  # R2 path: lab-reports/2024/01/15/filename.pdf
        validators=[
            FileExtensionValidator(
                allowed_extensions=['pdf', 'jpg', 'jpeg', 'png']
            )
        ]
    )
    
    # File metadata
    original_filename = models.CharField(max_length=255, blank=True)
    file_size = models.IntegerField(default=0, help_text="File size in bytes")
    file_mime_type = models.CharField(
        max_length=50,
        default='application/octet-stream'
    )
    
    # Processing status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    error_message = models.TextField(blank=True, null=True)
    processing_time = models.FloatField(
        null=True,
        blank=True,
        help_text="Processing time in seconds"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # R2 URL (cached for performance)
    file_url = models.URLField(blank=True, null=True) 

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Lab Report'
        verbose_name_plural = 'Lab Reports'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.original_filename} ({self.status})"
    
    def get_file_url(self):
        """
        Get signed R2 URL (expires in 1 hour)
        Only authenticated users can access
        """
        if hasattr(self.file, 'url'):
            return self.file.url
        return self.file_url
    
    def save(self, *args, **kwargs):
        """Store file metadata"""
        if self.file:
            self.file_size = self.file.size
            self.file_mime_type = self.file.content_type or 'application/octet-stream'
            if not self.original_filename:
                self.original_filename = self.file.name
        super().save(*args, **kwargs)


class TestResult(models.Model):
    """
    Test Result - AI-extracted data from lab report
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    report = models.ForeignKey(
        LabReport,
        on_delete=models.CASCADE,
        related_name='test_results'
    )
    
    # Test data
    test_name = models.CharField(max_length=200, db_index=True)
    value = models.CharField(max_length=50)
    unit = models.CharField(max_length=50, blank=True)
    reference_range = models.CharField(max_length=100, blank=True)
    is_abnormal = models.BooleanField(default=False, db_index=True)
    
    # Bilingual explanations
    explanation_urdu = models.TextField(blank=True, help_text="Urdu explanation")
    explanation_english = models.TextField(blank=True, help_text="English explanation")
    
    # Doctor discussion points
    doctor_questions = models.JSONField(
        default=list,
        blank=True,
        help_text="Questions to ask doctor"
    )
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['test_name']
        verbose_name = 'Test Result'
        verbose_name_plural = 'Test Results'
        indexes = [
            models.Index(fields=['report', 'is_abnormal']),
        ]

    def __str__(self):
        return f"{self.test_name}: {self.value} {self.unit}"