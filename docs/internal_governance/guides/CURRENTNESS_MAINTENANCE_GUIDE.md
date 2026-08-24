# Currentness Maintenance Guide

For every material change ask:

1. Did architecture meaning change? Update architecture standard/diagram.
2. Did an interface change? Update OpenAPI/schema/consumer docs/tests.
3. Did persistent data change? Update models/migrations/schema guidance/tests.
4. Did an environment/deployment change? Update environment/deployment guide/currentness.
5. Did developer/operator workflow change? Update the relevant guide.
6. Did naming/namespace meaning change? Update naming standard and references.
7. Did an accepted behavioural contract change? Update fixtures and baseline/currentness.

Do not create new documents when an existing current concern should be refined. Preserve superseded versions in the appropriate archive when version succession is necessary.
