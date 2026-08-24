import uuid

from django.conf import settings
from django.db import models

class GameVersion(models.Model):
    version = models.CharField(max_length=32, unique=True)
    released_at = models.DateTimeField(null=True, blank=True)

class GameRun(models.Model):
    class Validity(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VALID = 'valid', 'Valid'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='game_runs')
    game_version = models.ForeignKey(GameVersion, on_delete=models.PROTECT, related_name='game_runs')
    client_type = models.CharField(max_length=32)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.PositiveIntegerField(default=0)
    level_reached = models.CharField(max_length=32, blank=True)
    lives_used = models.PositiveIntegerField(default=0)
    nukes_used = models.PositiveIntegerField(default=0)
    victory = models.BooleanField(default=False)
    validity = models.CharField(max_length=16, choices=Validity.choices, default=Validity.PENDING)
    validation_result = models.JSONField(default=dict, blank=True)

class ScoreSubmission(models.Model):
    run = models.OneToOneField(GameRun, on_delete=models.CASCADE, related_name='score_submission')
    claimed_score = models.PositiveIntegerField()
    event_summary = models.JSONField(default=dict)
    submitted_at = models.DateTimeField(auto_now_add=True)
