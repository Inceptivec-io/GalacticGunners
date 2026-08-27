import uuid
from django.conf import settings
from django.db import migrations, models
from django.utils import timezone


class Migration(migrations.Migration):
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL), ('leaderboard', '0001_initial')]
    operations = [
        migrations.CreateModel(name='ModerationAuditEvent', fields=[('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)), ('action', models.CharField(max_length=64)), ('target', models.CharField(max_length=128)), ('reason', models.CharField(max_length=240)), ('before', models.JSONField(default=dict)), ('after', models.JSONField(default=dict)), ('created_at', models.DateTimeField(auto_now_add=True)), ('actor', models.ForeignKey(null=True, on_delete=models.deletion.SET_NULL, related_name='leaderboard_audit_events', to=settings.AUTH_USER_MODEL))], options={'ordering': ['-created_at']}),
        migrations.AlterModelOptions(name='leaderboardentry', options={'ordering': ['-score', '-campaign_level_reached', 'accepted_at', 'run_id'], 'permissions': [('can_moderate_leaderboard', 'Can moderate leaderboard')]}),
        migrations.AddField(model_name='leaderboardentry', name='accepted_at', field=models.DateTimeField(default=timezone.now)),
        migrations.AddField(model_name='leaderboardentry', name='campaign_level_reached', field=models.PositiveIntegerField(default=1)),
        migrations.AddField(model_name='leaderboardentry', name='moderation_state', field=models.CharField(choices=[('VISIBLE', 'Visible'), ('SUPPRESSED_ENTRY', 'Suppressed entry'), ('SUPPRESSED_PLAYER', 'Suppressed player')], default='VISIBLE', max_length=32)),
        migrations.AddField(model_name='leaderboardentry', name='suppression_reason', field=models.CharField(blank=True, max_length=240)),
        migrations.AddField(model_name='leaderboardentry', name='victory', field=models.BooleanField(default=False)),
        migrations.AddField(model_name='leaderboardentry', name='visible', field=models.BooleanField(db_index=True, default=True)),
        migrations.AddIndex(model_name='leaderboardentry', index=models.Index(fields=['visible', '-score', '-campaign_level_reached', 'accepted_at'], name='leaderboard_visible_924a2e_idx')),
    ]
