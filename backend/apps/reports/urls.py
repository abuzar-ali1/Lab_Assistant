from django.urls import path
from .views import (
    LabReportUploadView,
    LabReportDetailView,
    LabReportListView,
    LabReportDeleteView,
)

urlpatterns = [
    # Upload report
    path('api/reports/upload/', LabReportUploadView.as_view(), name='report_upload'),
    
    # List reports
    path('api/reports/', LabReportListView.as_view(), name='report_list'),
    
    # Get report detail
    path('api/reports/<int:report_id>/', LabReportDetailView.as_view(), name='report_detail'),
    
    # Delete report
    path('api/reports/<int:report_id>/delete/', LabReportDeleteView.as_view(), name='report_delete'),
]