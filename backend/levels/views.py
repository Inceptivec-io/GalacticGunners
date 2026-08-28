from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from games.models import OwnerScope
from .models import Level, LevelAuditEvent, LevelVersion
from .permissions import IsLevelAdmin
from .serializers import LevelCreateSerializer, LevelSerializer, LevelVersionCreateSerializer, LevelVersionSerializer
from .validation import checksum, validate_definition
from .authoring import blank_authoring_document
from campaigns.publication import publish_core_level
from campaigns.models import Campaign, CampaignVersion
from games.models import GameRelease, Lifecycle


class PublicLevelListView(generics.ListAPIView):
    serializer_class = LevelSerializer
    queryset = Level.objects.filter(
        archived=False,
        game_project__owner_scope=OwnerScope.CORE,
        active_version__status=LevelVersion.Status.PUBLISHED,
    ).select_related('active_version')


class PublicLevelDetailView(generics.RetrieveAPIView):
    serializer_class = LevelSerializer
    lookup_field = 'slug'
    queryset = PublicLevelListView.queryset


class PublicVersionView(generics.RetrieveAPIView):
    serializer_class = LevelVersionSerializer
    lookup_field = 'version'
    def get_queryset(self):
        return LevelVersion.objects.filter(
            level__slug=self.kwargs['slug'],
            level__game_project__owner_scope=OwnerScope.CORE,
            status=LevelVersion.Status.PUBLISHED,
        )


class AdminLevelCreateView(APIView):
    permission_classes = [IsLevelAdmin]
    def post(self, request):
        serializer = LevelCreateSerializer(data=request.data, context={'request': request}); serializer.is_valid(raise_exception=True)
        level = serializer.save()
        audit(request, 'create', level, level.versions.first())
        return Response(LevelSerializer(level).data, status=status.HTTP_201_CREATED)


class AdminCoreLevelAuthorityView(APIView):
    """Complete, authenticated CORE authoring authority for the product Designer.

    This deliberately differs from the public level list: administrators need the
    immutable revision lineage and active campaign release, while players only
    receive the active published level configuration.
    """

    permission_classes = [IsLevelAdmin]

    def get(self, request):
        levels = Level.objects.filter(
            archived=False,
            game_project__owner_scope=OwnerScope.CORE,
        ).select_related('active_version').prefetch_related('versions').order_by('sequence')
        project = levels.first().game_project if levels else None
        release = None
        if project:
            release = GameRelease.objects.filter(
                game_project=project,
                status=Lifecycle.PUBLISHED,
            ).order_by('-published_at').first()
        payload = []
        for level in levels:
            versions = list(level.versions.order_by('-version'))
            editable = next(
                (version for version in versions if version.status in {LevelVersion.Status.DRAFT, LevelVersion.Status.VALIDATED}),
                None,
            )
            payload.append({
                **LevelSerializer(level).data,
                'editable_version': LevelVersionSerializer(editable).data if editable else None,
                'versions': LevelVersionSerializer(versions, many=True).data,
            })
        return Response({
            'results': payload,
            'active_campaign_release': ({
                'id': str(release.id),
                'version': release.version,
                'campaign_version_id': release.manifest.get('campaign_version_id'),
                'campaign_checksum': release.manifest.get('campaign_checksum'),
                'published_at': release.published_at,
            } if release else None),
        })


def audit(request, action, level=None, version=None, detail=None):
    LevelAuditEvent.objects.create(
        actor=request.user if request.user.is_authenticated else None,
        action=action,
        level=level,
        version=version,
        detail=detail or {},
    )


class AdminLevelActionView(APIView):
    permission_classes = [IsLevelAdmin]
    def post(self, request, level_id, action):
        level = get_object_or_404(Level, pk=level_id)
        version = level.versions.order_by('-version').first()
        requested = request.data.get('version')
        if requested is not None:
            version = get_object_or_404(level.versions, version=requested)
        if action == 'validate':
            validate_definition(version.config)
            version.status = LevelVersion.Status.VALIDATED
            version.validation_report = {'valid': True, 'errors': [], 'warnings': []}
            version.save()
            audit(request, action, level, version)
            return Response(LevelVersionSerializer(version).data)
        if action == 'publish':
            release = publish_core_level(level=level, version=version, actor=request.user)
            audit(request, action, level, version, {'campaign_release_id': str(release.id) if release else None})
            return Response({**LevelSerializer(level).data, 'campaign_release_id': str(release.id) if release else None})
        if action == 'clone':
            config = request.data.get('config', version.config)
            validate_definition(config)
            clone = LevelVersion.objects.create(level=level, version=(level.versions.order_by('-version').first().version + 1), config=config, seed_policy=request.data.get('seed_policy', version.seed_policy), created_by=request.user, supersedes=version)
            audit(request, action, level, clone, {'from_version': version.version})
            return Response(LevelVersionSerializer(clone).data, status=status.HTTP_201_CREATED)
        if action == 'rollback':
            # Release history is immutable: once a newer revision is published,
            # the former published revision is SUPERSEDED but remains a valid
            # restore source. Rollback always creates a new revision/release.
            if version.status not in {LevelVersion.Status.PUBLISHED, LevelVersion.Status.SUPERSEDED}:
                return Response({'code': 'invalid_request', 'detail': 'Rollback target must be a published release-history version.', 'errors': {}}, status=400)
            clone = LevelVersion.objects.create(
                level=level,
                version=(level.versions.order_by('-version').first().version + 1),
                config=version.config,
                seed_policy=version.seed_policy,
                created_by=request.user,
                supersedes=version,
                status=LevelVersion.Status.VALIDATED,
            )
            release = publish_core_level(level=level, version=clone, actor=request.user)
            audit(request, action, level, clone, {'restored_from_version': version.version, 'campaign_release_id': str(release.id) if release else None})
            return Response({**LevelSerializer(level).data, 'restored_version': LevelVersionSerializer(clone).data, 'campaign_release_id': str(release.id) if release else None})
        if action == 'archive':
            level.archived = True; level.save(update_fields=['archived', 'updated_at']); audit(request, action, level, version); return Response(LevelSerializer(level).data)
        return Response({'code': 'invalid_request', 'detail': 'Unsupported level action.', 'errors': {}}, status=400)


