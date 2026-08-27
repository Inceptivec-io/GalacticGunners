from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from games.models import GameProject, OwnerScope
from organizations.models import Organization
from plans.models import OrganizationPlanAssignment, ServicePlan
from plans.services import MapQuotaError, MapQuotaService


class MapQuotaServiceTests(TestCase):
    def setUp(self):
        user = get_user_model().objects.create_user(username='quota-owner', password='strong-password-123')
        self.organization = Organization.objects.create(slug='quota-org', name='Quota Organisation', created_by=user)
        self.project = GameProject.objects.create(slug='quota-game', name='Quota Game', owner_scope=OwnerScope.ORGANIZATION, organization=self.organization, created_by=user)
        plan = ServicePlan.objects.create(code='TEST_QUOTA', display_name='Test quota', status='ACTIVE', limits={'active_map_limit': 1}, capabilities={'dual_player': 'RESERVED'})
        OrganizationPlanAssignment.objects.create(organization=self.organization, plan=plan, assigned_by=user, reason='Test allocation', starts_at=timezone.now())
        self.user = user

    def test_map_limit_is_enforced_server_side(self):
        MapQuotaService.create_map(organization=self.organization, game_project=self.project, actor=self.user, slug='map-one', name='Map One')
        with self.assertRaises(MapQuotaError) as error:
            MapQuotaService.create_map(organization=self.organization, game_project=self.project, actor=self.user, slug='map-two', name='Map Two')
        self.assertEqual((error.exception.current, error.exception.limit), (1, 1))
