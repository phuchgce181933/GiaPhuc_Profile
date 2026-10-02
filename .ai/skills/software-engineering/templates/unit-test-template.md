# Unit Test Document Template

Mirror into `docs/tests/UNIT-TEST.md`. One table per test file (or one table
for all — current project uses one table).

## Header table

| # | Test Case | Condition (Precondition / Input) | Confirm (Return / Exception / Log / Result) | Result Type | Passed/Failed | Executed Date |
| - | --------- | -------------------------------- | ------------------------------------------- | ----------- | ------------- | ------------- |

## Column semantics

| Column | Allowed values |
| ------ | -------------- |
| Result Type | `N` (Normal — return path), `A` (Abnormal — exception), `B` (Boundary) |
| Passed/Failed | `Passed`, `Failed`, `Not Executed` |
| Executed Date | ISO date `YYYY-MM-DD` of last run |

## Example row

| 1 | Create staff successfully | Pre: roles seeded; Input: `{fullName, email, phone, roleId}` | Return: user with `_id`, `emailNotificationSent=true`. Log: `Staff account created successfully`. | N | Passed | 2026-09-30 |

## Summary table (append at end)

| Metric | Value |
| ------ | ----- |
| Total | <count> |
| Passed | <count> |
| Failed | <count> |
| Not Executed | <count> |

## AI checklist before adding a row

- [ ] Test case exists in `backend/tests/unit/` and is the **last** test in
      alphabetical / numerical order unless intentional.
- [ ] `Condition` reflects the actual Jest setup.
- [ ] `Confirm` reflects the actual assertion (not the aspirational behaviour).
- [ ] `Executed Date` is the date `npm test` was last run.
- [ ] Summary table updated.
- [ ] PASS only if `npm test` actually returned 0 failures on the date.
