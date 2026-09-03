from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):
    dependencies = [('game_runs', '0005_remove_campaignrun_campaign_run_sequence_bounded_and_more')]

    operations = [
        migrations.RemoveConstraint(
            model_name='campaignrun',
            name='campaign_run_nukes_bounded',
        ),
        migrations.AddConstraint(
            model_name='campaignrun',
            constraint=models.CheckConstraint(
                condition=Q(nukes__gte=0),
                name='campaign_run_nukes_non_negative',
            ),
        ),
    ]
