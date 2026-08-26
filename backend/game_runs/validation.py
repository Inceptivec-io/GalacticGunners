from dataclasses import dataclass

from levels.models import LevelVersion

SCORE_VALUES = {
    'laser_target_hits': 5,
    'asteroid_kills': 10,
    'scout_kills': 25,
    'ship_kills': 50,
    'mothership_hits': 50,
    'mothership_kills': 1000,
    'comet_kills': 500,
    'shield_enemy_hits': -1,
}
MAX_DURATION_MS = 8 * 60 * 60 * 1000
MIN_DURATION_MS = 1_000


@dataclass(frozen=True)
class ValidationOutcome:
    accepted: bool
    expected_score: int
    codes: list[str]
    detail: dict


def validate_completion(run, payload):
    summary = payload['event_summary']
    codes = []
    if not isinstance(summary, dict):
        return ValidationOutcome(False, 0, ['MALFORMED_SUMMARY'], {})
    counts = {}
    for key in SCORE_VALUES:
        value = summary.get(key, 0)
        if not isinstance(value, int) or value < 0 or value > 100_000:
            codes.append('MALFORMED_SUMMARY')
            value = 0
        counts[key] = value
    expected = max(0, sum(counts[key] * points for key, points in SCORE_VALUES.items()))
    duration = payload.get('duration_ms')
    if not isinstance(duration, int) or duration < MIN_DURATION_MS or duration > MAX_DURATION_MS:
        codes.append('IMPOSSIBLE_DURATION')
    if payload['score'] != expected:
        codes.append('SCORE_ARITHMETIC_MISMATCH')
    if run.level_id:
        version = LevelVersion.objects.filter(level=run.level, version=run.level_version, status=LevelVersion.Status.PUBLISHED).first()
        if not version:
            codes.append('LEVEL_NOT_PUBLISHED')
        elif version.checksum != run.level_checksum:
            codes.append('LEVEL_CHECKSUM_MISMATCH')
        else:
            possible_scouts = sum(item.get('rows', 0) * item.get('columns', 0) for item in version.config.get('enemy_formations', []))
            if counts['scout_kills'] > possible_scouts:
                codes.append('IMPOSSIBLE_EVENT_COUNT')
    nuke_uses = summary.get('nuke_uses', 0)
    nuke_pickups = summary.get('nuke_pickups', 0)
    if not isinstance(nuke_uses, int) or not isinstance(nuke_pickups, int) or nuke_uses < 0 or nuke_pickups < 0 or nuke_uses > run.nukes_start + nuke_pickups:
        codes.append('NUKE_STATE_INVALID')
    if payload['lives_end'] > run.lives_start:
        codes.append('LIFE_STATE_INVALID')
    completed = summary.get('levels_completed', [])
    if not isinstance(completed, list) or completed != list(range(1, len(completed) + 1)):
        codes.append('CAMPAIGN_SEQUENCE_INVALID')
    return ValidationOutcome(not codes, expected, sorted(set(codes)), {'counts': counts, 'expected_score': expected})
