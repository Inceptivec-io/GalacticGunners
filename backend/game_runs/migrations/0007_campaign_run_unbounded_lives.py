from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):
    dependencies = [('game_runs', '0006_campaign_run_unbounded_nukes')]

    operations = [
        migrations.RemoveConstraint(model_name='campaignrun', name='campaign_run_lives_bounded'),
        migrations.AddConstraint(
            model_name='campaignrun',
            constraint=models.CheckConstraint(condition=Q(lives__gte=0), name='campaign_run_lives_non_negative'),
        ),
        migrations.AlterField(model_name='campaignrun', name='lives', field=models.PositiveIntegerField(default=3)),
        migrations.AlterField(model_name='campaignrun', name='nukes', field=models.PositiveIntegerField(default=2)),
        migrations.AlterField(model_name='gamerun', name='entry_lives', field=models.PositiveIntegerField(default=3)),
        migrations.AlterField(model_name='gamerun', name='entry_nukes', field=models.PositiveIntegerField(default=2)),
        migrations.AlterField(model_name='gamerun', name='exit_lives', field=models.PositiveIntegerField(blank=True, null=True)),
        migrations.AlterField(model_name='gamerun', name='exit_nukes', field=models.PositiveIntegerField(blank=True, null=True)),
    ]
