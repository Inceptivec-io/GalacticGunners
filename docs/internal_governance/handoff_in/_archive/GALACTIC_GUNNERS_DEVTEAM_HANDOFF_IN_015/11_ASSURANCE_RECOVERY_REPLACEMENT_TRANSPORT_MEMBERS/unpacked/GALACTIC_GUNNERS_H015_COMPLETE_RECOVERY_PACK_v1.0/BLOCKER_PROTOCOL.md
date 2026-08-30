# Blocker Protocol

Use:

```text
H015_BLOCKER=FOUNDER_AUTHORITY_REQUIRED
REQUIREMENT_ID=<catalogue-id>
CURRENT_SHA=<full-sha>
BLOCKED_ACTION=<exact-action>
EVIDENCE=<paths-and-output>
AUTHORITY_REQUIRED=<one-specific-decision-or-input>
SAFE_WORK_CONTINUING=YES|NO
```

Do not self-author a workaround to missing normative input. Do not stop for ordinary implementation difficulty, failing tests, fixtures, CI work or refactoring. If one row is blocked, continue other authorised safe rows unless the input affects the whole denominator.
