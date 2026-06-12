from django.urls import path
from .views import (
    LabReportUploadView,
    LabReportDetailView,
    LabReportListView,
    LabReportDeleteView,
)

urlpatterns = [

    path('api/reports/upload/', LabReportUploadView.as_view(), name='report_upload'),
    
    path('api/reports/', LabReportListView.as_view(), name='report_list'),
    
    path('api/reports/<int:report_id>/', LabReportDetailView.as_view(), name='report_detail'),
    
    path('api/reports/<int:report_id>/delete/', LabReportDeleteView.as_view(), name='report_delete'),
]