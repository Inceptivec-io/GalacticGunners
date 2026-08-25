# FINAL SCORE CONSISTENCY

## Observed defect

Current Game Over screenshot shows contradictory visible scores.

Example:
- HUD score: `1699`
- result final score: `1702`

This is unacceptable unless an explicit bonus system accounts for the difference, and no such visible explanation currently exists.

## Locked requirement

There must be one authoritative final score.

Preferred model:

```text
FINAL_SCORE = currentScore at result transition
```

Then:

- freeze `FINAL_SCORE`;
- use the same value for result display;
- stop subsequent score mutation.

## Display options

### Preferred
Hide gameplay HUD beneath result screen and show final score only in result panel.

OR

### Allowed
If top-left HUD remains visible, it must display the exact same final score.

Not allowed:

```text
HUD_SCORE != RESULT_SCORE
```

## Investigation

Find any asynchronous/late callbacks after death:
- explosions;
- enemy cleanup;
- delayed collisions;
- bonus callbacks;
- timers.

No post-death gameplay callback may silently mutate the score after finalisation.

## Acceptance

```text
AUTHORITATIVE_FINAL_SCORE_COUNT = 1
POST_RESULT_SCORE_MUTATION = 0
VISIBLE_SCORE_CONTRADICTION = 0
```
