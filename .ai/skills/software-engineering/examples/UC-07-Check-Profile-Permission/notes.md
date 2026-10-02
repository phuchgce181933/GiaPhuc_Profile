# UC-07 — Maintenance Notes

> This file contains maintenance and validation metadata.
> It is not the primary developer documentation for this UC.
> For business flow, see `README.md`.

## 1. Change Impact Matrix

| Area | Affected? | Files | Reason |
| ---- | --------- | ----- | ------ |
| Backend | Yes | `backend/src/middlewares/permission.middleware.js` | core middleware |
| Backend tests | Yes | `backend/tests/unit/permission.middleware.test.js` | UT-12..17 |
| Frontend | No | — | backend-only |
| Database | No | — | no schema change |
| Permission | No | — | this UC **enforces** permissions |
| Email/External Service | No | — | — |
| UC | Yes | `docs/UC/UC-PACKAGE.md` | UC-07 body |
| Class Diagram | Yes | `docs/plantuml/CD-07-Check-Profile-Permission.puml` | `[NEEDS VERIFICATION]` — was previously shared with CD-01 |
| Sequence Diagram | Yes | `docs/plantuml/SD-07-Check-Profile-Permission.puml` | `[NEEDS VERIFICATION]` — was previously authZ branch in SD-02 |
| Unit Test doc | Yes | `docs/tests/UNIT-TEST.md` | UT-12..17 |
| System Test doc | No | — | implicit across all protected ST rows |
| Backlog | Yes | Status #3 (RBAC layer) | |
| README (project) | No | — | internal behaviour |

## 2. Drift observations

- **Sub-flow violation (NEEDS VERIFICATION)**: previously documented as
  "authZ branch inside `SD-02`". Violates rule 03. Fix: extract
  `SD-07-Check-Profile-Permission.puml` from authZ branch in source repo.
- **AND-vs-ANY semantics**: UC body said "If X is in the set → continue".
  Actual behaviour is "If **all** required permissions are in the set →
  continue". `UT-17` documents this. Update UC body wording, do NOT
  change implementation.

## 3. Source mapping (last verified: 2026-10-02)

| Layer | Path | Notes |
| ----- | ---- | ----- |
| Middleware | `backend/src/middlewares/permission.middleware.js` | `requirePermission(...perms)` |
| Constants | `backend/src/constants/permissions.js` | `VIEW_STAFF`, `CREATE_STAFF`, `UPDATE_STAFF`, `ASSIGN_ROLE`, `VIEW_PROFILE` |
| Role model | `backend/src/models/role.model.js` | `permissions: [String]` |
| User model | `backend/src/models/user.model.js` | `role: ref('Role')` (populate) |

## 4. Validation checklist

- [ ] `npm test` → UT-12..17 pass (especially UT-17 for AND semantics).
- [ ] `requirePermission('A', 'B')` with only A in role → 403 (not pass).
- [ ] `req.user` missing → 401 (not 403).
- [ ] `req.user.role === null` → 403.
- [ ] Source repo: verify `SD-07-Check-Profile-Permission.puml` exists;
      if not, extract from `SD-02`.

## 5. Dependency notes (per `rules/12`)

None added for this UC.