# Error and Transport Policy

## Envelope

Every JSON error uses:

```json
{
  "code": "PERMISSION_DENIED",
  "message": "You do not have permission to perform this action.",
  "correlation_id": "01K...",
  "field_errors": {}
}
```

No stack trace, model repr, SQL, credential, capability, password, email, internal filesystem path or hidden object detail appears in production responses.

## Status mapping

| HTTP | Use |
|---:|---|
| 400 | malformed JSON, missing/unknown field, type/format failure |
| 401 | no/invalid session where authentication is required |
| 403 | CSRF, authenticated permission, membership, entitlement or ownership denial |
| 404 | absent resource or inaccessible private object whose existence must not leak |
| 409 | uniqueness, lifecycle, already-owned, stale version, active-attempt or idempotency conflict |
| 413 | body/trace/import exceeds bounded size |
| 422 | schema-valid but semantically impossible, checksum invalid, hostile trace/config |
| 429 | throttle exceeded with `Retry-After` |

## Stable codes

```text
INVALID_REQUEST UNKNOWN_FIELD AUTHENTICATION_REQUIRED INVALID_CREDENTIALS
CSRF_FAILED ACCOUNT_INACTIVE PERMISSION_DENIED OBJECT_NOT_FOUND
USERNAME_UNAVAILABLE DISPLAY_NAME_UNAVAILABLE PASSWORD_REJECTED
ORGANIZATION_INACTIVE MEMBERSHIP_REQUIRED ENTITLEMENT_REQUIRED
CROSS_TENANT_DENIED LAST_BUSINESS_ADMIN OWNER_SCOPE_IMMUTABLE
CONTENT_NOT_EDITABLE INVALID_LIFECYCLE_TRANSITION VERSION_IMMUTABLE
ASSET_NOT_FOUND ASSET_NOT_AUTHORIZED ASSET_RETIRED ASSET_CHECKSUM_MISMATCH
LEVEL_NOT_PUBLISHED LEVEL_VERSION_MISMATCH LEVEL_CHECKSUM_MISMATCH
CAMPAIGN_NOT_ACTIVE CAMPAIGN_ALREADY_OWNED CAMPAIGN_CLAIM_INVALID
CAMPAIGN_CLAIM_EXPIRED CAMPAIGN_NOT_CLAIMABLE CAMPAIGN_SEQUENCE_MISMATCH
ACTIVE_ATTEMPT_EXISTS RUN_ALREADY_SUBMITTED DUPLICATE_SUBMISSION
RUN_VALIDATION_REJECTED SCORE_MISMATCH RESOURCE_STATE_IMPOSSIBLE
BOARDING_NOT_ELIGIBLE BOARDING_RUN_CONFLICT BOARDING_TRACE_INVALID
BOARDING_STATE_DIGEST_MISMATCH BOARDING_RETURN_ALREADY_APPLIED
PAYLOAD_TOO_LARGE RATE_LIMITED SERVICE_UNAVAILABLE
```

Field errors map field names to arrays of human-safe strings. Login always returns generic `INVALID_CREDENTIALS`; it never distinguishes unknown username from wrong password.

## Request rules

- Mutation schemas use `additionalProperties: false`.
- Content-Type is `application/json`; imports explicitly allow bounded JSON only.
- Default JSON body maximum: 256 KiB. Level/interior import maximum: 1 MiB. Level event trace maximum: 2 MiB/20,000 events. Boarding remains at most 256 KiB/512 events unless implementation proves a lower safe bound.
- Cursor pagination default 20, maximum 100.
- UUID/capabilities in headers/body; capabilities never query parameters.
- Mutation idempotency keys are required for run/claim/Boarding terminal operations and scoped to actor/capability plus endpoint.
- Sensitive/auth/capability responses send `Cache-Control: no-store`.

## Compatibility

Existing `/api/v1` endpoint behaviour must be reconciled to this contract in the same PR. If an old field cannot be safely removed, accept it only through a documented compatibility serializer and return the canonical response; add a deprecation test/document. Do not maintain two contradictory authorities.
