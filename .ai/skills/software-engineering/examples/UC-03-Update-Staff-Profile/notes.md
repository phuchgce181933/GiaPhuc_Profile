# UC-03 — Maintenance Notes

> This file contains maintenance and validation metadata.
> It is not the primary developer documentation for this UC.
> For business flow, see `README.md`.

## 1. Change Impact Matrix

| Area | Affected? | Files | Reason |
| ---- | --------- | ----- | ------ |
| Backend | Yes | `backend/src/modules/staff/{router,controller,service,validator}.js` | `PUT /:id` |
| Backend tests | Yes | `backend/tests/unit/staff.service.test.js`, `backend/tests/unit/staff.validator.test.js` | validator + service tests |
| Frontend | Yes | `frontend/src/pages/StaffEditPage.jsx`, `frontend/src/api/staff.api.js#updateStaff` | form + axios wrapper |
| Database | No | — | no schema change (uses existing fields) |
| Permission | Yes | `backend/src/constants/permissions.js` | `UPDATE_STAFF` |
| Email/External Service | No | — | update does not send email |
| UC | Yes | `docs/UC/UC-PACKAGE.md` | UC-03 body |
| Class Diagram | Yes | `docs/plantuml/CD-03-Update-Staff-Profile.puml` | was previously `CD-01` (drift, fixed) |
| Sequence Diagram | Yes | `docs/plantuml/SD-03-Update-Staff-Profile.puml` | already 1:1 |
| Unit Test doc | Yes | `docs/tests/UNIT-TEST.md` | UT-04, UT-05, UT-25 |
| System Test doc | Yes | `docs/tests/SYSTEM-TEST.md` | ST-06, ST-07 |
| Backlog | Yes | edit existing row when UC completes | |
| README (project) | Yes | API table (PUT /api/staff/:id) | |

## 2. Drift observations

- **Previous CD reference drift**: listed `CD-01-Staff-Management.puml`.
  Multi-UC diagram. Fixed to `CD-03-Update-Staff-Profile.puml`.
- **"Edit Status" requests must fold into this UC** per `rules/13.4`
  (CRUD GROUPING RULE) — do NOT create UC-09 Edit Status.

## 3. Source mapping (last verified: 2026-10-02)

| Layer | Path | Notes |
| ----- | ---- | ----- |
| Router PUT /:id | `backend/src/modules/staff/staff.router.js` | uses `UPDATE_STAFF` |
| Controller updateStaff | `backend/src/modules/staff/staff.controller.js` | delegates to service |
| Service updateStaff | `backend/src/modules/staff/staff.service.js` | dedupe + persist |
| Validator staffUpdateSchema | `backend/src/modules/staff/staff.validator.js` | Joi, all fields optional |

## 4. Validation checklist

- [ ] `npm test` → UT-04, UT-05, UT-25 pass.
- [ ] ST-06 happy path returns 200 + safe DTO (no `passwordHash`).
- [ ] ST-07 duplicate email returns 409.
- [ ] Empty body does NOT delete existing fields (only updates sent keys).
- [ ] Email lowercased on update.

## 5. Dependency notes (per `rules/12`)

None added for this UC.