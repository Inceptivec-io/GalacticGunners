import hashlib
import json
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.functions import Lower

from games.models import Lifecycle


def canonical_checksum(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode('utf-8')).hexdigest()


class Campaign(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        ARCHIVED = 'ARCHIVED', 'Archived'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game_project = models.ForeignKey('games.GameProject', on_delete=models.PROTECT, related_name='campaigns')
    slug = models.SlugField(max_length=64)
    name = models.CharField(max_length=128)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='campaigns_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint('game_project', Lower('slug'), name='campaign_project_slug_ci_unique')]


class CampaignVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.PROTECT, related_name='versions')
    version = models.PositiveIntegerField()
    lifecycle = models.CharField(max_length=16, choices=Lifecycle.choices, default=Lifecycle.DRAFT)
    schema_version = models.CharField(max_length=16, default='1.0')
    checksum = models.CharField(max_length=64, editable=False)
    validation_report = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.PROTECT, related_name='campaign_versions_created')
    published_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.PROTECT, related_name='campaign_versions_published')
    created_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['campaign', 'version'], name='campaign_version_unique')]
        ordering = ['campaign', '-version']

    def manifest(self):
        return {
            'campaign': str(self.campaign_id),
            'version': self.version,
            'schema_version': self.schema_version,
            'entries': [entry.manifest() for entry in self.entries.order_by('position')],
        }

    def clean(self):
        if self.lifecycle == Lifecycle.PUBLISHED:
            entries = list(self.entries.order_by('position')) if self.pk else []
            if not entries or [entry.position for entry in entries] != list(range(1, len(entries) + 1)):
                raise ValidationError('Published campaign entries must be contiguous beginning at position 1.')
            if len(entries) > 10000:
                raise ValidationError('A published campaign may contain at most 10,000 entries.')
        if self.pk:
            prior = type(self).objects.filter(pk=self.pk).values('campaign_id', 'version', 'checksum', 'lifecycle').first()
            if prior and prior['lifecycle'] == Lifecycle.PUBLISHED and (prior['campaign_id'] != self.campaign_id or prior['version'] != self.version or prior['checksum'] != self.checksum):
                raise ValidationError('Published CampaignVersion is immutable.')

    def save(self, *args, **kwargs):
        if self.pk:
            self.checksum = canonical_checksum(self.manifest())
        elif not self.checksum:
            self.checksum = canonical_checksum({'campaign': str(self.campaign_id), 'version': self.version, 'entries': []})
        self.full_clean()
        return super().save(*args, **kwargs)


class CampaignEntry(models.Model):
    class Kind(models.TextChoices):
        SHOOTER = 'SHOOTER', 'Shooter'
        BOARDING_ONLY = 'BOARDING_ONLY', 'Boarding only'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign_version = models.ForeignKey(CampaignVersion, on_delete=models.PROTECT, related_name='entries')
    position = models.PositiveIntegerField()
    level_version = models.ForeignKey('levels.LevelVersion', on_delete=models.PROTECT, related_name='campaign_entries')
    entry_kind = models.CharField(max_length=24, choices=Kind.choices, default=Kind.SHOOTER)
    required = models.BooleanField(default=True)
    transition = models.JSONField(default=dict, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['campaign_version', 'position'], name='campaign_entry_position_unique'),
            models.UniqueConstraint(fields=['campaign_version', 'level_version'], name='campaign_entry_level_version_unique'),
        ]
        ordering = ['position']

    def clean(self):
        if self.entry_kind != self.Kind.SHOOTER:
            raise ValidationError('Only SHOOTER campaign entries are executable in H015.')

    def manifest(self):
        return {
            'id': str(self.id),
            'position': self.position,
            'level_version': str(self.level_version_id),
            'checksum': self.level_version.checksum,
            'entry_kind': self.entry_kind,
            'required': self.required,
            'transition': self.transition,
        }
