import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class ServicePlan(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        ACTIVE = 'ACTIVE', 'Active'
        RETIRED = 'RETIRED', 'Retired'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=32, unique=True)
    display_name = models.CharField(max_length=128)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    limits = models.JSONField(default=dict)
    capabilities = models.JSONField(default=dict)
    sort_order = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.PROTECT, related_name='service_plans_created')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.PROTECT, related_name='service_plans_updated')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.pk and type(self).objects.filter(pk=self.pk).exclude(code=self.code).exists():
            raise ValidationError('Service plan code is immutable.')
        limit = self.limits.get('active_map_limit') if isinstance(self.limits, dict) else None
        if not isinstance(limit, int) or limit < 0:
            raise ValidationError({'limits': 'active_map_limit must be a non-negative integer.'})
        if self.capabilities.get('dual_player') == 'ACTIVE':
            raise ValidationError({'capabilities': 'Dual-player remains reserved and unavailable in H015.'})


class OrganizationPlanAssignment(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        ENDED = 'ENDED', 'Ended'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey('organizations.Organization', on_delete=models.PROTECT, related_name='plan_assignments')
    plan = models.ForeignKey(ServicePlan, on_delete=models.PROTECT, related_name='assignments')
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    plan_snapshot = models.JSONField(default=dict)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='plan_assignments_created')
    reason = models.CharField(max_length=240)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['organization'], condition=Q(status='ACTIVE'), name='organization_one_active_plan_assignment')]

    def clean(self):
        if self.ends_at and self.ends_at < self.starts_at:
            raise ValidationError({'ends_at': 'ends_at cannot precede starts_at.'})
        if not self.reason.strip():
            raise ValidationError({'reason': 'A privileged assignment reason is required.'})
        if self.pk:
            prior = type(self).objects.filter(pk=self.pk).values('plan_snapshot').first()
            if prior and prior['plan_snapshot'] != self.plan_snapshot:
                raise ValidationError('Plan snapshots are immutable after assignment.')

    def save(self, *args, **kwargs):
        if not self.plan_snapshot:
            self.plan_snapshot = {'code': self.plan.code, 'limits': self.plan.limits, 'capabilities': self.plan.capabilities}
        self.full_clean()
        return super().save(*args, **kwargs)
