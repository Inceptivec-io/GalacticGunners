import os

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403,F401

DEBUG = False

if not os.environ.get('DJANGO_SECRET_KEY'):
    raise ImproperlyConfigured('DJANGO_SECRET_KEY is required in stage.')
if not os.environ.get('DATABASE_URL'):
    raise ImproperlyConfigured('DATABASE_URL is required in stage.')

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
