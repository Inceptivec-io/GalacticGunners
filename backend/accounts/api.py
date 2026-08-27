from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from accounts.models import User
from players.models import PlayerProfile


def session_payload(request):
    user = request.user
    if not user.is_authenticated:
        return {'authenticated': False, 'user': None, 'platform_access': False, 'surface_grants': [], 'memberships': [], 'platform_permissions': []}
    profile = getattr(user, 'player_profile', None)
    memberships = list(user.organization_memberships.filter(status='ACTIVE', organization__status='ACTIVE').select_related('organization'))
    platform_access = bool(user.is_superuser or user.has_perm('accounts.manage_platform'))
    grants = []
    if profile and profile.status == PlayerProfile.Status.ACTIVE:
        grants.append('PLAYER_ACCOUNT')
    if memberships and 'PLAYER_ACCOUNT' in grants:
        grants.append('COMMAND_POST')
    if platform_access:
        grants.append('INCEPTIVEC_ADMIN')
    return {
        'authenticated': True,
        'user': {'id': str(user.id), 'username': user.username, 'display_name': profile.display_name if profile else None},
        'platform_access': platform_access,
        'surface_grants': grants,
        'memberships': [{'organization_id': str(item.organization_id), 'organization_slug': item.organization.slug, 'role': item.role} for item in memberships],
        'platform_permissions': sorted(permission.split('.', 1)[1] for permission in user.get_all_permissions() if permission.startswith('accounts.')),
    }


class AuthenticationThrottle(AnonRateThrottle):
    scope = 'authentication'


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CsrfView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({'csrf_token': get_token(request)})


class SessionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        response = Response(session_payload(request))
        response['Cache-Control'] = 'no-store'
        return response


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthenticationThrottle]

    def post(self, request):
        username = str(request.data.get('username', '')).strip()
        password = str(request.data.get('password', ''))
        audience = str(request.data.get('audience', '')).strip()
        account = User.objects.filter(username__iexact=username).first()
        user = authenticate(request, username=account.username if account else username, password=password)
        if not user or not user.is_active:
            return Response({'code': 'INVALID_CREDENTIALS', 'detail': 'Invalid username or password.', 'errors': {}}, status=status.HTTP_400_BAD_REQUEST)
        profile = getattr(user, 'player_profile', None)
        player_access = profile is not None and profile.status == PlayerProfile.Status.ACTIVE
        command_post_access = player_access and user.organization_memberships.filter(
            status='ACTIVE', organization__status='ACTIVE'
        ).exists()
        platform_access = bool(user.is_superuser or user.has_perm('accounts.manage_platform'))
        audience_access = {
            'PLAYER_ACCOUNT': player_access,
            'COMMAND_POST': command_post_access,
            'INCEPTIVEC_ADMIN': platform_access,
        }.get(audience)
        if audience_access is None:
            return Response({'code': 'INVALID_REQUEST', 'detail': 'A valid login audience is required.', 'errors': {}}, status=status.HTTP_400_BAD_REQUEST)
        if not audience_access:
            return Response({'code': 'PORTAL_ACCESS_DENIED', 'detail': 'This account is not authorised for that portal.', 'errors': {}}, status=status.HTTP_403_FORBIDDEN)
        login(request, user)
        return Response(session_payload(request))


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logout(request)
        return Response({'authenticated': False})


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthenticationThrottle]

    def post(self, request):
        username = str(request.data.get('username', '')).strip()
        display_name = str(request.data.get('display_name', '')).strip()
        password = str(request.data.get('password', ''))
        try:
            validate_password(password)
            with transaction.atomic():
                user = User(username=username)
                user.set_password(password)
                user.full_clean()
                user.save()
                profile = PlayerProfile(user=user, display_name=display_name)
                profile.full_clean()
                profile.save()
        except (ValidationError, IntegrityError) as error:
            return Response({'code': 'INVALID_REQUEST', 'detail': 'Unable to create this account.', 'errors': getattr(error, 'message_dict', {})}, status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        return Response(session_payload(request), status=status.HTTP_201_CREATED)
