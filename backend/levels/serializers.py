from rest_framework import serializers

from games.models import GameProject, OwnerScope
from .models import Level, LevelVersion
from .validation import checksum, validate_definition


class LevelVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LevelVersion
        fields = ['id', 'version', 'schema_version', 'config', 'checksum', 'seed_policy', 'validation_report', 'status', 'created_at', 'published_at']
        read_only_fields = ['id', 'checksum', 'created_at', 'published_at']


class LevelVersionSummarySerializer(serializers.ModelSerializer):
    """Revision lineage for the Designer list without duplicating large configs."""

    class Meta:
        model = LevelVersion
        fields = ['id', 'version', 'schema_version', 'checksum', 'status', 'created_at', 'published_at']


class LevelSerializer(serializers.ModelSerializer):
    active_version = LevelVersionSerializer(read_only=True)
    class Meta:
        model = Level
        fields = ['id', 'slug', 'name', 'campaign', 'sequence', 'archived', 'active_version']


class LevelCreateSerializer(serializers.Serializer):
    slug = serializers.SlugField(max_length=64)
    name = serializers.CharField(max_length=128)
    campaign = serializers.CharField(max_length=64, default='v1')
    sequence = serializers.IntegerField(min_value=1)
    config = serializers.JSONField()
    seed_policy = serializers.JSONField(default=dict)

    def validate_config(self, value):
        return validate_definition(value)

    def create(self, data):
        core_project = GameProject.objects.filter(
            owner_scope=OwnerScope.CORE,
            status='ACTIVE',
        ).order_by('created_at').first()
        if core_project is None:
            raise serializers.ValidationError('CORE campaign authority is not seeded.')
        level = Level.objects.create(
            slug=data['slug'], name=data['name'], campaign=data['campaign'],
            sequence=data['sequence'], game_project=core_project,
        )
        LevelVersion.objects.create(level=level, version=1, config=data['config'], seed_policy=data['seed_policy'], created_by=self.context['request'].user)
        return level


class LevelImportSerializer(LevelCreateSerializer):
    pass


class LevelVersionCreateSerializer(serializers.Serializer):
    config = serializers.JSONField()
    seed_policy = serializers.JSONField(default=dict)

    def validate_config(self, value):
        return validate_definition(value)
