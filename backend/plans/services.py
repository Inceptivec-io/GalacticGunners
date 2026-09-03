from django.db import transaction
from django.utils import timezone

from audit.models import PlatformAuditEvent
from games.models import OwnerScope
from levels.models import Level
from levels.models import LevelVersion
from levels.authoring import blank_authoring_document
from organizations.models import Organization

from .models import OrganizationPlanAssignment


class MapQuotaError(Exception):
    def __init__(self, current, limit):
        super().__init__('MAP_LIMIT_REACHED')
        self.current = current
        self.limit = limit


class MapQuotaService:
    @staticmethod
    @transaction.atomic
    def create_map(*, organization, game_project, actor, slug, name, campaign='custom', sequence=1):
        organization = Organization.objects.select_for_update().get(pk=organization.pk)
        if game_project.owner_scope != OwnerScope.ORGANIZATION or game_project.organization_id != organization.id:
            raise PermissionError('PORTAL_ACCESS_DENIED')
        assignment = OrganizationPlanAssignment.objects.select_for_update().select_related('plan').filter(
            organization=organization, status=OrganizationPlanAssignment.Status.ACTIVE,
            starts_at__lte=timezone.now(),
        ).order_by('-starts_at').first()
        if assignment is None:
            raise PermissionError('PLAN_REQUIRED')
        limit = assignment.plan_snapshot.get('limits', {}).get('active_map_limit')
        if not isinstance(limit, int):
            raise PermissionError('PLAN_REQUIRED')
        current = Level.objects.select_for_update().filter(game_project__organization=organization, game_project__owner_scope=OwnerScope.ORGANIZATION, archived=False).count()
        if current >= limit:
            raise MapQuotaError(current, limit)
        level = Level.objects.create(slug=slug, name=name, campaign=campaign, sequence=sequence, game_project=game_project)
        config = blank_authoring_document(identifier=str(level.id), slug=slug, name=name, sequence=sequence, seed=int(level.id.int % 2_000_000_000))
        LevelVersion.objects.create(level=level, version=1, config=config, created_by=actor)
        PlatformAuditEvent.objects.create(actor=actor, actor_kind=PlatformAuditEvent.ActorKind.USER, organization=organization, action='map.create', target_type='Level', target_id=str(level.id), result=PlatformAuditEvent.Result.SUCCESS)
        return level
