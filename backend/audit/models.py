import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class PlatformAuditEvent(models.Model):
    class ActorKind(models.TextChoices):
        USER = 'USER', 'User'
        ANONYMOUS = 'ANONYMOUS', 'Anonymous'
        SYSTEM = 'SYSTEM', 'System'

    class Result(models.TextChoices):
        SUCCESS = 'SUCCESS', 'Success'
        DENIED = 'DENIED', 'Denied'
        FAILED = 'FAILED', 'Failed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    correlation_id = models.UUIDField(default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='platform_audit_events')
    actor_kind = models.CharField(max_length=16, choices=ActorKind.choices)
    organization = models.ForeignKey('organizations.Organization', null=True, blank=True, on_delete=models.PROTECT, related_name='audit_events')
    action = models.CharField(max_length=96)
    target_type = models.CharField(max_length=96)
    target_id = models.CharField(max_length=96)
    result = models.CharField(max_length=16, choices=Result.choices)
    reason_code = models.CharField(max_length=64, blank=True)
    detail = models.JSONField(default=dict, blank=True)
    request_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.pk and type(self).objects.filter(pk=self.pk).exists():
            raise ValidationError('Platform audit events are append-only.')
        return super().save(*args, **kwargs)
