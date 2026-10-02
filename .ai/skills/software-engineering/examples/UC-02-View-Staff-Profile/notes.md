# UC-02 — Maintenance Notes

> This file contains maintenance and validation metadata.
> It is not the primary developer documentation for this UC.
> For business flow, see `README.md`.

## 1. Change Impact Matrix

| Area | Affected? | Files | Reason |
| ---- | --------- | ----- | ------ |
| Backend | Yes | `backend/src/modules/profile/{router,controller,service}.js`, `backend/src/modules/staff/staff.controller.js` (`getOne`), `backend/src/modules/staff/staff.router.js` | two endpoints share the UC |
| Backend tests | Yes | `backend/tests/unit/permission.middleware.test.js`, `backend/tests/unit/staff.controller.test.js` | UT-12..17 |
| Frontend | Yes | `frontend/src/pages/StaffViewPage.jsx`, `frontend/src/pages/ProfilePage.jsx`, `frontend/src/api/staff.api.js`, `frontend/src/api/profile.api.js` | two consumers |
| Database | No | — | no schema change |
| Permission | Yes | `backend/src/constants/permissions.js` | `VIEW_PROFILE`, `VIEW_STAFF` |
| Email/External Service | No | — | — |
| UC | Yes | `docs/UC/UC-PACKAGE.md` | UC-02 body + UC-07 (authZ step) cross-ref |
| Class Diagram | Yes | `docs/plantuml/CD-02-View-Staff-Profile.puml` | was previously also `CD-01` (drift, fixed) |
| Sequence Diagram | Yes | `docs/plantuml/SD-02-View-Staff-Profile.puml` | was previously also shared with UC-07 (drift, fixed) |
| Unit Test doc | Yes | `docs/tests/UNIT-TEST.md` | UT-12..17 |
| System Test doc | Yes | `docs/tests/SYSTEM-TEST.md` | ST-04, ST-05 |
| Backlog | Yes | Status #5 (Profile module) | |
| README (project) | Yes | API table (two endpoints) | |

## 2. Drift observations

- **Permission divergence (open)**: `/api/staff/:id` uses `VIEW_STAFF`;
  `/api/profile/:id` uses `VIEW_PROFILE`. Both exist in source. UC body
  mentions both. Track in BACKLOG if product wants to align the
  permissions.
- **Previous CD/SD reference drift**: this example previously listed
  `CD-01` + `CD-02` and shared SD with UC-07. Fixed to `CD-02-View-Staff-Profile`
  + `SD-02-View-Staff-Profile` (1 UC = 1 CD + 1 SD per rule 03).

## 3. Source mapping (last verified: 2026-10-02)

| Layer | Path | Notes |
| ----- | ---- | ----- |
| Staff router GET /:id | `backend/src/modules/staff/staff.router.js` | uses `VIEW_STAFF` |
| Profile router GET /:id | `backend/src/modules/profile/profile.router.js` | uses `VIEW_PROFILE` |
| Staff getOne | `backend/src/modules/staff/staff.controller.js` | delegates to staff.service |
| Profile getOne | `backend/src/modules/profile/profile.controller.js` | delegates to profile.service |
| Profile service | `backend/src/modules/profile/profile.service.js` | `getProfileById` |

## 4. Validation checklist

- [ ] Both endpoints exist in their routers.
- [ ] ST-04 returns 200 + safe DTO (no `passwordHash`).
- [ ] ST-05 returns 403 when permission missing.
- [ ] No drive-by edits to CD-01 / CD-08 (UC-01 / UC-08 keep their own).

## 5. Dependency notes (per `rules/12`)

None added for this UC.