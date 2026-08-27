# H013 PLAYER + ADMIN UI CONTRACT

## 1. Player-facing leaderboard surface

Next.js owns the product surface.

Required route:
use current product-shell route convention; recommended:

`/leaderboard`

Required UI:
- Galactic Gunners branded panel/background;
- global ranking;
- rank;
- display name;
- score;
- campaign level reached;
- victory mark;
- player highlight;
- player's current rank/best score;
- loading;
- empty state;
- backend unavailable state;
- pagination/load-more as needed.

No developer terminology.

No generic unstyled HTML table.

Use the established production visual language and leaderboard panel asset when available.

## 2. Leaderboard entry after play

After a validated run:
- if authenticated and leaderboard eligible, reflect validated result;
- do not show client score as globally accepted before server validation;
- rejection should not expose anti-cheat internals to normal player.

Player-facing result example:

```text
RUN COMPLETE
SCORE 47,850
VALIDATED
GLOBAL RANK #82
```

If rejected:

```text
RUN COMPLETE
SCORE NOT ELIGIBLE FOR GLOBAL RANKING
```

No detailed exploit feedback.

## 3. Display name UX

Authenticated player without leaderboard display name:
- prompt before first eligible leaderboard publication or through profile/settings;
- allow later moderated change subject to rate limit.

## 4. Admin moderation UI

Under canonical hidden admin namespace:

`/inceptivec-gamification-admin`

Subroute recommended:

`/inceptivec-gamification-admin/leaderboard`

Required:
- leaderboard entries table;
- search/filter;
- validated/rejected run inspection;
- player moderation state;
- suppress/restore;
- rename/moderate display name;
- validation detail drawer/page;
- audit history;
- reason input;
- confirmation for destructive visibility changes.

RBAC required server-side.

## 5. No hidden-route security assumption

Even if route discovered:
- anonymous denied;
- normal player denied;
- authorized moderator/admin allowed.
