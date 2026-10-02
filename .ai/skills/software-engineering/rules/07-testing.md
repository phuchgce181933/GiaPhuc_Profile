# Rule 07 — Testing

Two test-doc families:

- **Unit Test** — `docs/tests/UNIT-TEST.md` (one row per Jest test case).
- **System Test** — `docs/tests/SYSTEM-TEST.md` (one row per end-to-end
  scenario).

## Required columns

Unit Test (`UT-XX`):

| # | Test Case | Condition | Confirm | Result Type | Passed/Failed | Executed Date |

System Test (`ST-XX`):

| # | Scenario | Actor | Precondition | Steps | Expected | Status |

Status is one of: `Passed`, `Failed`, `Not Executed`.

## Truthfulness rules

- **Never claim a test passes without a command + observed output.**
- **Never document a test that has not been implemented.**
  Mark `Not Executed` and add a "to implement" note.
- A row's "Expected" column must match what the source code actually does, not
  what an aspirational UC describes.

## When adding a test

1. Add the Jest case in `backend/tests/unit/`.
2. Run `npm test` and capture the count of passed / failed.
3. Add a row in `UNIT-TEST.md` with the actual date.
4. Update the Summary table at the bottom of the doc.

## When adding a system test

1. Identify the ST id (`ST-XX`).
2. Run the scenario manually (curl, browser, `Invoke-WebRequest`).
3. Record the actual observed behaviour.
4. Mark `Passed` only when the response matches the documented expectation.
5. If `Failed` or `Not Executed`, add a one-line note explaining the gap.

## Templates

- `templates/unit-test-template.md` — full template + example row.
- `templates/system-test-template.md` — full template + example row.
