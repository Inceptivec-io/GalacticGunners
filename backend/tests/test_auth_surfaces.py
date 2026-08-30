from django.contrib.auth.models import Permission
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from players.models import PlayerProfile


class AuthenticationSurfaceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='platform-admin', password='A-strong-password-123')
        PlayerProfile.objects.create(user=self.user, display_name='Platform Admin')
        self.client = APIClient()

    def test_platform_audience_requires_platform_permission(self):
        response = self.client.post(
            '/api/v1/auth/login/',
            {'username': 'PLATFORM-ADMIN', 'password': 'A-strong-password-123', 'audience': 'INCEPTIVEC_ADMIN'},
            format='json',
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.data['code'], 'PORTAL_ACCESS_DENIED')

        self.user.user_permissions.add(Permission.objects.get(codename='manage_platform'))
        response = self.client.post(
            '/api/v1/auth/login/',
            {'username': 'platform-admin', 'password': 'A-strong-password-123', 'audience': 'INCEPTIVEC_ADMIN'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['platform_access'])

    def test_login_requires_explicit_audience(self):
        response = self.client.post(
            '/api/v1/auth/login/',
            {'username': 'platform-admin', 'password': 'A-strong-password-123'},
            format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['code'], 'INVALID_REQUEST')

    def test_logout_requires_csrf_and_clears_the_authenticated_session(self):
        client = APIClient(enforce_csrf_checks=True)
        csrf = client.get('/api/v1/auth/csrf/')
        self.assertEqual(csrf.status_code, 200)
        login_response = client.post(
            '/api/v1/auth/login/',
            {'username': 'platform-admin', 'password': 'A-strong-password-123', 'audience': 'PLAYER_ACCOUNT'},
            format='json',
            HTTP_X_CSRFTOKEN=csrf.data['csrf_token'],
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertTrue(client.get('/api/v1/auth/me/').data['authenticated'])

        self.assertEqual(client.post('/api/v1/auth/logout/').status_code, 403)
        csrf = client.get('/api/v1/auth/csrf/')
        self.assertEqual(client.post('/api/v1/auth/logout/', HTTP_X_CSRFTOKEN=csrf.data['csrf_token']).status_code, 200)
        self.assertFalse(client.get('/api/v1/auth/me/').data['authenticated'])

    def test_dashboard_operations_require_platform_permission_and_return_safe_user_inventory(self):
        self.assertEqual(self.client.get('/api/v1/admin/operations/users/').status_code, 403)
        self.user.user_permissions.add(Permission.objects.get(codename='manage_platform'))
        self.client.force_authenticate(self.user)
        response = self.client.get('/api/v1/admin/operations/users/')
        self.assertEqual(response.status_code, 200)
        record = next(item for item in response.data['results'] if item['username'] == 'platform-admin')
        self.assertEqual(set(record), {'id', 'username', 'active', 'display_name', 'memberships', 'platform_access'})
        self.assertNotIn('password', record)
