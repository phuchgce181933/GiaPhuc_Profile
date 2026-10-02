# Rule 10 — Validation

Before declaring a task complete, run **drift detection** and the **final
consistency check**.

## Drift detection process

For each pair (X, Y) where X is the source of truth for Y, compare:

| Source (X) | Sanity check on Y |
| ---------- | ----------------- |
| `backend/src/modules/**` router | `docs/UC/UC-PACKAGE.md` API paths |
| `backend/src/modules/**` controller | `docs/plantuml/SD-*.puml` participant names |
| `backend/src/modules/**` service | `docs/plantuml/SD-*.puml` arrow labels |
| `backend/src/models/**` | `docs/plantuml/CD-*.puml` model classes |
| `backend/src/middlewares/**` | `docs/plantuml/SD-*.puml` middleware participants |
| `backend/tests/**` | `docs/tests/UNIT-TEST.md` row count and pass/fail |
| `backend/.env.example` | `README.md` env table |
| `frontend/src/api/**` | `frontend/src/pages/**` axios calls |
| `backend/scripts/seed.js` | `docs/UC/UC-PACKAGE.md` role/permission list |
| `docs/UC/UC-PACKAGE.md` | `docs/tests/SYSTEM-TEST.md` scenario coverage |

## Drift report format

```
DRIFT FOUND:
- file: docs/plantuml/SD-04-Assign-Role.puml
- claim: Service method `assignRole`
- actual: src/modules/staff/staff.service.js defines `assignRole(id, roleId)` ✓ OK
- result: no drift
```

If drift is found, list it explicitly and propose an update. Do not silently
apply the update unless the user has delegated.

## Final consistency matrix

Run `checklists/release-checklist.md` and report each row as PASS / FAIL /
N/A. A single FAIL means the task is not done.
