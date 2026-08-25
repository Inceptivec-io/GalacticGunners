from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from config.api_errors import build_error_payload, error_response

from .models import GameRun
from .serializers import (
    CompleteGameRunSerializer,
    CompletedGameRunSerializer,
    GameRunSerializer,
    StartGameRunSerializer,
)


class GameRunStartView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = StartGameRunSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        run = serializer.save()
        return Response(GameRunSerializer(run).data, status=status.HTTP_201_CREATED)


class GameRunCompleteView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, run_id):
        try:
            run = GameRun.objects.select_related('player', 'game_version').get(pk=run_id)
        except GameRun.DoesNotExist as exc:
            raise NotFound('Game run not found.') from exc

        serializer = CompleteGameRunSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            completed = serializer.complete(run)
        except ValidationError as exc:
            detail = exc.detail.get('detail', 'Lifecycle conflict.') if isinstance(exc.detail, dict) else exc.detail
            return error_response(
                build_error_payload(code='conflict', detail=str(detail)),
                status.HTTP_409_CONFLICT,
            )

        return Response(CompletedGameRunSerializer(completed).data)
