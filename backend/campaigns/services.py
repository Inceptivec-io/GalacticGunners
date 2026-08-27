import hashlib
import secrets

from django.db import transaction
from django.utils import timezone

from game_runs.models import CampaignRun
from games.models import GameRelease, Lifecycle, OwnerScope
from .models import CampaignVersion


class CampaignService:
    @staticmethod
    @transaction.atomic
    def start(*, user, seed_root: int):
        release = GameRelease.objects.select_for_update().filter(
            game_project__owner_scope=OwnerScope.CORE,
            status=Lifecycle.PUBLISHED,
        ).order_by('-published_at').first()
        if release is None:
            raise ValueError('REVIEW_ENVIRONMENT_NOT_READY')
        campaign_version_id = release.manifest.get('campaign_version_id')
        if not campaign_version_id:
            raise ValueError('CAMPAIGN_VERSION_MISMATCH')
        try:
            campaign_version = CampaignVersion.objects.select_related('campaign').get(
                pk=campaign_version_id,
                campaign__game_project=release.game_project,
                lifecycle=Lifecycle.PUBLISHED,
            )
        except CampaignVersion.DoesNotExist as error:
            raise ValueError('CAMPAIGN_VERSION_MISMATCH') from error
        entries = list(campaign_version.entries.select_related('level_version__level').order_by('position'))
        if not entries:
            raise ValueError('CAMPAIGN_ENTRY_GAP')
        anonymous_hash = None if user and user.is_authenticated else hashlib.sha256(secrets.token_bytes(32)).hexdigest()
        campaign_run = CampaignRun.objects.create(
            game_release=release,
            campaign_version=campaign_version,
            player=user if user and user.is_authenticated else None,
            anonymous_capability_hash=anonymous_hash,
            current_entry=entries[0],
            next_entry=entries[1] if len(entries) > 1 else None,
            seed_root=seed_root,
        )
        return campaign_run

    @staticmethod
    @transaction.atomic
    def complete_entry(*, campaign_run: CampaignRun, entry_id, score: int, lives: int, nukes: int):
        campaign_run = CampaignRun.objects.select_for_update(of=('self',)).get(pk=campaign_run.pk)
        if campaign_run.status != CampaignRun.Status.ACTIVE or str(campaign_run.current_entry_id) != str(entry_id):
            raise ValueError('CAMPAIGN_ENTRY_MISMATCH')
        entries = list(campaign_run.campaign_version.entries.order_by('position'))
        completed_entry = campaign_run.current_entry
        later = next((entry for entry in entries if entry.position > completed_entry.position), None)
        campaign_run.score = max(0, score)
        campaign_run.lives = max(0, lives)
        campaign_run.nukes = max(0, nukes)
        campaign_run.completed_entry_count += 1
        campaign_run.current_entry = later
        campaign_run.next_entry = next((entry for entry in entries if later and entry.position > later.position), None)
        if later is None:
            campaign_run.status = CampaignRun.Status.COMPLETED
            campaign_run.completed_at = timezone.now()
        campaign_run.save()
        return campaign_run

    @staticmethod
    def entry_payload(campaign_run: CampaignRun):
        entry = campaign_run.current_entry
        if entry is None:
            return None
        level_version = entry.level_version
        return {
            'id': str(entry.id), 'position': entry.position, 'level': {
                'slug': level_version.level.slug, 'version': level_version.version,
                'checksum': level_version.checksum, 'definition': level_version.config,
            },
        }
