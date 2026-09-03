import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models

from games.models import OwnerScope, Visibility


HEX64 = RegexValidator(r'^[0-9a-f]{64}$', 'Expected lowercase SHA-256.')


class AssetCategory(models.Model):
    class EditorMode(models.TextChoices):
        SHOOTER = 'SHOOTER', 'Shooter'
        BOARDING = 'BOARDING', 'Boarding'
        BOTH = 'BOTH', 'Both'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    editor_mode = models.CharField(max_length=16, choices=EditorMode.choices)
    object_type = models.CharField(max_length=64)
    sort_order = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'code']


class AssetRecord(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        ACTIVE = 'ACTIVE', 'Active'
        RETIRED = 'RETIRED', 'Retired'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=128, unique=True)
    category = models.ForeignKey(AssetCategory, on_delete=models.PROTECT, related_name='assets')
    owner_scope = models.CharField(max_length=16, choices=OwnerScope.choices, default=OwnerScope.CORE)
    organization = models.ForeignKey('organizations.Organization', null=True, blank=True, on_delete=models.PROTECT, related_name='assets')
    owner_user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.PROTECT, related_name='asset_records')
    visibility = models.CharField(max_length=16, choices=Visibility.choices, default=Visibility.PUBLIC)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    runtime_path = models.CharField(max_length=256)
    thumbnail_path = models.CharField(max_length=256)
    mime_type = models.CharField(max_length=96)
    width = models.PositiveIntegerField(default=1)
    height = models.PositiveIntegerField(default=1)
    frame_width = models.PositiveIntegerField(null=True, blank=True)
    frame_height = models.PositiveIntegerField(null=True, blank=True)
    frame_count = models.PositiveIntegerField(null=True, blank=True)
    animation = models.JSONField(default=dict, blank=True)
    collider = models.JSONField(default=dict, blank=True)
    checksum = models.CharField(max_length=64, validators=[HEX64])
    provenance_ref = models.CharField(max_length=256)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='asset_records_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        for value in (self.runtime_path, self.thumbnail_path):
            if not value.startswith('/') or '://' in value or '..' in value:
                raise ValidationError('Asset paths must be application-relative allowlisted paths.')
        if self.mime_type not in {'image/png', 'image/webp', 'image/jpeg', 'audio/wav', 'audio/mpeg', 'audio/ogg'}:
            raise ValidationError('Asset MIME type is not allowlisted.')
