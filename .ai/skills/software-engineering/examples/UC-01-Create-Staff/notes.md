# UC-01 — Maintenance Notes

> This file contains maintenance and validation metadata.
> It is not the primary developer documentation for this UC.
> For business flow, see `README.md`.

## 1. Change Impact Matrix (12 rows, simplified form of `rules/11`)

| Area | Affected? | Files | Reason |
| ---- | --------- | ----- | ------ |
| Backend | Yes | `backend/src/modules/staff/{router,controller,service,validator}.js`, `backend/src/modules/role/role.repository.js`, `backend/src/services/email.service.js` | core flow + email |
| Backend tests | Yes | `backend/tests/unit/staff.service.test.js`, `backend/tests/unit/email.service.test.js`, `backend/tests/unit/permission.middleware.test.js` | UT-01..11, 18..20, 25 |
| Frontend | Yes | `frontend/src/pages/StaffCreatePage.jsx`, `frontend/src/api/staff.api.js` | submit form + axios wrapper |
| Database | Yes | `backend/src/models/user.model.js` | unique email/phone/username indexes |
| Permission | Yes | `backend/src/constants/permissions.js` | `CREATE_STAFF` |
| Email/External Service | Yes | `backend/src/services/email.service.js` + SMTP provider | Gmail SMTP via env |
| UC | Yes | `docs/UC/UC-PACKAGE.md` | UC-01 body (+ UC-06 sub-flow note) |
| Class Diagram | Yes | `docs/plantuml/CD-01-Create-Staff.puml` | Staff + User + EmailService |
| Sequence Diagram | Yes | `docs/plantuml/SD-01-Create-Staff.puml` | full flow + email branch |
| Unit Test doc | Yes | `docs/tests/UNIT-TEST.md` | UT-01..11, 18..20, 25 |
| System Test doc | Yes | `docs/tests/SYSTEM-TEST.md` | ST-01..03 |
| Backlog | Yes | Status #4, #6, #20, #21, #22; Issue #2, #3 | |
| README (project) | Yes | API table + env table | `MAIL_USER`, `MAIL_PASS`, `FRONTEND_URL` |

## 2. Drift observations

- None known at skill creation time. `SD-01` arrow labels match
  `staff.service.js` method names (`createStaff`, `assignRole`, `setActive`).
- `CD-01` includes `EmailService` and `SMTP` even though SMTP is external —
  acceptable because the actual class `EmailService` exists and is the
  participant that calls SMTP.

## 3. Source mapping (last verified: 2026-10-02)

| Layer | Path | Last touched for this UC |
| ----- | ---- | ------------------------ |
| Router | `backend/src/modules/staff/staff.router.js` | UC-01 created |
| Controller | `backend/src/modules/staff/staff.controller.js` | UC-01 created |
| Service | `backend/src/modules/staff/staff.service.js` | UC-01 created |
| Validator | `backend/src/modules/staff/staff.validator.js` | UC-01 created |
| Email service | `backend/src/services/email.service.js` | UC-06 created (used here) |
| Frontend page | `frontend/src/pages/StaffCreatePage.jsx` | UC-01 created |

## 4. Validation checklist

Before declaring UC-01 complete after any change:

- [ ] `cd backend && npm test` → all UT-01..11, 18..20, 25 pass.
- [ ] `cd backend && npm run lint` → 0 errors.
- [ ] ST-01 manual run returns 201 with `emailNotificationSent`.
- [ ] ST-02 manual run returns 409 on duplicate email.
- [ ] ST-03 manual run returns 403 when permission missing.
- [ ] No `passwordHash` / `activationToken` in any response payload
      (use `grep -E 'passwordHash|activationToken' response.json`).

## 5. Dependency notes (per `rules/12`)

None added for this UC itself; UC-01 reuses existing deps. If a new email
provider or hash library is added in the future, update
`backend/DEPENDENCIES.md` + `docs/STACK.md` in the same commit.