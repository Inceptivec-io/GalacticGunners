from django.db import models
from django.utils import timezone

from .models import BusinessEntitlement, OrganizationMembership


class AuthorizationPolicy:
    """Single server-side authority boundary for platform and tenant requests."""

    owner_permissions = {
        'accounts.manage_platform', 'accounts.publish_core', 'accounts.manage_organizations',
    }

    @classmethod
    def is_platform_owner(cls, user):
        return bool(user and user.is_authenticated and (user.is_superuser or user.has_perms(cls.owner_permissions)))

    @classmethod
    def can_manage_platform(cls, user):
        return bool(user and user.is_authenticated and (cls.is_platform_owner(user) or user.has_perm('accounts.manage_platform')))

    @classmethod
    def membership(cls, user, organization):
        if not user or not user.is_authenticated:
            return None
        return OrganizationMembership.objects.filter(
            user=user, organization=organization, status=OrganizationMembership.Status.ACTIVE,
        ).first()

    @classmethod
    def can_access_organization(cls, user, organization):
        return cls.is_platform_owner(user) or cls.membership(user, organization) is not None

    @classmethod
    def has_entitlement(cls, organization, feature):
        now = timezone.now()
        return BusinessEntitlement.objects.filter(
            organization=organization,
            feature=feature,
            status=BusinessEntitlement.Status.ACTIVE,
            starts_at__lte=now,
        ).filter(models.Q(ends_at__isnull=True) | models.Q(ends_at__gt=now)).exists()
