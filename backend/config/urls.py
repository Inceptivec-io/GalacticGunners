from django.contrib import admin
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from game_runs.views import GameRunCompleteView, GameRunStartView
from leaderboard.views import LeaderboardListView

from .views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', health, name='health'),
    path('api/v1/game-runs/', GameRunStartView.as_view(), name='game-run-start'),
    path(
        'api/v1/game-runs/<uuid:run_id>/complete/',
        GameRunCompleteView.as_view(),
        name='game-run-complete',
    ),
    path('api/v1/leaderboard/', LeaderboardListView.as_view(), name='leaderboard'),
    path('api/schema/', SpectacularAPIView.as_view(), name='api-schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='api-schema'), name='api-docs'),
]
