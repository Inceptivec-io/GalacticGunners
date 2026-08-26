from django.contrib import admin
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from game_runs.views import GameRunCompleteView, GameRunStartView
from leaderboard.views import LeaderboardListView
from levels.views import AdminLevelActionView, AdminLevelCreateView, AdminLevelExportView, AdminLevelGenerateView, AdminLevelImportView, PublicLevelDetailView, PublicLevelListView, PublicVersionView

from .views import health

urlpatterns = [
    path('inceptivec-gamification-admin/', admin.site.urls),
    path('api/v1/health/', health, name='health'),
    path('api/v1/game-runs/', GameRunStartView.as_view(), name='game-run-start'),
    path(
        'api/v1/game-runs/<uuid:run_id>/complete/',
        GameRunCompleteView.as_view(),
        name='game-run-complete',
    ),
    path('api/v1/leaderboard/', LeaderboardListView.as_view(), name='leaderboard'),
    path('api/v1/levels/', PublicLevelListView.as_view(), name='level-list'),
    path('api/v1/levels/<slug:slug>/', PublicLevelDetailView.as_view(), name='level-detail'),
    path('api/v1/levels/<slug:slug>/versions/<int:version>/', PublicVersionView.as_view(), name='level-version'),
    path('api/v1/admin/levels/', AdminLevelCreateView.as_view(), name='admin-level-create'),
    path('api/v1/admin/levels/import/', AdminLevelImportView.as_view(), name='admin-level-import'),
    path('api/v1/admin/levels/generate/', AdminLevelGenerateView.as_view(), name='admin-level-generate'),
    path('api/v1/admin/levels/<uuid:level_id>/export/', AdminLevelExportView.as_view(), name='admin-level-export'),
    path('api/v1/admin/levels/<uuid:level_id>/<str:action>/', AdminLevelActionView.as_view(), name='admin-level-action'),
    path('api/schema/', SpectacularAPIView.as_view(), name='api-schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='api-schema'), name='api-docs'),
]
