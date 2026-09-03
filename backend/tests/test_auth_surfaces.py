import os
from unittest.mock import patch

from django.contrib.auth.models import Permission
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase
from rest_framework.test import APIClient, APIRequestFactory
from rest_framework.views import APIView

from accounts.api import AuthenticationThrottle
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

    def test_login_throttle_scopes_attempts_to_the_normalized_account_and_client(self):
        factory = APIRequestFactory()
        view = APIView()

        def cache_key(username, remote_addr='203.0.113.11'):
            request = factory.post(
                '/api/v1/auth/login/',
                {'username': username},
                format='json',
                REMOTE_ADDR=remote_addr,
            )
            return AuthenticationThrottle().get_cache_key(view.initialize_request(request), None)

        self.assertEqual(cache_key('  PLATFORM-ADMIN  '), cache_key('platform-admin'))
        self.assertNotEqual(cache_key('platform-admin'), cache_key('command-post-review'))
        self.assertNotEqual(
            cache_key('platform-admin'),
            cache_key('platform-admin', '203.0.113.12'),
        )

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

    def test_founder_review_bootstrap_fails_closed_for_retained_volume_display_name_drift(self):
        environment = {
            'FOUNDER_REVIEW_MODE': 'true',
            'DJANGO_SETTINGS_MODULE': 'config.settings.local',
            'FOUNDER_REVIEW_USERNAME': 'review-admin',
            'FOUNDER_REVIEW_PASSWORD': 'Review-admin-password-123',
            'COMMAND_POST_REVIEW_USERNAME': 'review-command',
            'COMMAND_POST_REVIEW_PASSWORD': 'Review-command-password-123',
            'COMMAND_POST_REVIEW_DISPLAY_NAME': 'Platform Admin',
            'PLAYER_REVIEW_USERNAME': 'review-player',
            'PLAYER_REVIEW_PASSWORD': 'Review-player-password-123',
        }
        with patch.dict(os.environ, environment, clear=False):
            with self.assertRaisesRegex(CommandError, 'Founder review credential drift'):
                call_command('bootstrap_founder_review')
        self.assertFalse(User.objects.filter(username='review-command').exists())

    def test_founder_review_bootstrap_retains_existing_credentials(self):
        environment = {
            'FOUNDER_REVIEW_MODE': 'true',
            'DJANGO_SETTINGS_MODULE': 'config.settings.local',
            'FOUNDER_REVIEW_USERNAME': 'review-admin',
            'FOUNDER_REVIEW_PASSWORD': 'Initial-review-password-123',
            'COMMAND_POST_REVIEW_USERNAME': 'review-command',
            'COMMAND_POST_REVIEW_PASSWORD': 'Initial-command-password-123',
            'COMMAND_POST_REVIEW_DISPLAY_NAME': 'Command Post Review',
            'PLAYER_REVIEW_USERNAME': 'review-player',
            'PLAYER_REVIEW_PASSWORD': 'Initial-player-password-123',
            'PLAYER_REVIEW_DISPLAY_NAME': 'Player Review',
        }
        with patch.dict(os.environ, environment, clear=False):
            call_command('bootstrap_founder_review')
        founder = User.objects.get(username='review-admin')
        original_hash = founder.password

        environment['FOUNDER_REVIEW_PASSWORD'] = 'Unexpected-replacement-password-123'
        with patch.dict(os.environ, environment, clear=False):
            call_command('bootstrap_founder_review')

        founder.refresh_from_db()
        self.assertEqual(founder.password, original_hash)
        self.assertTrue(founder.check_password('Initial-review-password-123'))
        self.assertFalse(founder.check_password('Unexpected-replacement-password-123'))
