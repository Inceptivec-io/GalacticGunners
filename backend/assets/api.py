from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from games.models import OwnerScope, Visibility
from organizations.models import OrganizationMembership

from .models import AssetRecord


class AssetCatalogueView(APIView):
    """Return only catalogue records that the current editor may lawfully inspect."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        organization_slug = request.query_params.get('organization')
        assets = AssetRecord.objects.filter(status=AssetRecord.Status.ACTIVE).select_related('category', 'organization')
        if request.user.is_superuser or request.user.has_perm('accounts.manage_platform'):
            pass
        elif organization_slug:
            assets = assets.filter(
                Q(owner_scope=OwnerScope.CORE, visibility=Visibility.PUBLIC)
                | Q(
                    owner_scope=OwnerScope.ORGANIZATION,
                    organization__slug=organization_slug,
                    organization__memberships__user=request.user,
                    organization__memberships__status=OrganizationMembership.Status.ACTIVE,
                ),
            )
        else:
            assets = assets.filter(owner_scope=OwnerScope.CORE)
        assets = assets.order_by('category__sort_order', 'key').distinct()
        return Response({'results': [
            {
                'id': str(asset.id), 'key': asset.key, 'category': asset.category.code,
                'object_type': asset.category.object_type, 'editor_mode': asset.category.editor_mode,
                'runtime_path': asset.runtime_path, 'thumbnail_path': asset.thumbnail_path,
                'width': asset.width, 'height': asset.height, 'frame_count': asset.frame_count,
                'checksum': asset.checksum, 'provenance_ref': asset.provenance_ref,
            }
            for asset in assets
        ]})
