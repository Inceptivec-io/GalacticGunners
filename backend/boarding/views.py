from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from game_runs.models import GameRun
from .models import BoardingRun
from .serializers import CompleteBoardingRunSerializer, StartBoardingRunSerializer, boarding_run_payload
from .services import token_matches


class BoardingResponse(Response):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self['Cache-Control'] = 'no-store'


class BoardingStartView(APIView):
    permission_classes = []

    def post(self, request, game_run_id):
        try:
            game_run = GameRun.objects.select_related('level', 'player').get(pk=game_run_id)
        except GameRun.DoesNotExist as exc:
            raise NotFound('Game run not found.') from exc
        serializer = StartBoardingRunSerializer(data=request.data, context={'game_run': game_run})
        serializer.is_valid(raise_exception=True)
        run, token, created = serializer.create_or_get()
        return BoardingResponse(boarding_run_payload(run, token), status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class BoardingRunDetailView(APIView):
    permission_classes = []

    def get_run(self, request, boarding_run_id):
        try:
            run = BoardingRun.objects.select_related('game_run', 'interior_version__interior').get(pk=boarding_run_id)
        except BoardingRun.DoesNotExist as exc:
            raise NotFound('Boarding run not found.') from exc
        if run.player_id is None and not token_matches(request.headers.get('X-Boarding-Token'), run.capability_token_hash):
            raise PermissionDenied('BOARDING_CAPABILITY_INVALID')
        return run

    def get(self, request, boarding_run_id):
        return BoardingResponse(boarding_run_payload(self.get_run(request, boarding_run_id)))


class BoardingCompleteView(BoardingRunDetailView):
    def post(self, request, boarding_run_id):
        run = self.get_run(request, boarding_run_id)
        idempotency_key = request.headers.get('Idempotency-Key')
        if not idempotency_key or len(idempotency_key) > 64:
            raise ValidationError({'Idempotency-Key': 'IDEMPOTENCY_KEY_REQUIRED'})
        serializer = CompleteBoardingRunSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        completed = serializer.complete(run, idempotency_key)
        return BoardingResponse(boarding_run_payload(completed))
