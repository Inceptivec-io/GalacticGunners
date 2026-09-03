from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.test import TestCase
from copy import deepcopy
from rest_framework.test import APIClient

from campaigns.models import Campaign
from campaigns.publication import publish_core_level
from campaigns.services import CampaignService
from levels.models import Level, LevelVersion
from plans.models import ServicePlan


class CampaignServiceTests(TestCase):
    def setUp(self):
        call_command('seed_service_plans')
        call_command('seed_runtime_authority')
        self.publisher = get_user_model().objects.create_user(username='campaign-publisher', password='test-only-password')

    def test_seeded_campaign_is_six_entries_but_not_schema_bounded(self):
        run, capability = CampaignService.start(user=None, seed_root=12001)
        self.assertTrue(capability)
        self.assertEqual(run.current_entry.position, 1)
        self.assertEqual(run.next_entry.position, 2)
        self.assertEqual(run.campaign_version.entries.count(), 6)
        self.assertEqual(ServicePlan.objects.count(), 4)
        definitions = [entry.level_version.config for entry in run.campaign_version.entries.order_by('position')]
        self.assertEqual(len({item['slug'] for item in definitions}), 6)
        self.assertTrue(all(item['schema_version'] == '1.1' for item in definitions))
        self.assertTrue(definitions[1]['hazard_emitters'])
        self.assertTrue(definitions[3]['boarding_anchors'])
        self.assertEqual(sum(item['entity_type'] == 'SCOUT' for item in definitions[0]['entities']), 58)
        self.assertEqual(sum(sum(row) for shield in definitions[0]['shield_structures'] for row in shield['matrix']), 256)
        self.assertEqual(
            [
                sum(item['entity_type'] == entity_type for item in definitions[5]['entities'])
                for entity_type in ('SCOUT', 'CRUISER', 'DESTROYER', 'MOTHERSHIP')
            ],
            [18, 10, 6, 1],
        )

    def test_completion_resolves_next_entry_by_identity(self):
        run, capability = CampaignService.start(user=None, seed_root=12001)
        first_entry = run.current_entry
        completed = CampaignService.complete_entry(campaign_run=run, user=None, capability=capability, entry_id=first_entry.id, score=125, lives=3, nukes=2)
        self.assertEqual(completed.current_entry.position, 2)
        self.assertEqual(completed.score, 125)

    def test_anonymous_completion_requires_its_capability(self):
        run, _capability = CampaignService.start(user=None, seed_root=12001)
        with self.assertRaisesRegex(PermissionError, 'CAMPAIGN_CAPABILITY_INVALID'):
            CampaignService.complete_entry(campaign_run=run, user=None, capability='wrong', entry_id=run.current_entry_id, score=0, lives=3, nukes=2)

    def test_game_run_is_bound_to_the_current_campaign_entry_and_resources(self):
        run, capability = CampaignService.start(user=None, seed_root=12001)
        entry = run.current_entry
        level_version = entry.level_version
        response = APIClient().post('/api/v1/game-runs/', {
            'game_version': 'v1.0-s001-l1-slice',
            'client_type': 'web',
            'level_slug': level_version.level.slug,
            'level_version': level_version.version,
            'level_checksum': level_version.checksum,
            'seed': 12001,
            'campaign_run_id': str(run.id),
            'campaign_entry_id': str(entry.id),
        }, format='json', HTTP_X_CAMPAIGN_TOKEN=capability)
        self.assertEqual(response.status_code, 201)
        attempt = run.attempts.get(pk=response.data['id'])
        self.assertEqual((attempt.campaign_run_id, attempt.campaign_entry_id), (run.id, entry.id))
        self.assertEqual((attempt.lives_start, attempt.nukes_start), (run.lives, run.nukes))

    def test_publication_accepts_a_seven_level_gap_free_core_campaign(self):
        source = Level.objects.get(slug='level-06')
        config = deepcopy(source.active_version.config)
        config.update({'id': 'level-07', 'slug': 'level-07', 'name': 'Expansion Assault', 'sequence': 7, 'seed': 12007})
        level = Level.objects.create(slug='level-07', name='Expansion Assault', sequence=7, game_project=source.game_project)
        version = LevelVersion.objects.create(level=level, version=1, config=config, status=LevelVersion.Status.DRAFT, created_by=self.publisher)
        release = publish_core_level(level=level, version=version, actor=self.publisher)
        self.assertIsNotNone(release)
        campaign = Campaign.objects.get(game_project=source.game_project, slug='core-campaign')
        self.assertEqual(campaign.versions.order_by('-version').first().entries.count(), 7)

    def test_publication_rejects_a_gapped_core_campaign(self):
        source = Level.objects.get(slug='level-06')
        config = deepcopy(source.active_version.config)
        config.update({'id': 'level-08', 'slug': 'level-08', 'name': 'Gapped Assault', 'sequence': 8, 'seed': 12008})
        level = Level.objects.create(slug='level-08', name='Gapped Assault', sequence=8, game_project=source.game_project)
        version = LevelVersion.objects.create(level=level, version=1, config=config, status=LevelVersion.Status.DRAFT, created_by=self.publisher)
        self.assertIsNone(publish_core_level(level=level, version=version, actor=self.publisher))
