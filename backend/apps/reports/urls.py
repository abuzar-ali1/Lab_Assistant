# reports/urls.py
from django.urls import path
from .views import (
    LabReportUploadView,
    LabReportDetailView,
    LabReportListView,
    # LabReportTrendView,   
)

urlpatterns = [
    path('upload/', LabReportUploadView.as_view(), name='report-upload'),
    path('', LabReportListView.as_view(), name='report-list'),
    path('<int:report_id>/', LabReportDetailView.as_view(), name='report-detail'),
    # path('trends/', LabReportTrendView.as_view(), name='report-trend'),   # optional future endpoint
]