import json
from pathlib import Path

from django.core.management.base import BaseCommand

from plans.models import ServicePlan


class Command(BaseCommand):
    help = 'Idempotently seed the Founder-authorised H015 service plan catalogue.'

    def handle(self, *args, **options):
        source = Path(__file__).resolve().parents[2] / 'fixtures' / 'service-plans.seed.json'
        payload = json.loads(source.read_text(encoding='utf-8'))
        for plan in payload['plans']:
            instance, created = ServicePlan.objects.get_or_create(
                code=plan['code'],
                defaults={key: plan[key] for key in ('display_name', 'status', 'sort_order', 'limits', 'capabilities')},
            )
            if not created:
                instance.display_name = plan['display_name']
                instance.status = plan['status']
                instance.sort_order = plan['sort_order']
                instance.limits = plan['limits']
                instance.capabilities = plan['capabilities']
                instance.save()
        self.stdout.write(self.style.SUCCESS('Seeded H015 service plan catalogue.'))
