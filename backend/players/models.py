import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

class PlayerProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='player_profile',
    )
    display_name = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_name']

    def clean(self):
        super().clean()
        self.display_name = ' '.join((self.display_name or '').split())
        if not self.display_name:
            raise ValidationError({'display_name': 'Display name is required.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.display_name
