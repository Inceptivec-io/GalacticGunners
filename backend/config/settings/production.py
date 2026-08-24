import os

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403,F401

DEBUG = False

if not os.environ.get('DJANGO_SECRET_KEY'):
    raise ImproperlyConfigured('DJANGO_SECRET_KEY is required in production.')
if not os.environ.get('DATABASE_URL'):
    raise ImproperlyConfigured('DATABASE_URL is required in production.')
if not os.environ.get('DJANGO_ALLOWED_HOSTS'):
    raise ImproperlyConfigured('DJANGO_ALLOWED_HOSTS is required in production.')

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
