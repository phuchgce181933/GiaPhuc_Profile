# UC-08 — Maintenance Notes

> This file contains maintenance and validation metadata.
> It is not the primary developer documentation for this UC.
> For business flow, see `README.md`.

## 1. Change Impact Matrix

| Area | Affected? | Files | Reason |
| ---- | --------- | ----- | ------ |
| Backend | Yes | `backend/src/modules/profile/{router,controller,service}.js` | `GET /me` |
| Backend tests | Yes | covered indirectly via `auth.middleware.test.js` | UT-12, UT-14 |
| Frontend | Yes | `frontend/src/pages/ProfilePage.jsx`, `frontend/src/api/profile.api.js` | page + axios |
| Database | No | — | no schema change |
| Permission | No | — | none required (any authenticated user) |
| Email/External Service | No | — | — |
| UC | Yes | `docs/UC/UC-PACKAGE.md` | UC-08 body |
| Class Diagram | Yes | `docs/plantuml/CD-08-View-Own-Profile.puml` | was previously `CD-02-Profile-and-Auth.puml` (drift, fixed) |
| Sequence Diagram | Yes | `docs/plantuml/SD-08-View-Own-Profile.puml` | already 1:1 |
| Unit Test doc | Yes | `docs/tests/UNIT-TEST.md` | UT-12, UT-14 |
| System Test doc | Yes | `docs/tests/SYSTEM-TEST.md` | ST-12, ST-13 |
| Backlog | Yes | Status #5 (Profile module) | |
| README (project) | Yes | API table (GET /api/profile/me) | |

## 2. Drift observations

- **Previous CD reference drift**: listed `CD-02-Profile-and-Auth.puml`,
  which covered UC-02 + UC-08. Multi-UC diagram. Fixed to per-UC
  `CD-08-View-Own-Profile.puml`.
- **UC-02 vs UC-08 boundary**: both query `User` by id, both return safe
  DTO. UC-02 requires `VIEW_PROFILE` / `VIEW_STAFF`. UC-08 is the
  self-service variant with no permission gate. Do NOT merge — different
  permission models, different audit potential, different UI flows.

## 3. Source mapping (last verified: 2026-10-02)

| Layer | Path | Notes |
| ----- | ---- | ----- |
| Router GET /me | `backend/src/modules/profile/profile.router.js` | only `authenticate` |
| Controller getMe | `backend/src/modules/profile/profile.controller.js` | delegates to service |
| Service getMe | `backend/src/modules/profile/profile.service.js` | `User.findById(req.user._id)` |
| authenticate | `backend/src/middlewares/auth.middleware.js` | sets `req.user`, checks `isActive` |

## 4. Validation checklist

- [ ] `npm test` → UT-12, UT-14 pass.
- [ ] ST-12 happy path returns 200 + safe DTO (no `passwordHash`).
- [ ] ST-13 inactive user returns 403 (not 401).
- [ ] Missing token returns 401.

## 5. Dependency notes (per `rules/12`)

None added for this UC.