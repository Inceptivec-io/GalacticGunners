import os

from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.contrib.auth import get_user_model

from accounts.models import User
from players.models import PlayerProfile
from organizations.models import Organization, OrganizationMembership
from plans.models import OrganizationPlanAssignment, ServicePlan
from games.models import GameProject, OwnerScope, Visibility
from django.utils import timezone


class Command(BaseCommand):
    help = 'Idempotently bootstrap the local-only Founder product-admin review account.'

    @transaction.atomic
    def handle(self, *args, **options):
        if os.environ.get('FOUNDER_REVIEW_MODE', '').lower() != 'true' or os.environ.get('DJANGO_SETTINGS_MODULE') != 'config.settings.local':
            raise CommandError('Founder review bootstrap is permitted only in explicit local review mode.')
        admin_username = os.environ.get('FOUNDER_REVIEW_USERNAME', '').strip()
        admin_password = os.environ.get('FOUNDER_REVIEW_PASSWORD', '')
        command_username = os.environ.get('COMMAND_POST_REVIEW_USERNAME', '').strip()
        command_password = os.environ.get('COMMAND_POST_REVIEW_PASSWORD', '')
        player_username = os.environ.get('PLAYER_REVIEW_USERNAME', '').strip()
        player_password = os.environ.get('PLAYER_REVIEW_PASSWORD', '')
        if not all([admin_username, admin_password, command_username, command_password, player_username, player_password]):
            raise CommandError('Founder, Command Post, and player review credentials are required.')

        def review_user(username, password, display_name, player=False):
            user, _ = User.objects.get_or_create(username=username, defaults={'is_active': True})
            user.is_active = True
            user.is_staff = False
            user.is_superuser = False
            user.set_password(password)
            user.full_clean()
            user.save()
            if player:
                PlayerProfile.objects.update_or_create(user=user, defaults={'display_name': display_name, 'status': PlayerProfile.Status.ACTIVE})
            else:
                PlayerProfile.objects.filter(user=user).delete()
            return user

        user = review_user(admin_username, admin_password, os.environ.get('FOUNDER_REVIEW_DISPLAY_NAME', 'Founder Review').strip())
        command_user = review_user(command_username, command_password, os.environ.get('COMMAND_POST_REVIEW_DISPLAY_NAME', 'Command Post Review').strip(), player=True)
        review_user(player_username, player_password, os.environ.get('PLAYER_REVIEW_DISPLAY_NAME', 'Player Review').strip(), player=True)
        group, _ = Group.objects.get_or_create(name='Platform Owners')
        group.permissions.add(*Permission.objects.filter(content_type__app_label='accounts', codename__in=['manage_platform', 'publish_core', 'manage_organizations', 'moderate_scores', 'view_platform_audit']))
        user.groups.add(group)
        organization, _ = Organization.objects.get_or_create(
            slug=os.environ.get('COMMAND_POST_REVIEW_ORGANIZATION_SLUG', 'founder-demo'), defaults={'name': 'Founder Demo Organisation', 'created_by': user},
        )
        OrganizationMembership.objects.filter(organization=organization, user=user).delete()
        OrganizationMembership.objects.update_or_create(
            organization=organization, user=command_user,
            defaults={'role': OrganizationMembership.Role.BUSINESS_ADMIN, 'status': OrganizationMembership.Status.ACTIVE, 'created_by': user},
        )
        plan = ServicePlan.objects.filter(code='SPACE_CADET', status=ServicePlan.Status.ACTIVE).first()
        if plan:
            OrganizationPlanAssignment.objects.get_or_create(
                organization=organization, status=OrganizationPlanAssignment.Status.ACTIVE,
                defaults={'plan': plan, 'assigned_by': user, 'starts_at': timezone.now(), 'reason': 'Founder local review fixture'},
            )
        GameProject.objects.get_or_create(
            slug='founder-demo-campaign', owner_scope=OwnerScope.ORGANIZATION, organization=organization, owner_user=None,
            defaults={'name': 'Founder Demo Campaign', 'visibility': Visibility.ORGANIZATION, 'created_by': user},
        )
        superuser_name = os.environ.get('DJANGO_LOCAL_SUPERUSER_USERNAME', '').strip()
        superuser_password = os.environ.get('DJANGO_LOCAL_SUPERUSER_PASSWORD', '')
        if bool(superuser_name) != bool(superuser_password):
            raise CommandError('Local Django superuser username and password must be supplied together.')
        if superuser_name:
            technical, _ = get_user_model().objects.get_or_create(username=superuser_name)
            technical.is_active = True
            technical.is_staff = True
            technical.is_superuser = True
            technical.set_password(superuser_password)
            technical.save()
        self.stdout.write(self.style.SUCCESS('Founder review account ready.'))
