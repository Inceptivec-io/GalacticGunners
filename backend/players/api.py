from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PlayerProfile


class LeaderboardProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerProfile
        fields = ['display_name', 'leaderboard_enabled']


class LeaderboardProfileView(APIView):
    def _profile(self, request):
        if not request.user.is_authenticated:
            return None
        return getattr(request.user, 'player_profile', None)

    def get(self, request):
        profile = self._profile(request)
        if not profile:
            return Response({'display_name': None, 'leaderboard_enabled': False})
        return Response(LeaderboardProfileSerializer(profile).data)

    def patch(self, request):
        profile = self._profile(request)
        if not profile:
            return Response({'detail': 'Authentication is required.'}, status=401)
        serializer = LeaderboardProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
