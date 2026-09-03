from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from games.models import GameProject, OwnerScope
from game_runs.models import GameRun
from audit.models import PlatformAuditEvent
from levels.models import Level, LevelVersion
from levels.serializers import LevelVersionSerializer
from levels.validation import validate_definition
from plans.models import OrganizationPlanAssignment

from .models import Organization
from .policy import AuthorizationPolicy


def organization_for(request, slug):
    try:
        organization = Organization.objects.get(slug__iexact=slug, status=Organization.Status.ACTIVE)
    except Organization.DoesNotExist as error:
        raise NotFound('Organization not found.') from error
    if not AuthorizationPolicy.can_access_organization(request.user, organization):
        # Do not disclose whether a guessed customer slug exists.
        raise NotFound('Organization not found.')
    return organization


class PortalOrganizationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        memberships = request.user.organization_memberships.filter(
            status='ACTIVE', organization__status=Organization.Status.ACTIVE,
        ).select_related('organization')
        return Response({'results': [
            {'slug': item.organization.slug, 'name': item.organization.name, 'role': item.role}
            for item in memberships
        ]})


class PortalOrganizationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        organization = organization_for(request, slug)
        membership = AuthorizationPolicy.membership(request.user, organization)
        assignment = OrganizationPlanAssignment.objects.filter(
            organization=organization, status=OrganizationPlanAssignment.Status.ACTIVE,
        ).select_related('plan').order_by('-starts_at').first()
        maps = Level.objects.filter(game_project__organization=organization, archived=False).select_related('game_project', 'active_version').prefetch_related('versions').order_by('sequence')
        projects = GameProject.objects.filter(organization=organization, owner_scope=OwnerScope.ORGANIZATION, status='ACTIVE').order_by('name')
        can_manage_members = AuthorizationPolicy.is_platform_owner(request.user) or bool(
            membership and membership.role == 'BUSINESS_ADMIN'
        )
        member_records = []
        if can_manage_members:
            member_records = [{
                'id': str(item.id), 'username': item.user.username, 'role': item.role,
                'status': item.status,
            } for item in organization.memberships.select_related('user').order_by('user__username')]
        score_records = list(GameRun.objects.filter(
            level__game_project__organization=organization,
            level__game_project__owner_scope=OwnerScope.ORGANIZATION,
            completed_at__isnull=False,
        ).select_related('player').order_by('-score', '-completed_at').values(
            'id', 'score', 'validity', 'victory', 'level__name', 'player__username', 'completed_at',
        )[:100])
        return Response({
            'organization': {'id': str(organization.id), 'slug': organization.slug, 'name': organization.name},
            'effective_permissions': ['MAP_WRITE'] if (
                AuthorizationPolicy.is_platform_owner(request.user)
                or bool(membership and membership.role in {'BUSINESS_ADMIN', 'EDITOR'})
            ) else [],
            'plan': None if assignment is None else {'code': assignment.plan_snapshot.get('code'), 'limits': assignment.plan_snapshot.get('limits', {}), 'capabilities': assignment.plan_snapshot.get('capabilities', {})},
            'maps': [{
                'id': str(level.id), 'slug': level.slug, 'name': level.name, 'sequence': level.sequence,
                'project_id': str(level.game_project_id), 'version': level.active_version.version if level.active_version else None,
                'active_version': None if level.active_version is None else LevelVersionSerializer(level.active_version).data,
                'editable_version': LevelVersionSerializer(level.versions.order_by('-version').first()).data if level.versions.exists() else None,
            } for level in maps],
            'projects': [{'id': str(project.id), 'slug': project.slug, 'name': project.name} for project in projects],
            'members': member_records,
            'can_manage_members': can_manage_members,
            'scores': score_records,
        })


class PortalMapCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        organization = organization_for(request, slug)
        membership = AuthorizationPolicy.membership(request.user, organization)
        if not AuthorizationPolicy.is_platform_owner(request.user) and (membership is None or membership.role not in {'BUSINESS_ADMIN', 'EDITOR'}):
            raise PermissionDenied('PORTAL_ACCESS_DENIED')
        project_id = request.data.get('project_id')
        project = GameProject.objects.filter(pk=project_id, organization=organization, owner_scope=OwnerScope.ORGANIZATION, status='ACTIVE').first()
        if project is None:
            raise NotFound('Project not found.')
        from plans.services import MapQuotaError, MapQuotaService
        try:
            level = MapQuotaService.create_map(
                organization=organization, game_project=project, actor=request.user,
                slug=str(request.data.get('slug', '')).strip(), name=str(request.data.get('name', '')).strip(),
                sequence=int(request.data.get('sequence', 1)),
            )
        except MapQuotaError as error:
            return Response({'code': 'MAP_LIMIT_REACHED', 'current': error.current, 'limit': error.limit}, status=409)
        except PermissionError as error:
            raise PermissionDenied(str(error)) from error
        return Response({'id': str(level.id), 'slug': level.slug, 'name': level.name, 'sequence': level.sequence}, status=201)


class PortalMapArchiveView(APIView):
    """Archive an organisation-owned map without destroying its version history."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, slug, level_id):
        organization = organization_for(request, slug)
        membership = AuthorizationPolicy.membership(request.user, organization)
        if not AuthorizationPolicy.is_platform_owner(request.user) and (membership is None or membership.role not in {'BUSINESS_ADMIN', 'EDITOR'}):
            raise PermissionDenied('PORTAL_ACCESS_DENIED')
        level = Level.objects.filter(
            pk=level_id,
            game_project__organization=organization,
            game_project__owner_scope=OwnerScope.ORGANIZATION,
            archived=False,
        ).first()
        if level is None:
            raise NotFound('Map not found.')
        level.archived = True
        level.save(update_fields=['archived', 'updated_at'])
        PlatformAuditEvent.objects.create(
            actor=request.user,
            actor_kind=PlatformAuditEvent.ActorKind.USER,
            organization=organization,
            action='map.archive',
            target_type='Level',
            target_id=str(level.id),
            result=PlatformAuditEvent.Result.SUCCESS,
        )
        return Response(status=204)


class PortalMapDraftView(APIView):
    """Organisation-scoped analogue of the internal draft endpoint; ownership is never client supplied."""

    permission_classes = [IsAuthenticated]

    def post(self, request, slug, level_id):
        organization = organization_for(request, slug)
        membership = AuthorizationPolicy.membership(request.user, organization)
        if not AuthorizationPolicy.is_platform_owner(request.user) and (membership is None or membership.role not in {'BUSINESS_ADMIN', 'EDITOR'}):
            raise PermissionDenied('PORTAL_ACCESS_DENIED')
        level = Level.objects.filter(pk=level_id, game_project__organization=organization, game_project__owner_scope=OwnerScope.ORGANIZATION, archived=False).first()
        if level is None:
            raise NotFound('Map not found.')
        base = level.versions.order_by('-version').first()
        expected_checksum = request.data.get('expected_checksum')
        if base is None or expected_checksum != base.checksum:
            return Response({'code': 'VERSION_CONFLICT', 'detail': 'Reload the latest map version before saving.', 'checksum': base.checksum if base else None}, status=409)
        config = request.data.get('config')
        validate_definition(config)
        draft = LevelVersion.objects.create(level=level, version=base.version + 1, config=config, seed_policy=base.seed_policy, created_by=request.user, supersedes=base)
        return Response(LevelVersionSerializer(draft).data, status=201)


class PortalMapPreviewView(APIView):
    """Tenant-scoped exact-version preview. A guessed checksum never crosses organisations."""

    permission_classes = [IsAuthenticated]

    def get(self, request, slug, level_id, checksum_value):
        organization = organization_for(request, slug)
        membership = AuthorizationPolicy.membership(request.user, organization)
        if not AuthorizationPolicy.is_platform_owner(request.user) and (membership is None or membership.role not in {'BUSINESS_ADMIN', 'EDITOR'}):
            raise PermissionDenied('PORTAL_ACCESS_DENIED')
        version = LevelVersion.objects.filter(
            level_id=level_id, level__game_project__organization=organization,
            level__game_project__owner_scope=OwnerScope.ORGANIZATION, level__archived=False,
            checksum=checksum_value,
        ).order_by('-version').first()
        if version is None:
            raise NotFound('Map preview not found.')
        return Response(LevelVersionSerializer(version).data)
