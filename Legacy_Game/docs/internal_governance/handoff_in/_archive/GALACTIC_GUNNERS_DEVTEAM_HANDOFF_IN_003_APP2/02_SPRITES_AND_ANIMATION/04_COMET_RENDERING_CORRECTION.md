# COMET RENDERING CORRECTION

## Observed defect

The runtime is currently rendering a composite source containing multiple comet variants together.

This is wrong.

## Required behaviour

Each comet spawn must render:

```text
ONE COMET ONLY
```

The supplied comet artwork contains multiple distinct comet variants.

On each legitimate spawn:

1. select exactly one variant;
2. render only that variant;
3. use one matching collision body;
4. preserve comet movement/behaviour;
5. randomise variant per spawn.

Do not render the source strip or multiple comet variants as one object.

## Randomisation

Allowed:

```text
variant = random(approved comet variants)
```

Not allowed:
- source sheet displayed as one object;
- four comets treated as one collider;
- deterministic same variant forever unless Founder later requests it.

## Acceptance

```text
COMET_OBJECTS_PER_SPAWN = 1
COMET_VARIANT_RANDOMISATION = PASS
COMET_SHEET_BLEED = 0
COMET_COLLIDER = SINGLE COMET
```
