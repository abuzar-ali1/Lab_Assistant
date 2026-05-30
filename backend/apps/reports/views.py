from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import LabReport, TestResult
from .serializers import LabReportSerializer, LabReportDetailSerializer, LabReportUploadSerializer
from .services import process_lab_report   # we'll create this later

class LabReportUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LabReportUploadSerializer(data=request.data)
        if serializer.is_valid():
            report = serializer.save(user=request.user)
            
            process_lab_report(report.id)
            return Response(LabReportSerializer(report).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LabReportDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, report_id):
        try:
            report = LabReport.objects.get(id=report_id, user=request.user)
        except LabReport.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = LabReportDetailSerializer(report)
        return Response(serializer.data)


class LabReportListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reports = LabReport.objects.filter(user=request.user).order_by('-created_at')
        serializer = LabReportSerializer(reports, many=True)
        return Response(serializer.data)