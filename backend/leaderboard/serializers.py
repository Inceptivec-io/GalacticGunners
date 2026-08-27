from rest_framework import serializers

from .models import LeaderboardEntry


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    run_id = serializers.UUIDField()
    rank = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaderboardEntry
        fields = ['rank', 'run_id', 'display_name', 'score', 'campaign_level_reached', 'victory', 'accepted_at']
