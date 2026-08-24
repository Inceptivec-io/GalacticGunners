from django.db import models

from game_runs.models import GameRun

class LeaderboardEntry(models.Model):
    run = models.OneToOneField(GameRun, on_delete=models.CASCADE, related_name='leaderboard_entry')
    score = models.PositiveIntegerField(db_index=True)
    published_at = models.DateTimeField(auto_now_add=True)
