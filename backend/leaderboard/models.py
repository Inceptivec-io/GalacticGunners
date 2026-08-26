import uuid

from django.db import models
from django.db.models import Q
from django.utils import timezone

from game_runs.models import GameRun

class LeaderboardEntry(models.Model):
    class ModerationState(models.TextChoices):
        VISIBLE = 'VISIBLE', 'Visible'
        SUPPRESSED_ENTRY = 'SUPPRESSED_ENTRY', 'Suppressed entry'
        SUPPRESSED_PLAYER = 'SUPPRESSED_PLAYER', 'Suppressed player'
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    run = models.OneToOneField(GameRun, on_delete=models.CASCADE, related_name='leaderboard_entry')
    score = models.PositiveIntegerField(db_index=True)
    display_name = models.CharField(max_length=64)
    published_at = models.DateTimeField(auto_now_add=True)
    campaign_level_reached = models.PositiveIntegerField(default=1)
    victory = models.BooleanField(default=False)
    moderation_state = models.CharField(max_length=32, choices=ModerationState.choices, default=ModerationState.VISIBLE)
    suppression_reason = models.CharField(max_length=240, blank=True)
    visible = models.BooleanField(default=True, db_index=True)
    accepted_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-score', '-campaign_level_reached', 'accepted_at', 'run_id']
        permissions = [('can_moderate_leaderboard', 'Can moderate leaderboard')]
        indexes = [
            models.Index(fields=['-score', 'published_at']),
            models.Index(fields=['visible', '-score', '-campaign_level_reached', 'accepted_at']),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(score__gte=0), name='leaderboard_score_non_negative'),
        ]

    def __str__(self):
        return f'{self.display_name}: {self.score}'


class ModerationAuditEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey('accounts.User', null=True, on_delete=models.SET_NULL, related_name='leaderboard_audit_events')
    action = models.CharField(max_length=64)
    target = models.CharField(max_length=128)
    reason = models.CharField(max_length=240)
    before = models.JSONField(default=dict)
    after = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
