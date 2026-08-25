from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView

from game_runs.models import GameRun

from .models import LeaderboardEntry
from .serializers import LeaderboardEntrySerializer


class LeaderboardListView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        limit = self._bounded_integer(request.query_params.get('limit'), default=20, minimum=1, maximum=100)
        offset = self._bounded_integer(request.query_params.get('offset'), default=0, minimum=0, maximum=100000)
        queryset = (
            LeaderboardEntry.objects.select_related('run')
            .filter(run__validity=GameRun.Validity.VALID, run__completed_at__isnull=False)
            .order_by('-score', 'published_at')
        )
        results = queryset[offset:offset + limit]
        return Response({
            'count': queryset.count(),
            'results': LeaderboardEntrySerializer(results, many=True).data,
        })

    @staticmethod
    def _bounded_integer(value, *, default, minimum, maximum):
        if value in (None, ''):
            return default
        try:
            parsed = int(value)
        except ValueError:
            raise ValidationError(f'Expected an integer between {minimum} and {maximum}.')
        if parsed < minimum or parsed > maximum:
            raise ValidationError(f'Expected an integer between {minimum} and {maximum}.')
        return parsed
