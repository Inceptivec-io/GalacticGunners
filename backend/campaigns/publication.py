"""Atomic CORE campaign publication from immutable level revisions."""
from django.db import transaction
from django.utils import timezone

from games.models import GameRelease, Lifecycle, OwnerScope
from levels.models import LevelVersion
from .models import Campaign, CampaignEntry, CampaignVersion


@transaction.atomic
def publish_core_level(*, level, version: LevelVersion, actor):
    """Publish one CORE level and a fresh release containing every CORE level.

    Runs pin their existing campaign version; only subsequently started campaigns
    resolve this release.
    """
    if level.game_project.owner_scope != OwnerScope.CORE:
        version.publish()
        return None

    if version.status != LevelVersion.Status.PUBLISHED:
        version.publish()
    project = level.game_project
    levels = list(project.levels.filter(archived=False).select_related('active_version').order_by('sequence'))
    sequences = [item.sequence for item in levels]
    if (
        len(levels) < 6
        or any(item.active_version is None for item in levels)
        or sequences != list(range(1, len(levels) + 1))
    ):
        # Early authoring can legitimately publish a level before the complete
        # CORE campaign exists; it cannot manufacture a partial, duplicate, or
        # gapped release. The six-level baseline is a minimum, not a ceiling.
        return None
    campaign, _ = Campaign.objects.get_or_create(
        game_project=project, slug='core-campaign',
        defaults={'name': 'Galactic Gunners CORE Campaign', 'created_by': actor},
    )
    next_version = (campaign.versions.order_by('-version').values_list('version', flat=True).first() or 0) + 1
    campaign_version = CampaignVersion.objects.create(campaign=campaign, version=next_version, created_by=actor)
    for position, item in enumerate(levels, start=1):
        CampaignEntry.objects.create(campaign_version=campaign_version, position=position, level_version=item.active_version)
    campaign_version.lifecycle = Lifecycle.PUBLISHED
    campaign_version.published_by = actor
    campaign_version.published_at = timezone.now()
    campaign_version.save()
    GameRelease.objects.filter(game_project=project, status=Lifecycle.PUBLISHED).update(status=Lifecycle.SUPERSEDED)
    release = GameRelease.objects.create(
        game_project=project, version=f'core-{campaign_version.version}', status=Lifecycle.PUBLISHED,
        manifest={'campaign_version_id': str(campaign_version.id), 'campaign_checksum': campaign_version.checksum},
        created_by=actor, published_by=actor, published_at=timezone.now(),
    )
    return release
