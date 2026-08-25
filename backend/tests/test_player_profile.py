import pytest
from django.core.exceptions import ValidationError

from accounts.models import User
from players.models import PlayerProfile


@pytest.mark.django_db
def test_player_profile_normalizes_display_name():
    user = User.objects.create_user(username='pilot')
    profile = PlayerProfile.objects.create(user=user, display_name='  SPACE   ACE  ')

    assert profile.display_name == 'SPACE ACE'


@pytest.mark.django_db
def test_player_profile_requires_display_name():
    user = User.objects.create_user(username='pilot')

    with pytest.raises(ValidationError):
        PlayerProfile.objects.create(user=user, display_name='   ')
