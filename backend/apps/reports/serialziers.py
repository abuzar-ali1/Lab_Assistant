from rest_framework import serializers
from .models import LabReport, TestResult

class LabReportUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabReport
        fields = ['file']   # only the file is sent by the user

    def create(self, validated_data):
        validated_data['original_filename'] = validated_data['file'].name
        return super().create(validated_data)


class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = '__all__'


class LabReportSerializer(serializers.ModelSerializer):
    """Used for list view – summary only, no test details."""
    abnormal_count = serializers.SerializerMethodField()
    total_tests = serializers.SerializerMethodField()

    class Meta:
        model = LabReport
        fields = ['id', 'original_filename', 'status', 'created_at', 'abnormal_count', 'total_tests']

    def get_abnormal_count(self, obj):
        return obj.test_results.filter(is_abnormal=True).count()

    def get_total_tests(self, obj):
        return obj.test_results.count()


class LabReportDetailSerializer(serializers.ModelSerializer):
    """Used for detail view – includes all test results."""
    test_results = TestResultSerializer(many=True, read_only=True)

    class Meta:
        model = LabReport
        fields = ['id', 'original_filename', 'status', 'created_at', 'test_results']