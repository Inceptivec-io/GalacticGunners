import uuid

from django.db import models
from django.db.models import Q

from game_runs.models import GameRun

class LeaderboardEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    run = models.OneToOneField(GameRun, on_delete=models.CASCADE, related_name='leaderboard_entry')
    score = models.PositiveIntegerField(db_index=True)
    display_name = models.CharField(max_length=64)
    published_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score', 'published_at']
        indexes = [
            models.Index(fields=['-score', 'published_at']),
        ]
        constraints = [
            models.CheckConstraint(condition=Q(score__gte=0), name='leaderboard_score_non_negative'),
        ]

    def __str__(self):
        return f'{self.display_name}: {self.score}'
