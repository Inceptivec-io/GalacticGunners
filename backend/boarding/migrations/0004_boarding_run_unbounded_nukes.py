from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):
    dependencies = [('boarding', '0003_interior_game_project_interiorversion_created_by_and_more')]

    operations = [
        migrations.RemoveConstraint(
            model_name='boardingrun',
            name='boarding_start_resources_bounded',
        ),
        migrations.AddConstraint(
            model_name='boardingrun',
            constraint=models.CheckConstraint(
                condition=Q(lives_start__gte=0, lives_start__lte=3, nukes_start__gte=0),
                name='boarding_start_resources_non_negative',
            ),
        ),
    ]
