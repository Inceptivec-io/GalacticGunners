from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):
    dependencies = [('boarding', '0004_boarding_run_unbounded_nukes')]

    operations = [
        migrations.RemoveConstraint(model_name='boardingrun', name='boarding_start_resources_non_negative'),
        migrations.AddConstraint(
            model_name='boardingrun',
            constraint=models.CheckConstraint(
                condition=Q(lives_start__gte=0, nukes_start__gte=0),
                name='boarding_start_resources_non_negative',
            ),
        ),
        migrations.AlterField(model_name='boardingrun', name='lives_start', field=models.PositiveIntegerField()),
        migrations.AlterField(model_name='boardingrun', name='lives_end', field=models.PositiveIntegerField(blank=True, null=True)),
        migrations.AlterField(model_name='boardingrun', name='nukes_start', field=models.PositiveIntegerField()),
        migrations.AlterField(model_name='boardingrun', name='nukes_end', field=models.PositiveIntegerField(blank=True, null=True)),
    ]
