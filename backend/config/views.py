import os

from django.http import JsonResponse


def health(request):
    return JsonResponse({
        'status': 'ok',
        'service': 'galactic-gunners-api',
        'api_version': 'v1',
    })


def build_provenance(request):
    return JsonResponse({'application': 'galactic-gunners', 'source_sha': os.environ.get('SOURCE_SHA', 'unknown'), 'build_id': os.environ.get('BUILD_ID', 'local'), 'environment': 'local', 'api_version': 'v1', 'schema_state': 'CURRENT'})
