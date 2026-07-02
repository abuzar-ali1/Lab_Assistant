import os
from urllib.parse import urlparse
from storages.backends.s3boto3 import S3Boto3Storage
from django.conf import settings

def get_custom_domain():
    endpoint = os.getenv('CLOUDFLARE_ENDPOINT_URL', '')
    if endpoint:
        return urlparse(endpoint).netloc
    return None

class R2Storage(S3Boto3Storage):
    """
    Cloudflare R2 Storage Backend
    R2 is S3-compatible but cheaper with no egress fees
    """
    location = 'lab-reports'  # Subfolder in bucket
    default_acl = 'private'   # Private files by default
    file_overwrite = False    # Keep all file versions
    custom_domain = get_custom_domain()

    def __init__(self, *args, **kwargs):
        # Cloudflare R2 endpoint
        self.endpoint_url = os.getenv('CLOUDFLARE_ENDPOINT_URL')
        super().__init__(*args, **kwargs)

    @property
    def querystring_auth(self):
        """Sign URLs for private access"""
        return True

    @property
    def url_protocol(self):
        """Use HTTPS"""
        return 'https'

    def _full_path(self, name):
        """
        Generate full path with user ID for organization
        Format: lab-reports/user_123/reports/filename.pdf
        """
        return f"{self.location}/{name}"

    def get_accessed_time(self, name):
        """Get file modification time"""
        return super().get_accessed_time(name)

    def get_created_time(self, name):
        """Get file creation time"""
        return super().get_created_time(name)