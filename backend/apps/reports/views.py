from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import LabReport, TestResult
from .serializers import (
    LabReportSerializer,
    LabReportDetailSerializer,
    LabReportUploadSerializer
)
from .services import process_lab_report
import logging

logger = logging.getLogger(__name__)


class LabReportUploadView(APIView):
    """
    POST /api/reports/upload/
    
    Upload a lab report (PDF or image)
    File is automatically uploaded to Cloudflare R2
    Processing starts immediately
    
    Request:
        - file: multipart/form-data file
    
    Response:
        - Report object with status=pending
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LabReportUploadSerializer(data=request.data)
        
        if serializer.is_valid():
            # Save report with authenticated user
            report = serializer.save(user=request.user)
            logger.info(f"New report uploaded by {request.user.email}")
            
            # Start processing (for production, use Celery for async)
            process_lab_report(report.id)
            
            return Response(
                LabReportSerializer(report).data,
                status=status.HTTP_201_CREATED
            )
        
        logger.warning(f"Upload validation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LabReportDetailView(APIView):
    """
    GET /api/reports/{report_id}/
    
    Get detailed report with all test results
    Returns file URL with signed link (valid 1 hour)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, report_id):
        report = get_object_or_404(
            LabReport,
            id=report_id,
            user=request.user  # Ensure user owns report
        )
        serializer = LabReportDetailSerializer(
            report,
            context={'request': request}
        )
        return Response(serializer.data)


class LabReportListView(APIView):
    """
    GET /api/reports/?page=1&page_size=10
    
    List all user's reports with pagination
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get pagination params
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        # Get all user's reports (newest first)
        reports = LabReport.objects.filter(
            user=request.user
        ).order_by('-created_at')
        
        # Paginate
        total_count = reports.count()
        start = (page - 1) * page_size
        end = start + page_size
        paginated_reports = reports[start:end]
        
        serializer = LabReportSerializer(paginated_reports, many=True)
        
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size,
            'results': serializer.data
        })


class LabReportDeleteView(APIView):
    """
    DELETE /api/reports/{report_id}/
    
    Delete report and associated R2 file
    File automatically deleted from Cloudflare R2
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, report_id):
        report = get_object_or_404(
            LabReport,
            id=report_id,
            user=request.user
        )
        
        logger.info(f"Deleting report {report_id} for user {request.user.email}")
        
        # File is automatically deleted from R2 by django-storages
        report.delete()
        
        return Response(
            {'message': 'Report deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )