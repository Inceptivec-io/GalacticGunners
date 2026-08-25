from rest_framework import serializers

from .models import LeaderboardEntry


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    run_id = serializers.UUIDField()

    class Meta:
        model = LeaderboardEntry
        fields = ['run_id', 'display_name', 'score', 'published_at']
