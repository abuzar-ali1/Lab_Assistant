"""
Django settings for lab_Assistant project.
"""

from pathlib import Path
import os
from urllib.parse import parse_qsl, urlparse
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv(dotenv_path=os.path.join(BASE_DIR, '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-k_x*z@se4j)u0i)g@2zf)p29*470r+92=oc&%6i!$t=b*s+_18'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'storages', 
    'apps.users',
    'apps.reports',
    'google.generativeai', 
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'lab_Assistant.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'lab_Assistant.wsgi.application'

tmpPostgres = urlparse(os.getenv("DATABASE_URL"))
# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': tmpPostgres.path.replace('/', ''),
        'USER': tmpPostgres.username,
        'PASSWORD': tmpPostgres.password,
        'HOST': tmpPostgres.hostname,
        'PORT': 5432,
        'OPTIONS': dict(parse_qsl(tmpPostgres.query)),



    }
}



AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# ============================================
# CLOUDFLARE R2 STORAGE CONFIGURATION
# ============================================

USE_R2_STORAGE = os.getenv('CLOUDFLARE_STORAGE_ENABLE', 'False') == 'True'

if USE_R2_STORAGE:
    # ✅ R2 Configuration (S3-compatible)
    AWS_ACCESS_KEY_ID = os.getenv('CLOUDFLARE_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('CLOUDFLARE_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.getenv('CLOUDFLARE_BUCKET_NAME')
    
    AWS_S3_ENDPOINT_URL = os.getenv('CLOUDFLARE_ENDPOINT_URL')
    
    AWS_S3_REGION_NAME = 'auto'  
    AWS_S3_ADDRESSING_STYLE = 'virtual'  
    AWS_QUERYSTRING_AUTH = True 
    AWS_QUERYSTRING_EXPIRE = 3600  
    AWS_DEFAULT_ACL = 'private' 
    
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',  
    }
    
    # Use R2 for media uploads
    DEFAULT_FILE_STORAGE = 'lab_Assistant.storage.R2Storage'
    MEDIA_URL = f"{AWS_S3_ENDPOINT_URL}/lab-reports/"
    
else:
    # Local storage for development
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# File Upload Settings
DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # 5MB

# Only use a local temp upload dir when not using cloud storage.
# When using Cloudflare R2, Django will fall back to the OS temp directory.
if not USE_R2_STORAGE:
    FILE_UPLOAD_TEMP_DIR = os.path.join(BASE_DIR, 'tmp')
    os.makedirs(FILE_UPLOAD_TEMP_DIR, exist_ok=True)

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# REST Framework Config
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
}

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
}

# Auth User Model
AUTH_USER_MODEL = 'users.User'

# Default Primary Key Field Type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

# Email settings for Forgot Password (using console backend for development)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Google OAuth2 Settings
GOOGLE_OAUTH2_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', 'placeholder-google-client-id.apps.googleusercontent.com')
