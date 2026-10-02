# Rule 01 — Source of Truth

When information conflicts, use this priority (highest first):

1. **Explicit current user requirement** — only the literal current ask.
2. **Actual source code** — `backend/src/**`, `frontend/src/**`.
3. **Actual tests** — `backend/tests/**` and their last run output.
4. **Existing API implementation** — router → controller → service path.
5. **Existing model / repository implementation**.
6. **Existing approved UC** — `docs/UC/UC-PACKAGE.md`.
7. **Existing Class Diagram** — `docs/plantuml/CD-*.puml`.
8. **Existing Sequence Diagram** — `docs/plantuml/SD-*.puml`.
9. README, `docs/DOC-GUIDE.md`, this skill.
10. Previous AI assumptions (lowest — always re-verify).

## Forbidden behaviours

- Editing source code **silently** to match an outdated diagram.
- Editing a diagram **silently** to match unstated new behaviour.
- Picking a winner between source code and a UC spec without reporting the
  discrepancy and waiting for the user.

## Required behaviour

- Document the discrepancy explicitly in the response (file, claim, truth).
- Recommend an update; do not apply it without confirmation **unless** the user
  has explicitly delegated the decision to the skill.
- When delegating the decision is the default (this skill), update the doc to
  match the implementation **only if** the implementation was the explicitly
  approved target of the task.

## Drift summary format

```
DRIFT FOUND:
- file: docs/plantuml/SD-04-Assign-Role.puml
- claim: "Controller -> Service : assignRole(id, roleId)"
- actual: Service method is `setRole(userId, roleId)` (see staff.service.js L42)
- recommended update: rename arrow label to `setRole(userId, roleId)`
```
