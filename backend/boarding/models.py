import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.db.models import Q


HEX64 = RegexValidator(r'^[0-9a-f]{64}$', 'Value must be a lowercase SHA-256 hash.')


class Interior(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(max_length=64)
    name = models.CharField(max_length=120)
    ship_type = models.CharField(max_length=32, default='ALIEN_FRIGATE')
    game_project = models.ForeignKey('games.GameProject', null=True, blank=True, on_delete=models.PROTECT, related_name='interiors')
    active_version = models.ForeignKey('InteriorVersion', null=True, blank=True, on_delete=models.PROTECT, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.active_version_id and self.active_version.interior_id != self.id:
            raise ValidationError('Active version must belong to this interior.')

    class Meta:
        constraints = [models.UniqueConstraint(fields=['game_project', 'slug'], name='interior_project_slug_unique')]


class InteriorVersion(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        VALIDATED = 'VALIDATED', 'Validated'
        PUBLISHED = 'PUBLISHED', 'Published'
        SUPERSEDED = 'SUPERSEDED', 'Superseded'
        ARCHIVED = 'ARCHIVED', 'Archived'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interior = models.ForeignKey(Interior, on_delete=models.PROTECT, related_name='versions')
    version = models.PositiveIntegerField()
    definition = models.JSONField()
    checksum = models.CharField(max_length=64, validators=[HEX64])
    schema_version = models.CharField(max_length=16, default='1.0')
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='interior_versions_created')
    published_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='interior_versions_published')
    validation_report = models.JSONField(default=dict, blank=True)
    supersedes = models.ForeignKey('self', null=True, blank=True, on_delete=models.PROTECT, related_name='superseded_by')

    class Meta:
        constraints = [models.UniqueConstraint(fields=['interior', 'version'], name='boarding_interior_version_unique')]

    def save(self, *args, **kwargs):
        if self.pk:
            previous = type(self).objects.filter(pk=self.pk).values('definition', 'checksum', 'status').first()
            if previous and previous['status'] == self.Status.PUBLISHED and (previous['definition'] != self.definition or previous['checksum'] != self.checksum):
                raise ValidationError('Published interior versions are immutable.')
        super().save(*args, **kwargs)


class BoardingRun(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        COMPLETED = 'COMPLETED', 'Completed'
        REJECTED = 'REJECTED', 'Rejected'

    class Outcome(models.TextChoices):
        SUCCESS = 'SUCCESS', 'Success'
        TIMEOUT = 'TIMEOUT', 'Timeout'
        PLAYER_DEAD = 'PLAYER_DEAD', 'Player dead'
        ABORTED = 'ABORTED', 'Aborted'

    class ValidationResult(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        VALID = 'VALID', 'Valid'
        INVALID = 'INVALID', 'Invalid'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game_run = models.ForeignKey('game_runs.GameRun', on_delete=models.PROTECT, related_name='boarding_runs')
    player = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='boarding_runs')
    level = models.ForeignKey('levels.Level', on_delete=models.PROTECT, related_name='boarding_runs')
    level_version = models.PositiveIntegerField()
    level_checksum = models.CharField(max_length=64, validators=[HEX64])
    source_entity_id = models.CharField(max_length=128)
    source_entity_type = models.CharField(max_length=32, default='scout')
    source_ship_type = models.CharField(max_length=32, default='ALIEN_FRIGATE')
    anchor_id = models.CharField(max_length=96)
    interior_version = models.ForeignKey(InteriorVersion, on_delete=models.PROTECT, related_name='boarding_runs')
    interior_checksum = models.CharField(max_length=64, validators=[HEX64])
    seed = models.PositiveBigIntegerField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    outcome = models.CharField(max_length=16, choices=Outcome.choices, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_limit_ms = models.PositiveIntegerField(default=60000)
    duration_ms = models.PositiveIntegerField(null=True, blank=True)
    lives_start = models.PositiveSmallIntegerField()
    lives_end = models.PositiveSmallIntegerField(null=True, blank=True)
    nukes_start = models.PositiveSmallIntegerField()
    nukes_end = models.PositiveSmallIntegerField(null=True, blank=True)
    aliens_killed = models.PositiveSmallIntegerField(default=0)
    containers_opened = models.PositiveSmallIntegerField(default=0)
    lives_found = models.PositiveSmallIntegerField(default=0)
    nukes_found = models.PositiveSmallIntegerField(default=0)
    score_events = models.JSONField(default=list)
    shooter_state_digest = models.CharField(max_length=64, validators=[HEX64])
    return_state = models.JSONField(null=True, blank=True)
    validation_result = models.CharField(max_length=16, choices=ValidationResult.choices, default=ValidationResult.PENDING)
    validation_code = models.CharField(max_length=64, blank=True)
    capability_token_hash = models.CharField(max_length=64, null=True, blank=True, validators=[HEX64])
    return_applied = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['game_run', 'level_version', 'anchor_id', 'source_entity_id'], name='boarding_attempt_unique'),
            models.CheckConstraint(condition=Q(lives_start__gte=0, lives_start__lte=3) & Q(nukes_start__gte=0, nukes_start__lte=2), name='boarding_start_resources_bounded'),
            models.CheckConstraint(condition=Q(time_limit_ms=60000), name='boarding_time_limit_exact'),
        ]


class BoardingSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    boarding_run = models.OneToOneField(BoardingRun, on_delete=models.PROTECT, related_name='submission')
    idempotency_key = models.CharField(max_length=64)
    raw_summary = models.JSONField()
    summary_hash = models.CharField(max_length=64, validators=[HEX64])
    accepted = models.BooleanField()
    rejection_code = models.CharField(max_length=64, blank=True)
    validated_at = models.DateTimeField(auto_now_add=True)


class BoardingRunEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    boarding_run = models.ForeignKey(BoardingRun, on_delete=models.PROTECT, related_name='audit_events')
    sequence = models.PositiveIntegerField()
    event_type = models.CharField(max_length=32)
    payload = models.JSONField(default=dict)
    payload_hash = models.CharField(max_length=64, validators=[HEX64])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['boarding_run', 'sequence'], name='boarding_event_sequence_unique')]

    def save(self, *args, **kwargs):
        if self.pk and type(self).objects.filter(pk=self.pk).exists():
            raise ValidationError('Boarding audit events are immutable.')
        super().save(*args, **kwargs)
