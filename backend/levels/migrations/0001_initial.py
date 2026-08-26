import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(
            name='Level',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('slug', models.SlugField(max_length=64, unique=True)),
                ('name', models.CharField(max_length=128)),
                ('campaign', models.CharField(default='v1', max_length=64)),
                ('sequence', models.PositiveIntegerField()),
                ('archived', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ], options={'ordering': ['campaign', 'sequence']},
        ),
        migrations.CreateModel(
            name='LevelVersion',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('version', models.PositiveIntegerField()),
                ('schema_version', models.CharField(default='1.0', max_length=16)),
                ('config', models.JSONField()), ('checksum', models.CharField(editable=False, max_length=64)),
                ('seed_policy', models.JSONField(blank=True, default=dict)),
                ('status', models.CharField(choices=[('DRAFT', 'Draft'), ('VALIDATED', 'Validated'), ('PUBLISHED', 'Published'), ('SUPERSEDED', 'Superseded'), ('ARCHIVED', 'Archived')], default='DRAFT', max_length=16)),
                ('created_at', models.DateTimeField(auto_now_add=True)), ('published_at', models.DateTimeField(blank=True, null=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('level', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='versions', to='levels.level')),
                ('supersedes', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='superseded_by', to='levels.levelversion')),
            ], options={'ordering': ['level', '-version']},
        ),
        migrations.CreateModel(
            name='LevelAuditEvent',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('action', models.CharField(max_length=32)), ('detail', models.JSONField(blank=True, default=dict)), ('created_at', models.DateTimeField(auto_now_add=True)),
                ('actor', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('level', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='audit_events', to='levels.level')),
                ('version', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='audit_events', to='levels.levelversion')),
            ], options={'ordering': ['-created_at']},
        ),
        migrations.AddField(model_name='level', name='active_version', field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='levels.levelversion')),
        migrations.AddConstraint(model_name='levelversion', constraint=models.UniqueConstraint(fields=('level', 'version'), name='level_version_unique')),
    ]
