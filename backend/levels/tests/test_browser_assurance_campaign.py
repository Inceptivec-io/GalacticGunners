from django.core.management import call_command
from django.test import TestCase

from campaigns.services import CampaignService


class BrowserAssuranceCampaignTests(TestCase):
    def test_publishes_a_real_six_entry_campaign_with_time_based_objectives(self):
        call_command("seed_browser_assurance_campaign", duration_ms=250)

        run, _ = CampaignService.start(user=None, seed_root=15150)
        entries = list(run.campaign_version.entries.order_by("position"))

        self.assertEqual([entry.position for entry in entries], [1, 2, 3, 4, 5, 6])
        for entry in entries:
            objective = entry.level_version.config["objectives"]
            self.assertEqual(len(objective), 1)
            self.assertEqual(objective[0]["type"], "SURVIVE_DURATION")
            self.assertEqual(objective[0]["duration_ms"], 250)

    def test_rejects_a_duration_that_cannot_exercise_normal_browser_frames(self):
        with self.assertRaisesRegex(ValueError, "real browser frame sequence"):
            call_command("seed_browser_assurance_campaign", duration_ms=249)
