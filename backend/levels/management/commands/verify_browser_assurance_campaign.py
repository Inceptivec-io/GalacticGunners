"""Fail closed when a browser command is about to use the wrong assurance fixture."""

from django.core.management import BaseCommand, CommandError

from campaigns.services import CampaignService


class Command(BaseCommand):
    help = "Verify the active browser-assurance campaign matches its declared scenario."

    def add_arguments(self, parser):
        parser.add_argument("--duration-ms", required=True, type=int)
        parser.add_argument(
            "--scenario",
            choices=("campaign", "boarding", "hazards"),
            default="campaign",
        )

    def handle(self, *args, **options):
        duration_ms = options["duration_ms"]
        scenario = options["scenario"]
        run, _ = CampaignService.start(user=None, seed_root=15150)
        entries = list(run.campaign_version.entries.order_by("position"))
        if len(entries) != 6:
            raise CommandError("Browser assurance campaign must contain exactly six entries.")

        for sequence, entry in enumerate(entries, start=1):
            config = entry.level_version.config
            objective = config.get("objectives", [])
            expected_duration = (
                1_500
                if scenario == "boarding" and sequence < 4
                else duration_ms
            )
            if sequence == 4 and scenario in {"boarding", "hazards"}:
                expected_duration = max(duration_ms, 30_000)
            if config.get("name") != f"Browser Assurance {sequence}":
                raise CommandError(f"Entry {sequence} is not the declared browser-assurance fixture.")
            if len(objective) != 1 or objective[0].get("type") != "SURVIVE_DURATION":
                raise CommandError(f"Entry {sequence} does not have its required time objective.")
            if objective[0].get("duration_ms") != expected_duration:
                raise CommandError(
                    f"Entry {sequence} duration does not match {scenario}: "
                    f"expected {expected_duration}ms."
                )

        level_four = entries[3].level_version.config
        if scenario == "boarding":
            if len(level_four.get("entities", [])) != 1 or not level_four.get("boarding_anchors"):
                raise CommandError("Boarding scenario is missing its reachable boarding anchor.")
        elif scenario == "hazards":
            emitters = level_four.get("hazard_emitters", [])
            if len(emitters) != 1 or emitters[0].get("hazard_type") != "COMET":
                raise CommandError("Hazards scenario is missing its governed comet emitter.")
        elif level_four.get("name") != "Browser Assurance 4":
            raise CommandError("Campaign scenario was replaced by a specialised Level 4 fixture.")

        self.stdout.write(self.style.SUCCESS(f"Verified browser-assurance {scenario} fixture."))
