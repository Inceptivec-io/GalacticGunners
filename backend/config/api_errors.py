from rest_framework.views import exception_handler


def normalize_error_detail(value):
    if isinstance(value, dict):
        return {key: normalize_error_detail(item) for key, item in value.items()}
    if isinstance(value, list):
        return [normalize_error_detail(item) for item in value]
    return str(value)


def build_error_payload(*, code, detail, errors=None):
    return {
        'code': code,
        'detail': detail,
        'errors': errors or {},
    }


def error_response(payload, status_code):
    from rest_framework.response import Response

    return Response(payload, status=status_code)


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    status_code = response.status_code
    raw_detail = response.data

    if status_code == 400:
        errors = normalize_error_detail(raw_detail)
        if not isinstance(errors, dict):
            errors = {'non_field_errors': errors}
        response.data = build_error_payload(
            code='invalid_request',
            detail='Request validation failed.',
            errors=errors,
        )
    elif status_code == 404:
        detail = raw_detail.get('detail', 'Resource not found.') if isinstance(raw_detail, dict) else raw_detail
        response.data = build_error_payload(
            code='not_found',
            detail=str(detail),
        )
    elif status_code == 409:
        detail = raw_detail.get('detail', 'Lifecycle conflict.') if isinstance(raw_detail, dict) else raw_detail
        response.data = build_error_payload(
            code='conflict',
            detail=str(detail),
        )
    else:
        detail = raw_detail.get('detail', 'Request failed.') if isinstance(raw_detail, dict) else raw_detail
        response.data = build_error_payload(
            code='request_failed',
            detail=str(detail),
        )

    return response
