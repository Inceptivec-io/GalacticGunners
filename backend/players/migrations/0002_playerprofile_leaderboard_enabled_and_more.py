from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('players', '0001_initial')]
    operations = [
        migrations.AddField(model_name='playerprofile', name='leaderboard_enabled', field=models.BooleanField(default=True)),
        migrations.AddField(model_name='playerprofile', name='moderation_state', field=models.CharField(default='VISIBLE', max_length=32)),
    ]
