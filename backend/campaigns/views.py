from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from game_runs.models import CampaignRun

from .services import CampaignService


class CampaignRunStartView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            run, capability = CampaignService.start(user=request.user, seed_root=int(request.data.get('seed_root', 12001)))
        except (TypeError, ValueError) as error:
            return Response({'code': str(error), 'detail': 'Campaign cannot be started.'}, status=status.HTTP_409_CONFLICT)
        response = Response({'id': str(run.id), 'score': run.score, 'lives': run.lives, 'nukes': run.nukes, 'entry': CampaignService.entry_payload(run), 'has_next_entry': bool(run.next_entry_id), 'ranked': bool(run.player_id), 'capability': capability}, status=status.HTTP_201_CREATED)
        response['Cache-Control'] = 'no-store'
        return response


class CampaignRunCompleteEntryView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, run_id):
        try:
            run = CampaignRun.objects.select_related('current_entry__level_version__level').get(pk=run_id)
            result = CampaignService.complete_entry(campaign_run=run, user=request.user, capability=request.headers.get('X-Campaign-Token'), entry_id=request.data.get('entry_id'), score=int(request.data.get('score', 0)), lives=int(request.data.get('lives', 0)), nukes=int(request.data.get('nukes', 0)))
        except CampaignRun.DoesNotExist:
            return Response({'code': 'NOT_FOUND', 'detail': 'Campaign run not found.'}, status=status.HTTP_404_NOT_FOUND)
        except PermissionError as error:
            return Response({'code': str(error), 'detail': 'Campaign entry cannot be completed.'}, status=status.HTTP_403_FORBIDDEN)
        except (TypeError, ValueError) as error:
            return Response({'code': str(error), 'detail': 'Campaign entry cannot be completed.'}, status=status.HTTP_409_CONFLICT)
        return Response({'id': str(result.id), 'status': result.status, 'score': result.score, 'lives': result.lives, 'nukes': result.nukes, 'entry': CampaignService.entry_payload(result), 'has_next_entry': bool(result.next_entry_id), 'completed_entry_count': result.completed_entry_count})
