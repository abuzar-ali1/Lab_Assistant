from rest_framework import serializers
from .models import LabReport, TestResult


class LabReportUploadSerializer(serializers.ModelSerializer):
    """
    Serializer for file upload.
    Accepts either the standard field name 'file' or the frontend alias 'report_file'.
    """
    file = serializers.FileField(required=False, write_only=True)
    report_file = serializers.FileField(required=False, write_only=True)

    class Meta:
        model = LabReport
        fields = ['file', 'report_file']

    def validate(self, attrs):
        incoming_file = attrs.get('file')
        alias_file = attrs.get('report_file')

        if incoming_file is None and alias_file is not None:
            attrs['file'] = alias_file

        attrs.pop('report_file', None)

        if attrs.get('file') is None:
            raise serializers.ValidationError({'file': ['No file was submitted.']})

        return attrs

    def validate_file(self, value):
        """
        Validate:
        - File size (max 5MB)
        - File type (PDF, JPG, PNG only)
        """
        max_size = 5 * 1024 * 1024  # 5MB
        
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size ({value.size / 1024 / 1024:.1f}MB) exceeds maximum of 5MB"
            )
        
        # Check extension
        allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png']
        file_extension = value.name.split('.')[-1].lower()
        
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"File type .{file_extension} not allowed. "
                f"Allowed: {', '.join(allowed_extensions)}"
            )
        
        return value

    def create(self, validated_data):
        """Store original filename for display"""
        validated_data['original_filename'] = validated_data['file'].name
        return super().create(validated_data)


class TestResultSerializer(serializers.ModelSerializer):
    """Serializer for individual test results"""
    class Meta:
        model = TestResult
        fields = [
            'id',
            'test_name',
            'value',
            'unit',
            'reference_range',
            'is_abnormal',
            'explanation_urdu',
            'explanation_english',
            'doctor_questions',
            'created_at'
        ]


class LabReportSerializer(serializers.ModelSerializer):
    """
    Serializer for report list view (summary only)
    Shows basic info without test details
    """
    abnormal_count = serializers.SerializerMethodField()
    total_tests = serializers.SerializerMethodField()

    class Meta:
        model = LabReport
        fields = [
            'id',
            'original_filename',
            'status',
            'created_at',
            'abnormal_count',
            'total_tests',
           
        ]

    def get_abnormal_count(self, obj):
        """Count of abnormal test results"""
        return obj.test_results.filter(is_abnormal=True).count()

    def get_total_tests(self, obj):
        """Total number of test results"""
        return obj.test_results.count()
    
  

class LabReportDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for report detail view (full info)
    Includes all test results and R2 file URL
    """
    test_results = TestResultSerializer(many=True, read_only=True)
    file_url = serializers.SerializerMethodField()
    processing_time_seconds = serializers.SerializerMethodField()

    class Meta:
        model = LabReport
        fields = [
            'id',
            'original_filename',
            'status',
            'file_url',
          
            'created_at',
            'completed_at',
            'processing_time_seconds',
            'test_results',
            'error_message'
        ]
    
    def get_file_url(self, obj):
        """Generate signed R2 URL (valid 1 hour)"""
        if obj.file:
            return obj.get_file_url()
        return None
    
   
    
    def get_processing_time_seconds(self, obj):
        """Return processing time in seconds"""
        if obj.processing_time:
            return round(obj.processing_time, 2)
        return None