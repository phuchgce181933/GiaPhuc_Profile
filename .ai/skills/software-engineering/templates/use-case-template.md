# Use Case Template

Mirror this template into `docs/UC/UC-PACKAGE.md`. Do **not** create a separate
`UC-XX.md` per use case — the package file is canonical.

## 1 : 1 : 1 rule

Every UC must have **exactly one Class Diagram** and **exactly one Sequence
Diagram**, named:

- `CD-XX-<UCName>.puml`
- `SD-XX-<UCName>.puml`

The same `XX` is used across all three artefacts. The traceability table in
`docs/UC/UC-PACKAGE.md` is therefore 1 : 1 : 1, not M : N.

Before creating a new UC, apply **`rules/13-use-case-optimization-and-grouping.md`**
to confirm this is a real new user goal, not a button / endpoint /
side-effect / CRUD variation.

---

## UC-XX — <Title>

| Field | Value |
| ----- | ----- |
| UC Name | <Title> |
| UC ID | UC-XX |
| Feature | <Module / area> |
| Actor | <Admin / Staff / System / …> |
| Description | <One paragraph — what the UC accomplishes.> |
| Precondition | <DB / role / state / auth prerequisites.> |
| Main Flow | 1. … 2. … 3. … |
| Alternative Flow | <branches like 1a, 1b — error or optional paths.> |
| Exception Flow | <Error responses: 400/401/403/404/409/500.> |
| Postcondition | <System state after success.> |
| Related API | <method + path list> |
| Permission | <permission constant or "any authenticated user"> |
| Related classes | <class names with paths> |
| Related tests | <UT-XX, ST-XX ids> |
| Class Diagram | CD-XX |
| Sequence Diagram | SD-XX |

---

## How to fill it (AI checklist)

- [ ] UC ID is unused. If unsure, check `docs/UC/UC-PACKAGE.md` for the next free number.
- [ ] Actor is one of the existing roles in `seed.js`.
- [ ] Main Flow steps reference real method names.
- [ ] Permission matches `backend/src/constants/permissions.js`.
- [ ] API paths match the router file.
- [ ] Exception Flow lists only the status codes the endpoint actually returns.
- [ ] Related tests have real `UT-XX` / `ST-XX` ids (or `Not Executed` marker).

## Anti-patterns

- A UC without an Actor or with a generic "User".
- A Main Flow that mentions a class / method that does not exist.
- A UC that overlaps with an existing one — use Related UC instead.
