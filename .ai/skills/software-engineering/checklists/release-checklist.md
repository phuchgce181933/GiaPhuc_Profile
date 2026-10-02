# Release Checklist

Run before declaring a UC / milestone / release done. A single FAIL means the
release is **not** ready.

## Implementation

- [ ] All in-scope features merged.
- [ ] No FIXME / TODO comments left in the code.
- [ ] No dead code paths.

## Tests

- [ ] `cd backend && npm test` → 0 failures, all expected tests pass.
- [ ] `cd backend && npm run lint` → 0 errors, 0 warnings.
- [ ] `cd frontend && npm run lint` → 0 errors, 0 warnings.
- [ ] `cd frontend && npm run build` → success.
- [ ] At least one system-test scenario executed (or marked `Not Executed`
      with a reason) per UC.

## Documentation

- [ ] README updated (API table, env table, layout).
- [ ] `docs/UC/UC-PACKAGE.md` covers every UC.
- [ ] `docs/tests/UNIT-TEST.md` summary matches `npm test` output.
- [ ] `docs/tests/SYSTEM-TEST.md` status reflects the latest run.
- [ ] BACKLOG.md Status Report has rows for the work items.
- [ ] BACKLOG.md Project Issues has rows for any new debt.

## UML

- [ ] Every UC has a `CD` and an `SD` reference in UC-PACKAGE.md.
- [ ] Every diagram passes `checklists/uml-checklist.md`.
- [ ] PlantUML files render in PlantUML CLI.

## Security & configuration

- [ ] No secrets in the git history (`git log -p | grep -E '(secret|password|MAIL_PASS)'` should be empty after the first commit).
- [ ] No hard-coded environment configuration in any class.
- [ ] `.env.example` is up to date.
- [ ] All env vars used in the code are documented in README.

## Drift

- [ ] `rules/10-validation.md` drift report produced.
- [ ] All drift items either fixed or marked `Accepted` in the response.

## Final sign-off

- [ ] All output sections of the implementation summary (`## 1. Changed` … `## 8. Remaining Issues`) are populated.
- [ ] Each PASS/FAIL row in this checklist is also reflected in the response.
