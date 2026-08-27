import os

from django.core.management.base import BaseCommand, CommandError
from django.test import Client


class Command(BaseCommand):
    help = 'Verify the generated local Founder review identities and browser API contract.'

    def post(self, client, path, payload):
        token = client.get('/api/v1/auth/csrf/').json()['csrf_token']
        return client.post(path, payload, content_type='application/json', HTTP_X_CSRFTOKEN=token)

    def handle(self, *args, **options):
        identities = [
            ('FOUNDER_REVIEW_USERNAME', 'FOUNDER_REVIEW_PASSWORD', 'INCEPTIVEC_ADMIN', 'INCEPTIVEC_ADMIN'),
            ('COMMAND_POST_REVIEW_USERNAME', 'COMMAND_POST_REVIEW_PASSWORD', 'COMMAND_POST', 'COMMAND_POST'),
            ('PLAYER_REVIEW_USERNAME', 'PLAYER_REVIEW_PASSWORD', 'PLAYER_ACCOUNT', 'PLAYER_ACCOUNT'),
        ]
        for username_key, password_key, audience, expected_grant in identities:
            username, password = os.environ.get(username_key), os.environ.get(password_key)
            if not username or not password:
                raise CommandError(f'{username_key} is unavailable.')
            client = Client(enforce_csrf_checks=True)
            response = self.post(client, '/api/v1/auth/login/', {'username': username, 'password': password, 'audience': audience})
            if response.status_code != 200 or expected_grant not in response.json().get('surface_grants', []):
                raise CommandError(f'{audience} login verification failed.')
            if client.get('/api/v1/auth/me/').status_code != 200:
                raise CommandError(f'{audience} session restoration failed.')
            if self.post(client, '/api/v1/auth/logout/', {}).status_code != 200:
                raise CommandError(f'{audience} logout verification failed.')
        player = Client(enforce_csrf_checks=True)
        denied = self.post(player, '/api/v1/auth/login/', {
            'username': os.environ['PLAYER_REVIEW_USERNAME'], 'password': os.environ['PLAYER_REVIEW_PASSWORD'], 'audience': 'COMMAND_POST',
        })
        if denied.status_code != 403 or denied.json().get('code') != 'PORTAL_ACCESS_DENIED':
            raise CommandError('Cross-surface denial verification failed.')
        self.stdout.write(self.style.SUCCESS('Founder review identity, CSRF, session, logout, and denial checks passed.'))
