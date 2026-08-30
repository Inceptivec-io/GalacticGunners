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

    def test_boarding_scenario_uses_a_reachable_level_four_target_without_runtime_hooks(self):
        call_command("seed_browser_assurance_campaign", duration_ms=250, scenario="boarding")

        run, _ = CampaignService.start(user=None, seed_root=15150)
        entries = list(run.campaign_version.entries.order_by("position"))
        level_four = entries[3].level_version.config
        self.assertEqual(len(level_four["entities"]), 1)
        self.assertEqual(level_four["entities"][0]["x"], 640)
        self.assertEqual(level_four["entities"][0]["y"], 220)
        self.assertEqual(level_four["boarding_anchors"][0]["source_entity_id"], level_four["entities"][0]["id"])
        self.assertEqual(level_four["shield_structures"], [])
        self.assertEqual(level_four["hazard_emitters"], [])
        self.assertGreaterEqual(level_four["objectives"][0]["duration_ms"], 30000)
        self.assertEqual(entries[0].level_version.config["objectives"][0]["duration_ms"], 1500)
