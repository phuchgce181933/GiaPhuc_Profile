# UC-04 — Maintenance Notes

> This file contains maintenance and validation metadata.
> It is not the primary developer documentation for this UC.
> For business flow, see `README.md`.

## 1. Change Impact Matrix

| Area | Affected? | Files | Reason |
| ---- | --------- | ----- | ------ |
| Backend | Yes | `backend/src/modules/staff/{router,controller,service}.js`, `backend/src/modules/role/role.repository.js` | `PATCH /:id/role` |
| Backend tests | Yes | `backend/tests/unit/staff.service.test.js` | service tests for `assignRole` |
| Frontend | Yes | `frontend/src/pages/StaffEditPage.jsx` (role dropdown), `frontend/src/api/staff.api.js#assignRole` | UI + axios |
| Database | No | — | no schema change |
| Permission | Yes | `backend/src/constants/permissions.js` | `ASSIGN_ROLE` |
| Email/External Service | No | — | — |
| UC | Yes | `docs/UC/UC-PACKAGE.md` | UC-04 body |
| Class Diagram | Yes | `docs/plantuml/CD-04-Assign-Role.puml` | was previously `CD-01` (drift, fixed) |
| Sequence Diagram | Yes | `docs/plantuml/SD-04-Assign-Role.puml` | already 1:1 |
| Unit Test doc | Yes | `docs/tests/UNIT-TEST.md` | UT-21, UT-22 |
| System Test doc | Yes | `docs/tests/SYSTEM-TEST.md` | ST-08, ST-09 |
| Backlog | Yes | edit existing row | |
| README (project) | Yes | API table (PATCH /api/staff/:id/role) | |

## 2. Drift observations

- **Previous CD reference drift**: listed `CD-01-Staff-Management.puml`.
  Multi-UC diagram. Fixed to `CD-04-Assign-Role.puml`.
- **UC body wording**: previous wording said "effective immediately on
  subsequent JWT refresh". The accurate behaviour is "effective on next
  request" (because `req.user` is re-fetched each request). Update UC
  body to match, do NOT change implementation.

## 3. Source mapping (last verified: 2026-10-02)

| Layer | Path | Notes |
| ----- | ---- | ----- |
| Router PATCH /:id/role | `backend/src/modules/staff/staff.router.js` | uses `ASSIGN_ROLE` |
| Controller assignRole | `backend/src/modules/staff/staff.controller.js` | delegates to service |
| Service assignRole | `backend/src/modules/staff/staff.service.js` | role lookup + `findByIdAndUpdate` |
| RoleRepository findById | `backend/src/modules/role/role.repository.js` | existence check |

## 4. Validation checklist

- [ ] `npm test` → UT-21, UT-22 pass.
- [ ] ST-08 happy path returns 200 + user with new role.
- [ ] ST-09 invalid `roleId` returns 404.
- [ ] Next request from target user carries the new role in `req.user`.

## 5. Dependency notes (per `rules/12`)

None added for this UC.