import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from .validation import checksum, validate_definition


class Level(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=64)
    name = models.CharField(max_length=128)
    campaign = models.CharField(max_length=64, default='v1')
    game_project = models.ForeignKey('games.GameProject', null=True, blank=True, on_delete=models.PROTECT, related_name='levels')
    sequence = models.PositiveIntegerField()
    active_version = models.ForeignKey('LevelVersion', null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['campaign', 'sequence']
        constraints = [
            models.UniqueConstraint(fields=['game_project', 'slug'], name='level_project_slug_unique'),
            models.UniqueConstraint(fields=['game_project', 'campaign', 'sequence'], condition=models.Q(archived=False), name='level_project_campaign_sequence_unique'),
        ]

    def clean(self):
        if self.active_version_id and self.active_version.level_id != self.id:
            raise ValidationError('Active version must belong to this level.')


class LevelVersion(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        VALIDATED = 'VALIDATED', 'Validated'
        PUBLISHED = 'PUBLISHED', 'Published'
        SUPERSEDED = 'SUPERSEDED', 'Superseded'
        ARCHIVED = 'ARCHIVED', 'Archived'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    level = models.ForeignKey(Level, on_delete=models.PROTECT, related_name='versions')
    version = models.PositiveIntegerField()
    schema_version = models.CharField(max_length=16, default='1.0')
    config = models.JSONField()
    checksum = models.CharField(max_length=64, editable=False)
    seed_policy = models.JSONField(default=dict, blank=True)
    validation_report = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(null=True, blank=True)
    supersedes = models.ForeignKey('self', null=True, blank=True, on_delete=models.PROTECT, related_name='superseded_by')

    class Meta:
        constraints = [models.UniqueConstraint(fields=['level', 'version'], name='level_version_unique')]
        ordering = ['level', '-version']

    def clean(self):
        validate_definition(self.config)
        if self.pk:
            previous = type(self).objects.filter(pk=self.pk).values('config', 'checksum', 'status').first()
            if previous and previous['status'] == self.Status.PUBLISHED and (previous['config'] != self.config or previous['checksum'] != self.checksum):
                raise ValidationError('Published LevelVersion is immutable.')

    def save(self, *args, **kwargs):
        validate_definition(self.config)
        self.schema_version = self.config.get('schema_version', '1.0')
        if not self.seed_policy:
            self.seed_policy = {'mode': 'fixed'}
        self.checksum = checksum(self.config)
        self.full_clean()
        super().save(*args, **kwargs)

    def publish(self):
        if self.status not in {self.Status.DRAFT, self.Status.VALIDATED}:
            raise ValidationError('Only draft or validated versions can be published.')
        type(self).objects.filter(level=self.level, status=self.Status.PUBLISHED).exclude(pk=self.pk).update(status=self.Status.SUPERSEDED)
        self.status = self.Status.PUBLISHED
        self.published_at = timezone.now()
        self.save()
        self.level.active_version = self
        self.level.save(update_fields=['active_version', 'updated_at'])


class LevelAuditEvent(models.Model):
    """Append-only record of privileged level-authoring activity."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    level = models.ForeignKey(Level, null=True, blank=True, on_delete=models.PROTECT, related_name='audit_events')
    version = models.ForeignKey(LevelVersion, null=True, blank=True, on_delete=models.PROTECT, related_name='audit_events')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=32)
    detail = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.pk and type(self).objects.filter(pk=self.pk).exists():
            raise ValidationError('Audit events are immutable.')
        super().save(*args, **kwargs)
