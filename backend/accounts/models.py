import uuid
import re
import unicodedata

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.functions import Lower

class User(AbstractUser):
    """Authoritative Galactic Gunners account identity."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta(AbstractUser.Meta):
        constraints = [models.UniqueConstraint(Lower('username'), name='account_username_ci_unique')]

    def clean(self):
        super().clean()
        self.username = unicodedata.normalize('NFKC', (self.username or '').strip())
        if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{2,29}', self.username):
            raise ValidationError({'username': 'Username must be 3-30 ASCII letters, digits, underscores or hyphens.'})
