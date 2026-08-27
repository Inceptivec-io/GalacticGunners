import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower


class Organization(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        ARCHIVED = 'ARCHIVED', 'Archived'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=64)
    name = models.CharField(max_length=128)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='organizations_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(Lower('slug'), name='organization_slug_ci_unique')]
        ordering = ['name']


class OrganizationMembership(models.Model):
    class Role(models.TextChoices):
        BUSINESS_ADMIN = 'BUSINESS_ADMIN', 'Business admin'
        EDITOR = 'EDITOR', 'Editor'
        PLAYER = 'PLAYER', 'Player'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.PROTECT, related_name='memberships')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='organization_memberships')
    role = models.CharField(max_length=24, choices=Role.choices)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.PROTECT, related_name='organization_memberships_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['organization', 'user'], name='organization_membership_unique')]

    def clean(self):
        if self.pk and type(self).objects.filter(pk=self.pk).values('organization_id', 'user_id').exclude(organization_id=self.organization_id).exists():
            raise ValidationError('Membership ownership is immutable.')


class BusinessEntitlement(models.Model):
    class Feature(models.TextChoices):
        CUSTOM_GAMES = 'CUSTOM_GAMES', 'Custom games'
        PRIVATE_MAPS = 'PRIVATE_MAPS', 'Private maps'
        CONNECTED_APP = 'CONNECTED_APP', 'Connected app'
        USER_MAPS = 'USER_MAPS', 'User maps'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        EXPIRED = 'EXPIRED', 'Expired'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.PROTECT, related_name='entitlements')
    feature = models.CharField(max_length=24, choices=Feature.choices)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    limits = models.JSONField(default=dict, blank=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    granted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='entitlements_granted')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['organization', 'feature'], condition=Q(status='ACTIVE'), name='organization_active_entitlement_unique'),
        ]
