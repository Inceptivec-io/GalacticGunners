from django.db.models import F, Window
from django.db.models.functions import RowNumber
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from game_runs.models import GameRun
from players.models import PlayerProfile

from .models import LeaderboardEntry, ModerationAuditEvent
from .serializers import LeaderboardEntrySerializer


def ranked_entries():
    visible = LeaderboardEntry.objects.select_related('run', 'run__player').filter(visible=True, moderation_state=LeaderboardEntry.ModerationState.VISIBLE, run__validity=GameRun.Validity.VALID, run__completed_at__isnull=False).order_by('run__player_id', '-score', '-campaign_level_reached', 'accepted_at', 'run_id')
    best_ids = []
    seen_players = set()
    for entry in visible:
        player_key = entry.run.player_id
        if player_key in seen_players:
            continue
        seen_players.add(player_key)
        best_ids.append(entry.id)
    return LeaderboardEntry.objects.filter(id__in=best_ids).annotate(rank=Window(expression=RowNumber(), order_by=[F('score').desc(), F('campaign_level_reached').desc(), F('accepted_at').asc(), F('run_id').asc()])).order_by('-score', '-campaign_level_reached', 'accepted_at', 'run_id')


class LeaderboardListView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        limit = self._bounded_integer(request.query_params.get('limit'), default=20, minimum=1, maximum=100)
        offset = self._bounded_integer(request.query_params.get('offset'), default=0, minimum=0, maximum=100000)
        queryset = ranked_entries()
        payload = {'total': queryset.count(), 'results': LeaderboardEntrySerializer(queryset[offset:offset + limit], many=True).data}
        if request.user.is_authenticated:
            own = queryset.filter(run__player=request.user).first()
            payload['player'] = {'rank': own.rank if own else None, 'best_score': own.score if own else None}
        return Response(payload)

    @staticmethod
    def _bounded_integer(value, *, default, minimum, maximum):
        if value in (None, ''):
            return default
        try:
            parsed = int(value)
        except ValueError as exc:
            raise ValidationError(f'Expected an integer between {minimum} and {maximum}.') from exc
        if parsed < minimum or parsed > maximum:
            raise ValidationError(f'Expected an integer between {minimum} and {maximum}.')
        return parsed


class LeaderboardMeView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'rank': None, 'best_score': None})
        entry = ranked_entries().filter(run__player=request.user).first()
        return Response({'rank': entry.rank if entry else None, 'best_score': entry.score if entry else None})


class ModerationView(APIView):
    def _require_moderator(self, request):
        if not request.user.is_authenticated or not (request.user.is_superuser or request.user.has_perm('leaderboard.can_moderate_leaderboard')):
            raise PermissionDenied('Moderator permission required.')

    def get(self, request, resource, entry_id=None, action=None):
        self._require_moderator(request)
        if resource == 'audit':
            return Response(list(ModerationAuditEvent.objects.values('action', 'target', 'reason', 'before', 'after', 'created_at')[:100]))
        if resource == 'rejected-runs':
            return Response(list(GameRun.objects.filter(validity=GameRun.Validity.REJECTED).values('id', 'validation_code', 'validation_result', 'submitted_at')[:100]))
        if resource == 'runs' and entry_id:
            run = GameRun.objects.get(pk=entry_id)
            return Response({'id': str(run.id), 'level_checksum': run.level_checksum, 'score': run.score, 'validation': run.validation_result})
        return Response(list(LeaderboardEntry.objects.values('id', 'display_name', 'score', 'visible', 'moderation_state')[:100]))

    def post(self, request, resource, entry_id=None, action=None):
        self._require_moderator(request)
        reason = str(request.data.get('reason', '')).strip()
        if not reason:
            raise ValidationError({'reason': 'A moderation reason is required.'})
        if resource == 'entries':
            entry = LeaderboardEntry.objects.get(pk=entry_id)
            before = {'visible': entry.visible, 'moderation_state': entry.moderation_state}
            suppress = action == 'suppress'
            entry.visible = not suppress
            entry.moderation_state = LeaderboardEntry.ModerationState.SUPPRESSED_ENTRY if suppress else LeaderboardEntry.ModerationState.VISIBLE
            entry.suppression_reason = reason if suppress else ''
            entry.save(update_fields=['visible', 'moderation_state', 'suppression_reason'])
            ModerationAuditEvent.objects.create(actor=request.user, action=f'entry_{action}', target=str(entry.id), reason=reason, before=before, after={'visible': entry.visible, 'moderation_state': entry.moderation_state})
            return Response({'id': str(entry.id), 'visible': entry.visible})
        if resource == 'players':
            profile = PlayerProfile.objects.get(pk=entry_id)
            before = {'leaderboard_enabled': profile.leaderboard_enabled, 'moderation_state': profile.moderation_state, 'display_name': profile.display_name}
            if action == 'rename':
                profile.display_name = str(request.data.get('display_name', '')).strip()
                profile.full_clean()
            elif action in {'suppress', 'restore'}:
                suppressed = action == 'suppress'
                profile.leaderboard_enabled = not suppressed
                profile.moderation_state = 'SUPPRESSED_PLAYER' if suppressed else 'VISIBLE'
                LeaderboardEntry.objects.filter(run__player=profile.user).update(
                    visible=not suppressed,
                    moderation_state=LeaderboardEntry.ModerationState.SUPPRESSED_PLAYER if suppressed else LeaderboardEntry.ModerationState.VISIBLE,
                    suppression_reason=reason if suppressed else '',
                )
            else:
                raise ValidationError({'action': 'Unsupported moderation operation.'})
            profile.save()
            ModerationAuditEvent.objects.create(actor=request.user, action=f'player_{action}', target=str(profile.id), reason=reason, before=before, after={'leaderboard_enabled': profile.leaderboard_enabled, 'moderation_state': profile.moderation_state, 'display_name': profile.display_name})
            return Response({'id': str(profile.id), 'display_name': profile.display_name, 'leaderboard_enabled': profile.leaderboard_enabled})
        raise ValidationError({'resource': 'Unsupported moderation operation.'})
