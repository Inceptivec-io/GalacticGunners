from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('levels', '0001_initial'), ('game_runs', '0001_initial')]
    operations = [
        migrations.AddField(model_name='gamerun', name='level', field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='game_runs', to='levels.level')),
        migrations.AddField(model_name='gamerun', name='level_version', field=models.PositiveIntegerField(blank=True, null=True)),
        migrations.AddField(model_name='gamerun', name='level_checksum', field=models.CharField(blank=True, max_length=64)),
        migrations.AddField(model_name='gamerun', name='seed', field=models.PositiveIntegerField(blank=True, null=True)),
    ]
