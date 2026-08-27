import os

from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from accounts.models import User
from players.models import PlayerProfile


class Command(BaseCommand):
    help = 'Idempotently bootstrap the local-only Founder product-admin review account.'

    @transaction.atomic
    def handle(self, *args, **options):
        if os.environ.get('FOUNDER_REVIEW_MODE', '').lower() != 'true' or os.environ.get('DJANGO_SETTINGS_MODULE') != 'config.settings.local':
            raise CommandError('Founder review bootstrap is permitted only in explicit local review mode.')
        username = os.environ.get('FOUNDER_REVIEW_USERNAME', '').strip()
        password = os.environ.get('FOUNDER_REVIEW_PASSWORD', '')
        display_name = os.environ.get('FOUNDER_REVIEW_DISPLAY_NAME', 'Founder Review').strip()
        if not username or not password:
            raise CommandError('Founder review credentials are required.')
        user, _ = User.objects.get_or_create(username=username, defaults={'is_active': True})
        user.is_active = True
        user.is_staff = False
        user.is_superuser = False
        user.set_password(password)
        user.full_clean()
        user.save()
        PlayerProfile.objects.update_or_create(user=user, defaults={'display_name': display_name, 'status': PlayerProfile.Status.ACTIVE})
        group, _ = Group.objects.get_or_create(name='Platform Owners')
        group.permissions.add(*Permission.objects.filter(content_type__app_label='accounts', codename__in=['manage_platform', 'publish_core', 'manage_organizations', 'moderate_scores', 'view_platform_audit']))
        user.groups.add(group)
        self.stdout.write(self.style.SUCCESS('Founder review account ready.'))
