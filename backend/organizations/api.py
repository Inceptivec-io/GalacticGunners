from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from games.models import GameProject, OwnerScope
from levels.models import Level
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
        assignment = OrganizationPlanAssignment.objects.filter(
            organization=organization, status=OrganizationPlanAssignment.Status.ACTIVE,
        ).select_related('plan').order_by('-starts_at').first()
        maps = Level.objects.filter(game_project__organization=organization, archived=False).select_related('game_project', 'active_version').order_by('sequence')
        projects = GameProject.objects.filter(organization=organization, owner_scope=OwnerScope.ORGANIZATION, status='ACTIVE').order_by('name')
        return Response({
            'organization': {'id': str(organization.id), 'slug': organization.slug, 'name': organization.name},
            'plan': None if assignment is None else {'code': assignment.plan_snapshot.get('code'), 'limits': assignment.plan_snapshot.get('limits', {}), 'capabilities': assignment.plan_snapshot.get('capabilities', {})},
            'maps': [{'id': str(level.id), 'slug': level.slug, 'name': level.name, 'sequence': level.sequence, 'project_id': str(level.game_project_id), 'version': level.active_version.version if level.active_version else None} for level in maps],
            'projects': [{'id': str(project.id), 'slug': project.slug, 'name': project.name} for project in projects],
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
        return Response({'id': str(level.id), 'slug': level.slug, 'name': level.name, 'sequence': level.sequence}, status=201)
