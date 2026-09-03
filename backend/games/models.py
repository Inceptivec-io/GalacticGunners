import hashlib
import json
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class OwnerScope(models.TextChoices):
    CORE = 'CORE', 'Core'
    ORGANIZATION = 'ORGANIZATION', 'Organization'
    USER = 'USER', 'User'


class Visibility(models.TextChoices):
    PRIVATE = 'PRIVATE', 'Private'
    ORGANIZATION = 'ORGANIZATION', 'Organization'
    UNLISTED = 'UNLISTED', 'Unlisted'
    PUBLIC = 'PUBLIC', 'Public'


class Lifecycle(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    VALIDATED = 'VALIDATED', 'Validated'
    PUBLISHED = 'PUBLISHED', 'Published'
    SUPERSEDED = 'SUPERSEDED', 'Superseded'
    ARCHIVED = 'ARCHIVED', 'Archived'


def canonical_checksum(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode('utf-8')).hexdigest()


class GameProject(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=64)
    name = models.CharField(max_length=128)
    owner_scope = models.CharField(max_length=16, choices=OwnerScope.choices)
    organization = models.ForeignKey('organizations.Organization', null=True, blank=True, on_delete=models.PROTECT, related_name='game_projects')
    owner_user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.PROTECT, related_name='owned_game_projects')
    visibility = models.CharField(max_length=16, choices=Visibility.choices, default=Visibility.PRIVATE)
    status = models.CharField(max_length=16, choices=[('ACTIVE', 'Active'), ('ARCHIVED', 'Archived')], default='ACTIVE')
    base_release = models.ForeignKey('GameRelease', null=True, blank=True, on_delete=models.PROTECT, related_name='derived_projects')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='game_projects_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['slug', 'owner_scope', 'organization', 'owner_user'], name='game_project_scope_slug_unique'),
            models.CheckConstraint(
                condition=(Q(owner_scope=OwnerScope.CORE, organization__isnull=True, owner_user__isnull=True)
                           | Q(owner_scope=OwnerScope.ORGANIZATION, organization__isnull=False, owner_user__isnull=True)
                           | Q(owner_scope=OwnerScope.USER, organization__isnull=True, owner_user__isnull=False)),
                name='game_project_matching_owner_scope',
            ),
        ]

    def clean(self):
        if self.pk:
            prior = type(self).objects.filter(pk=self.pk).values('owner_scope', 'organization_id', 'owner_user_id').first()
            if prior and (prior['owner_scope'], prior['organization_id'], prior['owner_user_id']) != (self.owner_scope, self.organization_id, self.owner_user_id):
                raise ValidationError('Game project ownership is immutable.')


class GameRelease(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game_project = models.ForeignKey(GameProject, on_delete=models.PROTECT, related_name='releases')
    version = models.CharField(max_length=32)
    status = models.CharField(max_length=16, choices=Lifecycle.choices, default=Lifecycle.DRAFT)
    manifest = models.JSONField(default=dict)
    checksum = models.CharField(max_length=64, editable=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='game_releases_created')
    published_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='game_releases_published')
    created_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['game_project', 'version'], name='game_release_version_unique')]

    def save(self, *args, **kwargs):
        self.checksum = canonical_checksum(self.manifest)
        if self.pk:
            prior = type(self).objects.filter(pk=self.pk).values('game_project_id', 'version', 'manifest', 'checksum', 'status').first()
            if prior and prior['status'] == Lifecycle.PUBLISHED and (prior['game_project_id'] != self.game_project_id or prior['version'] != self.version or prior['manifest'] != self.manifest):
                raise ValidationError('Published GameRelease is immutable.')
        self.full_clean()
        return super().save(*args, **kwargs)
