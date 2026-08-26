import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator, MinValueValidator, RegexValidator
from django.db import models
from django.db.models import Q

class GameVersion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    version = models.CharField(max_length=32, unique=True)
    build_hash = models.CharField(max_length=64, blank=True, validators=[
        RegexValidator(r'^[0-9a-fA-F]{0,64}$', 'Build hash must be hexadecimal when provided.')
    ])
    is_active = models.BooleanField(default=True)
    released_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', 'version']

    def __str__(self):
        return self.version

class GameRun(models.Model):
    class ClientType(models.TextChoices):
        WEB = 'web', 'Web'
        WINDOWS = 'windows', 'Windows'
        MACOS = 'macos', 'macOS'
        ANDROID = 'android', 'Android'
        IOS = 'ios', 'iOS'
        UNKNOWN = 'unknown', 'Unknown'

    class Validity(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VALID = 'valid', 'Valid'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='game_runs')
    game_version = models.ForeignKey(GameVersion, on_delete=models.PROTECT, related_name='game_runs')
    level = models.ForeignKey('levels.Level', null=True, blank=True, on_delete=models.PROTECT, related_name='game_runs')
    level_version = models.PositiveIntegerField(null=True, blank=True)
    level_checksum = models.CharField(max_length=64, blank=True)
    seed = models.PositiveIntegerField(null=True, blank=True)
    client_type = models.CharField(
        max_length=32,
        choices=ClientType.choices,
        default=ClientType.UNKNOWN,
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    level_reached = models.CharField(max_length=32, blank=True, validators=[MaxLengthValidator(32)])
    lives_used = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    nukes_used = models.PositiveIntegerField(default=0, validators=[MinValueValidator(0)])
    victory = models.BooleanField(default=False)
    validity = models.CharField(max_length=16, choices=Validity.choices, default=Validity.PENDING)
    validation_result = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['validity', 'completed_at']),
            models.Index(fields=['game_version', 'started_at']),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(score__gte=0), name='game_run_score_non_negative'),
            models.CheckConstraint(condition=Q(lives_used__gte=0), name='game_run_lives_used_non_negative'),
            models.CheckConstraint(condition=Q(nukes_used__gte=0), name='game_run_nukes_used_non_negative'),
            models.CheckConstraint(
                condition=Q(client_type__in=['web', 'windows', 'macos', 'android', 'ios', 'unknown']),
                name='game_run_client_type_known',
            ),
            models.CheckConstraint(
                condition=Q(validity__in=['pending', 'valid', 'rejected']),
                name='game_run_validity_known',
            ),
        ]

    @property
    def is_publishable(self):
        return (
            self.completed_at is not None
            and self.validity == self.Validity.VALID
            and self.score >= 0
        )

    def __str__(self):
        return f'{self.id} ({self.validity})'

    def clean(self):
        if self.level_id:
            if self.level_version is None or not self.level_checksum:
                raise ValidationError('Level-bound runs require version and checksum.')

class ScoreSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    run = models.OneToOneField(GameRun, on_delete=models.CASCADE, related_name='score_submission')
    claimed_score = models.PositiveIntegerField(validators=[MinValueValidator(0)])
    event_summary = models.JSONField(default=dict)
    payload_hash = models.CharField(max_length=64, blank=True, validators=[
        RegexValidator(r'^[0-9a-fA-F]{0,64}$', 'Payload hash must be hexadecimal when provided.')
    ])
    idempotency_key = models.CharField(max_length=128, null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['submitted_at']),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(claimed_score__gte=0),
                name='score_submission_claimed_score_non_negative',
            ),
            models.UniqueConstraint(
                fields=['idempotency_key'],
                condition=Q(idempotency_key__isnull=False),
                name='score_submission_idempotency_key_unique',
            ),
        ]

    def __str__(self):
        return f'{self.run_id}: {self.claimed_score}'
