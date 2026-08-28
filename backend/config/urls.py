from django.conf import settings
from django.contrib import admin
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from game_runs.views import GameRunCompleteView, GameRunStartView
from boarding.views import BoardingCompleteView, BoardingRunDetailView, BoardingStartView
from leaderboard.views import LeaderboardListView, LeaderboardMeView, ModerationView
from players.api import LeaderboardProfileView
from levels.views import AdminCoreLevelAuthorityView, AdminLevelActionView, AdminLevelCreateView, AdminLevelDraftView, AdminLevelExportView, AdminLevelGenerateView, AdminLevelImportView, AdminLevelPreviewView, PublicLevelDetailView, PublicLevelListView, PublicVersionView
from accounts.api import CsrfView, LoginView, LogoutView, RegisterView, SessionView
from accounts.admin_api import AdminOperationsView
from campaigns.views import CampaignRunCompleteEntryView, CampaignRunStartView
from organizations.api import PortalMapCreateView, PortalMapDraftView, PortalMapPreviewView, PortalOrganizationView, PortalOrganizationsView
from assets.api import AssetCatalogueView

from .views import build_provenance, health

urlpatterns = [
    path('api/v1/health/', health, name='health'),
    path('api/v1/system/build/', build_provenance, name='build-provenance'),
    path('api/v1/auth/csrf/', CsrfView.as_view(), name='csrf'),
    path('api/v1/auth/session/', SessionView.as_view(), name='session'),
    path('api/v1/auth/me/', SessionView.as_view(), name='auth-me'),
    path('api/v1/auth/login/', LoginView.as_view(), name='login'),
    path('api/v1/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/v1/auth/register/', RegisterView.as_view(), name='register'),
    path('api/v1/campaign-runs/start/', CampaignRunStartView.as_view(), name='campaign-run-start'),
    path('api/v1/campaign-runs/<uuid:run_id>/complete-entry/', CampaignRunCompleteEntryView.as_view(), name='campaign-run-complete-entry'),
    path('api/v1/portal/organizations/', PortalOrganizationsView.as_view(), name='portal-organizations'),
    path('api/v1/portal/organizations/<slug:slug>/', PortalOrganizationView.as_view(), name='portal-organization'),
    path('api/v1/portal/organizations/<slug:slug>/maps/', PortalMapCreateView.as_view(), name='portal-map-create'),
    path('api/v1/portal/organizations/<slug:slug>/maps/<uuid:level_id>/drafts/', PortalMapDraftView.as_view(), name='portal-map-draft-save'),
    path('api/v1/portal/organizations/<slug:slug>/maps/<uuid:level_id>/preview/<str:checksum_value>/', PortalMapPreviewView.as_view(), name='portal-map-preview'),
    path('api/v1/assets/catalogue/', AssetCatalogueView.as_view(), name='asset-catalogue'),
    path('api/v1/game-runs/', GameRunStartView.as_view(), name='game-run-start'),
    path(
        'api/v1/game-runs/<uuid:run_id>/complete/',
        GameRunCompleteView.as_view(),
        name='game-run-complete',
    ),
    path('api/v1/game-runs/<uuid:game_run_id>/boarding-runs/start/', BoardingStartView.as_view(), name='boarding-run-start'),
    path('api/v1/boarding-runs/<uuid:boarding_run_id>/', BoardingRunDetailView.as_view(), name='boarding-run-detail'),
    path('api/v1/boarding-runs/<uuid:boarding_run_id>/complete/', BoardingCompleteView.as_view(), name='boarding-run-complete'),
    path('api/v1/leaderboard/', LeaderboardListView.as_view(), name='leaderboard'),
    path('api/v1/leaderboard/me/', LeaderboardMeView.as_view(), name='leaderboard-me'),
    path('api/v1/player/leaderboard-profile/', LeaderboardProfileView.as_view(), name='leaderboard-profile'),
    path('api/v1/admin/leaderboard/<str:resource>/', ModerationView.as_view(), name='leaderboard-admin-list'),
    path('api/v1/admin/leaderboard/<str:resource>/<uuid:entry_id>/<str:action>/', ModerationView.as_view(), name='leaderboard-admin-action'),
    path('api/v1/admin/operations/<str:resource>/', AdminOperationsView.as_view(), name='admin-operations'),
    path('api/v1/admin/game-runs/<uuid:entry_id>/validation/', ModerationView.as_view(), {'resource': 'runs', 'action': 'validation'}, name='game-run-validation'),
    path('api/v1/levels/', PublicLevelListView.as_view(), name='level-list'),
    path('api/v1/levels/<slug:slug>/', PublicLevelDetailView.as_view(), name='level-detail'),
    path('api/v1/levels/<slug:slug>/versions/<int:version>/', PublicVersionView.as_view(), name='level-version'),
    path('api/v1/admin/levels/', AdminLevelCreateView.as_view(), name='admin-level-create'),
    path('api/v1/admin/levels/authority/', AdminCoreLevelAuthorityView.as_view(), name='admin-level-authority'),
    path('api/v1/admin/levels/import/', AdminLevelImportView.as_view(), name='admin-level-import'),
    path('api/v1/admin/levels/generate/', AdminLevelGenerateView.as_view(), name='admin-level-generate'),
    path('api/v1/admin/levels/<uuid:level_id>/export/', AdminLevelExportView.as_view(), name='admin-level-export'),
    path('api/v1/admin/levels/<uuid:level_id>/drafts/', AdminLevelDraftView.as_view(), name='admin-level-draft-save'),
    path('api/v1/admin/levels/<uuid:level_id>/preview/<str:checksum_value>/', AdminLevelPreviewView.as_view(), name='admin-level-preview'),
    path('api/v1/admin/levels/<uuid:level_id>/<str:action>/', AdminLevelActionView.as_view(), name='admin-level-action'),
    path('api/schema/', SpectacularAPIView.as_view(), name='api-schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='api-schema'), name='api-docs'),
]

if settings.ENABLE_DJANGO_ADMIN:
    urlpatterns.insert(0, path('django-admin/', admin.site.urls))
