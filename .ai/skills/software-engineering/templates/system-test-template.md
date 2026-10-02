# System Test Document Template

Mirror into `docs/tests/SYSTEM-TEST.md`. One table for all scenarios.

## Header table

| # | Scenario | Actor | Precondition | Steps | Expected | Status |
| - | -------- | ----- | ------------ | ----- | -------- | ------ |

## Column semantics

| Column | Allowed values |
| ------ | -------------- |
| Status | `Passed`, `Failed`, `Not Executed` |
| Actor | matches UC actor (Admin / Staff / System) |
| Expected | status code + payload shape, **not** source-code dump |

## Example row

| ST-01 | Create staff + send email | Admin | admin logged in, role STAFF exists, SMTP configured | 1. POST /api/staff with {fullName, email, phone, roleId} 2. Check SMTP | 201 {success, data: {user, userId, emailNotificationSent:true}} | Passed |

## AI checklist before adding a row

- [ ] Scenario corresponds to a UC (cross-link UC id in Notes if needed).
- [ ] Steps are real HTTP requests / UI actions, not pseudo-code.
- [ ] Expected matches what the implementation actually returns.
- [ ] Status reflects the **last** manual or automated run.
- [ ] `Not Executed` rows include a one-line note on the gating reason.

## Coverage matrix (recommended appendix)

| UC | Scenario IDs |
| -- | ------------ |
| UC-01 | ST-01, ST-02, ST-03 |
| UC-02 | ST-04, ST-05 |
| … | … |

Run this appendix whenever you add a UC or a scenario to keep traceability.
