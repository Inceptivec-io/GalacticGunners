"""Bounded operational data for the protected Inceptivec dashboard."""

from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from audit.models import PlatformAuditEvent
from leaderboard.models import LeaderboardEntry, ModerationAuditEvent
from organizations.models import Organization, OrganizationMembership
from plans.models import OrganizationPlanAssignment

from .models import User


class AdminOperationsView(APIView):
    """Read-only admin inventory. Mutating operations stay on their scoped APIs."""

    def get(self, request, resource):
        if not request.user.is_authenticated or not (request.user.is_superuser or request.user.has_perm('accounts.manage_platform')):
            raise PermissionDenied('PLATFORM_ACCESS_REQUIRED')
        if resource == 'users':
            return Response({'results': [{
                'id': str(user.id), 'username': user.username, 'active': user.is_active,
                'display_name': getattr(getattr(user, 'player_profile', None), 'display_name', None),
                'memberships': user.organization_memberships.filter(status='ACTIVE').count(),
                'platform_access': bool(user.is_superuser or user.has_perm('accounts.manage_platform')),
            } for user in User.objects.prefetch_related('player_profile', 'organization_memberships').order_by('username')[:200]]})
        if resource == 'organizations':
            assignments = {}
            for item in OrganizationPlanAssignment.objects.filter(status='ACTIVE').select_related('plan').order_by('organization_id', '-starts_at'):
                assignments.setdefault(item.organization_id, item)
            return Response({'results': [{
                'id': str(organization.id), 'slug': organization.slug, 'name': organization.name, 'status': organization.status,
                'members': organization.memberships.filter(status='ACTIVE').count(),
                'plan': assignments.get(organization.id).plan_snapshot if organization.id in assignments else None,
            } for organization in Organization.objects.prefetch_related('memberships').order_by('name')[:200]]})
        if resource == 'scores':
            return Response({'results': list(LeaderboardEntry.objects.select_related('run__player').values(
                'id', 'display_name', 'score', 'visible', 'moderation_state', 'campaign_level_reached', 'accepted_at')[:200])})
        if resource == 'logs':
            events = list(PlatformAuditEvent.objects.select_related('actor', 'organization').values(
                'id', 'action', 'target_type', 'target_id', 'result', 'reason_code', 'request_at', 'actor__username', 'organization__slug')[:120])
            moderation = list(ModerationAuditEvent.objects.select_related('actor').values(
                'id', 'action', 'target', 'reason', 'created_at', 'actor__username')[:80])
            return Response({'platform_events': events, 'moderation_events': moderation})
        return Response({'code': 'UNKNOWN_RESOURCE', 'detail': 'Unknown administration resource.'}, status=404)
