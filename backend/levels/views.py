from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from games.models import OwnerScope
from .models import Level, LevelAuditEvent, LevelVersion
from .permissions import IsLevelAdmin
from .serializers import LevelCreateSerializer, LevelSerializer, LevelVersionCreateSerializer, LevelVersionSerializer
from .validation import checksum, validate_definition


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
            version.publish(); audit(request, action, level, version); return Response(LevelSerializer(level).data)
        if action == 'clone':
            config = request.data.get('config', version.config)
            validate_definition(config)
            clone = LevelVersion.objects.create(level=level, version=(level.versions.order_by('-version').first().version + 1), config=config, seed_policy=request.data.get('seed_policy', version.seed_policy), created_by=request.user, supersedes=version)
            audit(request, action, level, clone, {'from_version': version.version})
            return Response(LevelVersionSerializer(clone).data, status=status.HTTP_201_CREATED)
        if action == 'rollback':
            if version.status != LevelVersion.Status.PUBLISHED:
                return Response({'code': 'invalid_request', 'detail': 'Rollback target must be published.', 'errors': {}}, status=400)
            level.active_version = version; level.archived = False; level.save(update_fields=['active_version', 'archived', 'updated_at'])
            audit(request, action, level, version)
            return Response(LevelSerializer(level).data)
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
        """Create a deterministic DRAFT candidate; generation never publishes."""
        seed = int(request.data.get('seed', 12001))
        sequence = int(request.data.get('sequence', 2))
        slug = request.data.get('slug', f'level-{sequence:02d}')
        payload = {
            'id': slug, 'slug': slug, 'name': request.data.get('name', f'Level {sequence}'), 'version': 1,
            'schema_version': '1.0', 'status': 'DRAFT', 'sequence': sequence, 'seed': seed,
            'player': {'x': 640, 'y': 610},
            'enemy_formations': [{'type': 'scout', 'rows': 2 + min(sequence // 3, 1), 'columns': min(29, 16 + sequence * 2), 'origin': {'x': 50, 'y': 120}, 'spacing': {'x': 40, 'y': 50}}],
            'shields': [{'count': 8, 'matrix': [[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,0,0,0,0,1,1],[1,1,0,0,0,0,1,1]]}],
            'performance_budget': {'max_enemies': 58}, 'drop_tables': [],
        }
        serializer = LevelCreateSerializer(data={'slug': slug, 'name': payload['name'], 'campaign': request.data.get('campaign', 'v1'), 'sequence': sequence, 'config': payload, 'seed_policy': {'seed': seed}}, context={'request': request})
        serializer.is_valid(raise_exception=True)
        level = serializer.save(); audit(request, 'generate', level, level.versions.first(), {'seed': seed})
        return Response(LevelSerializer(level).data, status=status.HTTP_201_CREATED)
