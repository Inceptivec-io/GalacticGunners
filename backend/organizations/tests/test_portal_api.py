from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from assets.models import AssetCategory, AssetRecord
from django.utils import timezone

from games.models import GameProject, OwnerScope, Visibility
from organizations.models import Organization, OrganizationMembership
from plans.models import OrganizationPlanAssignment, ServicePlan
from plans.services import MapQuotaService


class PortalOrganizationScopeTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.owner = user_model.objects.create_user(username='portal-owner', password='strong-password-123')
        self.editor = user_model.objects.create_user(username='portal-editor', password='strong-password-123')
        self.other_owner = user_model.objects.create_user(username='other-owner', password='strong-password-123')
        self.organization = Organization.objects.create(slug='owned-org', name='Owned Organisation', created_by=self.owner)
        self.other_organization = Organization.objects.create(slug='other-org', name='Other Organisation', created_by=self.other_owner)
        OrganizationMembership.objects.create(
            organization=self.organization, user=self.owner,
            role=OrganizationMembership.Role.BUSINESS_ADMIN,
        )
        OrganizationMembership.objects.create(
            organization=self.organization, user=self.editor,
            role=OrganizationMembership.Role.EDITOR,
        )
        OrganizationMembership.objects.create(
            organization=self.other_organization, user=self.other_owner,
            role=OrganizationMembership.Role.BUSINESS_ADMIN,
        )
        self.project = GameProject.objects.create(
            slug='owned-project', name='Owned Project', owner_scope=OwnerScope.ORGANIZATION,
            organization=self.organization, created_by=self.owner,
        )
        plan = ServicePlan.objects.create(
            code='PORTAL_TEST', display_name='Portal test plan', status='ACTIVE',
            limits={'active_map_limit': 5}, capabilities={},
        )
        OrganizationPlanAssignment.objects.create(
            organization=self.organization, plan=plan, assigned_by=self.owner,
            reason='Portal archive test fixture', starts_at=timezone.now(),
        )
        self.map = MapQuotaService.create_map(
            organization=self.organization, game_project=self.project, actor=self.owner,
            slug='owned-map', name='Owned Map',
        )
        self.client = APIClient()

    def test_editor_gets_only_own_organisation_and_no_member_inventory(self):
        self.client.force_authenticate(self.editor)
        response = self.client.get('/api/v1/portal/organizations/owned-org/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['organization']['slug'], 'owned-org')
        self.assertEqual(response.data['effective_permissions'], ['MAP_WRITE'])
        self.assertFalse(response.data['can_manage_members'])
        self.assertEqual(response.data['members'], [])
        self.assertEqual(self.client.get('/api/v1/portal/organizations/other-org/').status_code, 404)

    def test_business_admin_receives_scoped_member_inventory(self):
        self.client.force_authenticate(self.owner)
        response = self.client.get('/api/v1/portal/organizations/owned-org/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['can_manage_members'])
        self.assertEqual({item['username'] for item in response.data['members']}, {'portal-owner', 'portal-editor'})
        self.assertNotIn('password', response.data['members'][0])

    def test_editor_can_see_shared_core_art_but_not_another_tenant_asset(self):
        category = AssetCategory.objects.create(code='ships', name='Ships', editor_mode='SHOOTER', object_type='ship')
        common = {'category': category, 'status': AssetRecord.Status.ACTIVE, 'runtime_path': '/assets/test.png', 'thumbnail_path': '/assets/test.png', 'mime_type': 'image/png', 'checksum': 'a' * 64, 'provenance_ref': 'test'}
        AssetRecord.objects.create(key='shared-scout', owner_scope=OwnerScope.CORE, visibility=Visibility.PUBLIC, **common)
        AssetRecord.objects.create(key='other-private', owner_scope=OwnerScope.ORGANIZATION, organization=self.other_organization, visibility=Visibility.PRIVATE, **{**common, 'checksum': 'b' * 64})
        self.client.force_authenticate(self.editor)
        response = self.client.get('/api/v1/assets/catalogue/?organization=owned-org/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['key'] for item in response.data['results']], ['shared-scout'])

    def test_business_admin_archives_only_own_organization_map(self):
        self.client.force_authenticate(self.owner)
        response = self.client.delete(f'/api/v1/portal/organizations/owned-org/maps/{self.map.id}/')
        self.assertEqual(response.status_code, 204)
        self.map.refresh_from_db()
        self.assertTrue(self.map.archived)

        self.client.force_authenticate(self.other_owner)
        response = self.client.delete(f'/api/v1/portal/organizations/other-org/maps/{self.map.id}/')
        self.assertEqual(response.status_code, 404)

    def test_other_tenant_cannot_create_edit_or_preview_a_foreign_map(self):
        version = self.map.versions.get(version=1)
        self.client.force_authenticate(self.other_owner)

        create = self.client.post(
            '/api/v1/portal/organizations/owned-org/maps/',
            {'project_id': str(self.project.id), 'slug': 'foreign-map', 'name': 'Foreign Map'},
            format='json',
        )
        draft = self.client.post(
            f'/api/v1/portal/organizations/owned-org/maps/{self.map.id}/drafts/',
            {'expected_checksum': version.checksum, 'config': version.config},
            format='json',
        )
        preview = self.client.get(
            f'/api/v1/portal/organizations/owned-org/maps/{self.map.id}/preview/{version.checksum}/'
        )

        self.assertEqual(create.status_code, 404)
        self.assertEqual(draft.status_code, 404)
        self.assertEqual(preview.status_code, 404)
        self.assertEqual(self.map.versions.count(), 1)
