# UC-05 — Maintenance Notes

> This file contains maintenance and validation metadata.
> It is not the primary developer documentation for this UC.
> For business flow, see `README.md`.

## 1. Change Impact Matrix

| Area | Affected? | Files | Reason |
| ---- | --------- | ----- | ------ |
| Backend | Yes | `backend/src/modules/staff/{router,controller,service}.js` | `PATCH /:id/status` |
| Backend tests | Yes | `backend/tests/unit/staff.service.test.js`, `backend/tests/unit/auth.middleware.test.js` | service + inactive-blocking tests |
| Frontend | Yes | `frontend/src/pages/StaffListPage.jsx` (button), `frontend/src/api/staff.api.js#setActive` | UI + axios |
| Database | No | — | no schema change |
| Permission | Yes | `backend/src/constants/permissions.js` | `UPDATE_STAFF` (reused from UC-03) |
| Email/External Service | No | — | no email on status toggle |
| UC | Yes | `docs/UC/UC-PACKAGE.md` | UC-05 body |
| Class Diagram | Yes | `docs/plantuml/CD-05-Activate-Deactivate.puml` | was previously `CD-01` (drift, fixed) |
| Sequence Diagram | Yes | `docs/plantuml/SD-05-Activate-Deactivate.puml` | already 1:1 |
| Unit Test doc | Yes | `docs/tests/UNIT-TEST.md` | UT-23, UT-24 |
| System Test doc | Yes | `docs/tests/SYSTEM-TEST.md` | ST-10, ST-11 |
| Backlog | Yes | edit existing row | |
| README (project) | Yes | API table (PATCH /api/staff/:id/status) | |

## 2. Drift observations

- **Previous CD reference drift**: listed `CD-01-Staff-Management.puml`.
  Multi-UC diagram. Fixed to `CD-05-Activate-Deactivate.puml`.
- **UC-05 vs UC-03 boundary**: both can flip `isActive`. UC-05 is the
  dedicated toggle endpoint (lightweight, focused on status). UC-03 is
  the full PUT (any field). Do NOT merge them — different API shapes,
  different validators, different audit potential.

## 3. Source mapping (last verified: 2026-10-02)

| Layer | Path | Notes |
| ----- | ---- | ----- |
| Router PATCH /:id/status | `backend/src/modules/staff/staff.router.js` | uses `UPDATE_STAFF` |
| Controller setActive | `backend/src/modules/staff/staff.controller.js` | delegates to service |
| Service setActive | `backend/src/modules/staff/staff.service.js` | `findByIdAndUpdate` |
| authenticate (inactive block) | `backend/src/middlewares/auth.middleware.js` | check `req.user.isActive === true` |

## 4. Validation checklist

- [ ] `npm test` → UT-23, UT-24 pass.
- [ ] ST-10 happy path returns 200 + new `isActive` value.
- [ ] ST-11 deactivated user next request returns 403 (not 401).
- [ ] No email is sent (assert by SMTP log absence).

## 5. Dependency notes (per `rules/12`)

None added for this UC.