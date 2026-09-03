"""Create a short-lived published campaign solely for browser-assurance runs.

The command is deliberately opt-in and is only invoked against the ephemeral
CI database. It keeps the browser on the normal same-origin campaign API while
using real time-based objectives instead of privileged runtime controls.
"""

import copy

from django.contrib.auth import get_user_model
from django.core.management import BaseCommand, call_command

from campaigns.publication import publish_core_level
from games.models import GameProject, OwnerScope
from levels.models import LevelVersion


class Command(BaseCommand):
    help = "Publish a deterministic six-level browser-assurance campaign."

    def add_arguments(self, parser):
        parser.add_argument("--duration-ms", type=int, default=900)
        parser.add_argument(
            "--scenario",
            choices=("campaign", "boarding", "hazards"),
            default="campaign",
            help="Ephemeral browser fixture; never used by normal product runtime.",
        )

    @staticmethod
    def _boarding_fixture(config, duration_ms):
        """Keep normal input while making the Level 4 offer physically reachable."""
        anchor = config["boarding_anchors"][0]
        source_id = anchor["source_entity_id"]
        source = next(entity for entity in config["entities"] if entity["id"] == source_id)
        source.update({"x": 640, "y": 220, "behaviour_profile": "enemy.cruiser.standard"})
        config["entities"] = [source]
        formation = next(item for item in config["formations"] if source_id in item["member_ids"])
        formation.update({
            "member_ids": [source_id],
            "bounds": {"x": 640, "y": 220, "width": 0, "height": 0},
            "motion_profile": "formation.standard",
        })
        config["formations"] = [formation]
        config["shield_structures"] = []
        config["hazard_emitters"] = []
        config["objectives"] = [{
            "id": "browser-assurance-level-04-open",
            "type": "SURVIVE_DURATION",
            "required": True,
            "target_entity_ids": [],
            "duration_ms": max(duration_ms, 30_000),
        }]
        return config

    @staticmethod
    def _hazard_fixture(config, duration_ms):
        """Keep normal input while making Level 4 hazard interactions observable."""
        scout = next(
            entity for entity in config["entities"]
            if entity["entity_type"] == "SCOUT"
        )
        scout.update({"x": 180, "y": 120, "behaviour_profile": "enemy.scout.standard"})
        config["entities"] = [scout]
        config["formations"] = [{
            "id": "browser-assurance-hazard-scout",
            "name": "Hazard fixture scout",
            "layout": "FREEFORM",
            "bounds": {"x": 180, "y": 120, "width": 0, "height": 0},
            "member_ids": [scout["id"]],
            "motion_profile": "formation.standard",
            "entry_delay_ms": 0,
            "repeat": 0,
        }]
        config["shield_structures"] = []
        config["boarding_anchors"] = []
        config["hazard_emitters"] = [{
            "id": "browser-assurance-comet",
            "hazard_type": "COMET",
            "asset_id": "hazard.comet",
            "variant_mode": "FIXED",
            "variant_ids": ["COMET_VARIANT_02"],
            "enabled": True,
            "initial_count": 1,
            "maximum_active": 1,
            "spawn_interval_ms": 30000,
            "spawn_jitter_ms": 0,
            "speed_min": 90,
            "speed_max": 90,
            "angular_velocity_min": 0,
            "angular_velocity_max": 0,
            "entry_edges": ["BOTTOM"],
            "spawn_pattern": "FIXED_POINTS",
            # The ordinary browser fixture uses the player's centre firing lane.
            # The comet travels upward from ahead of the ship, so a normally
            # fired upward laser must resolve the authored hazard collision.
            "spawn_points": [{"x": 640, "y": 480}],
            "despawn_margin": 64,
            "collision_damage": 1,
        }]
        config["objectives"] = [{
            "id": "browser-assurance-level-04-hazards",
            "type": "SURVIVE_DURATION",
            "required": True,
            "target_entity_ids": [],
            "duration_ms": max(duration_ms, 30000),
        }]
        return config

    def handle(self, *args, **options):
        duration_ms = options["duration_ms"]
        scenario = options["scenario"]
        if duration_ms < 250:
            raise ValueError("--duration-ms must allow a real browser frame sequence.")

        call_command("seed_runtime_authority")
        project = GameProject.objects.get(
            slug="galactic-gunners-core", owner_scope=OwnerScope.CORE
        )
        actor = get_user_model().objects.get(username="platform-system")
        levels = list(project.levels.select_related("active_version").order_by("sequence"))
        if [level.sequence for level in levels] != list(range(1, 7)):
            raise RuntimeError("The browser-assurance campaign requires the six-level CORE baseline.")

        for level in levels:
            source = level.active_version
            if source is None:
                raise RuntimeError(f"CORE level {level.sequence} has no active version.")
            config = copy.deepcopy(source.config)
            config["name"] = f"Browser Assurance {level.sequence}"
            config["objectives"] = [
                {
                    "id": f"browser-assurance-survive-{level.sequence}",
                    "type": "SURVIVE_DURATION",
                    "required": True,
                    "target_entity_ids": [],
                    "duration_ms": max(duration_ms, 1_500)
                    if scenario == "boarding" and level.sequence < 4
                    else duration_ms,
                }
            ]
            if scenario == "boarding" and level.sequence == 4:
                config = self._boarding_fixture(config, duration_ms)
            elif scenario == "hazards" and level.sequence == 4:
                config = self._hazard_fixture(config, duration_ms)
            version = LevelVersion.objects.create(
                level=level,
                version=level.versions.order_by("-version").first().version + 1,
                config=config,
                status=LevelVersion.Status.VALIDATED,
                supersedes=source,
            )
            version.publish()

        publish_core_level(level=levels[-1], version=levels[-1].active_version, actor=actor)
        self.stdout.write(
            self.style.SUCCESS(
                f"Published browser-assurance {scenario} campaign with {duration_ms}ms objectives."
            )
        )
