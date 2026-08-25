from django.http import JsonResponse


def health(request):
    return JsonResponse({
        'status': 'ok',
        'service': 'galactic-gunners-api',
        'api_version': 'v1',
    })
