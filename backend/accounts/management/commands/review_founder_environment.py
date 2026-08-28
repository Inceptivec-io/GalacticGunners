import os

from django.core.management.base import BaseCommand, CommandError
from django.test import Client


class Command(BaseCommand):
    help = 'Fail-closed product/API verification for the local Founder review environment.'

    def csrf_post(self, client, path, payload):
        token_response = client.get('/api/v1/auth/csrf/')
        if token_response.status_code != 200 or not token_response.json().get('csrf_token'):
            raise CommandError(f'CSRF issuance failed before {path}.')
        return client.post(path, payload, content_type='application/json', HTTP_X_CSRFTOKEN=token_response.json()['csrf_token'])

    def login(self, username_key, password_key, audience):
        username, password = os.environ.get(username_key), os.environ.get(password_key)
        if not username or not password:
            raise CommandError(f'{username_key} is unavailable.')
        client = Client(enforce_csrf_checks=True, HTTP_HOST='localhost')
        response = self.csrf_post(client, '/api/v1/auth/login/', {'username': username, 'password': password, 'audience': audience})
        if response.status_code != 200:
            raise CommandError(f'{audience} login failed ({response.status_code}).')
        session = client.get('/api/v1/auth/me/')
        if session.status_code != 200 or not session.json().get('authenticated'):
            raise CommandError(f'{audience} session restoration failed.')
        if audience not in session.json().get('surface_grants', []):
            raise CommandError(f'{audience} surface grant was not present.')
        return client

    def logout(self, client, audience):
        response = self.csrf_post(client, '/api/v1/auth/logout/', {})
        if response.status_code != 200 or response.json().get('authenticated'):
            raise CommandError(f'{audience} logout failed.')

    def handle(self, *args, **options):
        admin = self.login('FOUNDER_REVIEW_USERNAME', 'FOUNDER_REVIEW_PASSWORD', 'INCEPTIVEC_ADMIN')
        if admin.get('/api/v1/admin/operations/users/').status_code != 200:
            raise CommandError('Inceptivec administrator permitted route failed.')

        command_post = self.login('COMMAND_POST_REVIEW_USERNAME', 'COMMAND_POST_REVIEW_PASSWORD', 'COMMAND_POST')
        organizations = command_post.get('/api/v1/portal/organizations/')
        if organizations.status_code != 200 or not organizations.json().get('results'):
            raise CommandError('Command Post permitted organisation route failed.')
        organization_slug = organizations.json()['results'][0]['slug']
        if command_post.get(f'/api/v1/portal/organizations/{organization_slug}/').status_code != 200:
            raise CommandError('Command Post organisation workspace failed.')
        if command_post.get('/api/v1/portal/organizations/not-an-authorized-organization/').status_code != 404:
            raise CommandError('Command Post organisation isolation failed.')
        if command_post.get('/api/v1/admin/operations/users/').status_code != 403:
            raise CommandError('Command Post cross-surface administrator denial failed.')

        player = self.login('PLAYER_REVIEW_USERNAME', 'PLAYER_REVIEW_PASSWORD', 'PLAYER_ACCOUNT')
        if player.get('/api/v1/admin/operations/users/').status_code != 403:
            raise CommandError('Player cross-surface administrator denial failed.')
        denied = self.csrf_post(player, '/api/v1/auth/login/', {'username': os.environ['PLAYER_REVIEW_USERNAME'], 'password': os.environ['PLAYER_REVIEW_PASSWORD'], 'audience': 'COMMAND_POST'})
        if denied.status_code != 403 or denied.json().get('code') != 'PORTAL_ACCESS_DENIED':
            raise CommandError('Player Command Post denial failed.')

        levels = admin.get('/api/v1/levels/')
        if levels.status_code != 200 or len(levels.json()) < 6:
            raise CommandError('Published six-level campaign availability failed.')
        first_level = levels.json()[0]
        draft = self.csrf_post(admin, f"/api/v1/admin/levels/{first_level['id']}/drafts/", {'expected_checksum': first_level['active_version']['checksum'], 'config': first_level['active_version']['config']})
        if draft.status_code != 201:
            raise CommandError(f'Designer draft save failed ({draft.status_code}).')
        preview = admin.get(f"/api/v1/admin/levels/{first_level['id']}/preview/{draft.json()['checksum']}/")
        if preview.status_code != 200 or preview.json().get('checksum') != draft.json()['checksum']:
            raise CommandError('Designer draft reload/preview failed.')

        campaign = player.post('/api/v1/campaign-runs/start/', {'seed_root': 15015}, content_type='application/json')
        if campaign.status_code != 201 or campaign.json().get('entry', {}).get('position') != 1:
            raise CommandError('Campaign runtime availability failed.')
        if not levels.json()[3]['active_version']['config'].get('boarding_anchors'):
            raise CommandError('Boarding availability failed: Level 4 has no Boarding anchor.')

        for client, audience in ((admin, 'INCEPTIVEC_ADMIN'), (command_post, 'COMMAND_POST'), (player, 'PLAYER_ACCOUNT')):
            self.logout(client, audience)
        self.stdout.write(self.style.SUCCESS('Founder review gates passed: audience routes, CSRF mutations, session/logout, server denials, Designer draft/reload, tenant isolation, campaign and Boarding availability.'))