class AdminLevelDraftView(APIView):
    """Create a new immutable draft from a specific published or draft checksum."""

    permission_classes = [IsLevelAdmin]

    def post(self, request, level_id):
        level = get_object_or_404(Level, pk=level_id, archived=False)
        base = level.versions.order_by('-version').first()
        expected_checksum = request.data.get('expected_checksum')
        if not expected_checksum or base.checksum != expected_checksum:
            return Response({'code': 'VERSION_CONFLICT', 'detail': 'Reload the latest level version before saving.', 'checksum': base.checksum}, status=409)
        config = request.data.get('config')
        validate_definition(config)
        draft = LevelVersion.objects.create(
            level=level,
            version=base.version + 1,
            config=config,
            seed_policy=base.seed_policy,
            created_by=request.user,
            supersedes=base,
        )
        draft.validation_report = {'valid': True, 'errors': [], 'warnings': []}
        draft.save(update_fields=['validation_report'])
        audit(request, 'designer_save', level, draft, {'from_version': base.version, 'expected_checksum': expected_checksum})
        return Response(LevelVersionSerializer(draft).data, status=status.HTTP_201_CREATED)


class AdminLevelPreviewView(APIView):
    """Return one immutable draft/version for same-runtime, unranked preview."""

    permission_classes = [IsLevelAdmin]

    def get(self, request, level_id, checksum_value):
        level = get_object_or_404(Level, pk=level_id, archived=False)
        # Drafts are immutable and a no-op save legitimately produces the same
        # content checksum. Preview identity is the latest matching revision.
        version = level.versions.filter(checksum=checksum_value).order_by('-version').first()
        if version is None:
            return Response({'code': 'NOT_FOUND', 'detail': 'Preview version not found.'}, status=status.HTTP_404_NOT_FOUND)
        audit(request, 'designer_preview', level, version, {'checksum': checksum_value})
        return Response(LevelVersionSerializer(version).data)


class AdminLevelExportView(APIView):
    permission_classes = [IsLevelAdmin]

    def get(self, request, level_id):
        level = get_object_or_404(Level, pk=level_id)
        audit(request, 'export', level, level.active_version)
        return Response({'level': LevelSerializer(level).data, 'versions': LevelVersionSerializer(level.versions.all(), many=True).data})


class AdminLevelImportView(APIView):
    permission_classes = [IsLevelAdmin]

    def post(self, request):
        payload = request.data.get('level', request.data)
        serializer = LevelCreateSerializer(data=payload, context={'request': request})
        serializer.is_valid(raise_exception=True)
        level = serializer.save()
        audit(request, 'import', level, level.versions.first())
        return Response(LevelSerializer(level).data, status=status.HTTP_201_CREATED)


class AdminLevelGenerateView(APIView):
    permission_classes = [IsLevelAdmin]

    def post(self, request):
        """Create a deterministic blank schema-1.1 draft; generation never publishes."""
        seed = int(request.data.get('seed', 12001))
        sequence = int(request.data.get('sequence', 2))
        slug = request.data.get('slug', f'level-{sequence:02d}')
        payload = blank_authoring_document(
            identifier=slug,
            slug=slug,
            name=request.data.get('name', f'Level {sequence}'),
            sequence=sequence,
            seed=seed,
        )
        serializer = LevelCreateSerializer(data={'slug': slug, 'name': payload['name'], 'campaign': request.data.get('campaign', 'v1'), 'sequence': sequence, 'config': payload, 'seed_policy': {'seed': seed}}, context={'request': request})
        serializer.is_valid(raise_exception=True)
        level = serializer.save(); audit(request, 'generate', level, level.versions.first(), {'seed': seed})
        return Response(LevelSerializer(level).data, status=status.HTTP_201_CREATED)
