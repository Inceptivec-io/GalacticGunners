from .base import *  # noqa: F403,F401

DEBUG = env_bool('DJANGO_DEBUG', True)  # noqa: F405
ALLOWED_HOSTS = ALLOWED_HOSTS or ['localhost', '127.0.0.1', 'backend']  # noqa: F405
CORS_ALLOWED_ORIGINS = CORS_ALLOWED_ORIGINS or ['http://localhost:3000']  # noqa: F405
