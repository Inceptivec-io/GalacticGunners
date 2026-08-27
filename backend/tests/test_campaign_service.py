from django.core.management import call_command
from django.test import TestCase

from campaigns.services import CampaignService
from plans.models import ServicePlan


class CampaignServiceTests(TestCase):
    def setUp(self):
        call_command('seed_service_plans')
        call_command('seed_runtime_authority')

    def test_seeded_campaign_is_six_entries_but_not_schema_bounded(self):
        run = CampaignService.start(user=None, seed_root=12001)
        self.assertEqual(run.current_entry.position, 1)
        self.assertEqual(run.next_entry.position, 2)
        self.assertEqual(run.campaign_version.entries.count(), 6)
        self.assertEqual(ServicePlan.objects.count(), 4)

    def test_completion_resolves_next_entry_by_identity(self):
        run = CampaignService.start(user=None, seed_root=12001)
        first_entry = run.current_entry
        completed = CampaignService.complete_entry(campaign_run=run, entry_id=first_entry.id, score=125, lives=3, nukes=2)
        self.assertEqual(completed.current_entry.position, 2)
        self.assertEqual(completed.score, 125)
