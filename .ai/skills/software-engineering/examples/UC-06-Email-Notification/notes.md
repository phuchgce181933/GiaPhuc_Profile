# UC-06 — Maintenance Notes

> This file contains maintenance and validation metadata.
> It is not the primary developer documentation for this UC.
> For business flow, see `README.md`.

## 1. Change Impact Matrix

| Area | Affected? | Files | Reason |
| ---- | --------- | ----- | ------ |
| Backend | Yes | `backend/src/services/email.service.js`, `backend/src/modules/staff/staff.service.js` (call site) | email service + caller |
| Backend tests | Yes | `backend/tests/unit/email.service.test.js` | UT-18..20 |
| Frontend | No | — | server-triggered |
| Database | No | — | no schema change |
| Permission | No | — | inherits UC-01's `CREATE_STAFF` |
| Email/External Service | Yes | `backend/src/services/email.service.js`, SMTP provider | Gmail SMTP |
| UC | Yes | `docs/UC/UC-PACKAGE.md` | UC-06 body |
| Class Diagram | Yes | `docs/plantuml/CD-06-Send-Staff-Account-Notification.puml` | `[NEEDS VERIFICATION]` — was previously shared with CD-01 |
| Sequence Diagram | Yes | `docs/plantuml/SD-06-Send-Staff-Account-Notification.puml` | `[NEEDS VERIFICATION]` — was previously sub-flow inside SD-01 |
| Unit Test doc | Yes | `docs/tests/UNIT-TEST.md` | UT-18, UT-19, UT-20 |
| System Test doc | Yes | `docs/tests/SYSTEM-TEST.md` | ST-01 (sub-step), ST-21 |
| Backlog | Yes | Status #6; Issue #2, #3 | Gmail App Password + From-address |
| README (project) | Yes | env table (`MAIL_USER`, `MAIL_PASS`, `FRONTEND_URL`, `BACKEND_URL`, `MAIL_FROM`) | |

## 2. Drift observations

- **Sub-flow violation (NEEDS VERIFICATION)**: this UC was previously
  documented as a sub-flow inside `SD-01-Create-Staff.puml`. That
  violates rule 03 (1 UC = 1 SD). Fix: create a new
  `SD-06-Send-Staff-Account-Notification.puml` file in source repo
  containing only the email branch. `SD-01` should reference the
  extracted diagram or show a `ref over` link.
- **Side-effect UC caveat**: per `rules/13.9`, this is a side effect of
  UC-01. Kept as separate UC in `UC-PACKAGE.md` because the email
  pattern is reusable for future UCs. Do NOT create additional UCs for
  password-reset email, role-change email, etc., unless they have a
  clearly independent business goal.

## 3. Source mapping (last verified: 2026-10-02)

| Layer | Path | Notes |
| ----- | ---- | ----- |
| Email service | `backend/src/services/email.service.js` | `sendStaffAccountCreatedEmail` |
| Caller | `backend/src/modules/staff/staff.service.js` | `createStaff` step 15 |
| Logger | `backend/src/utils/logger.js` | `info` / `error` only |

## 4. Validation checklist

- [ ] `npm test` → UT-18, UT-19, UT-20 pass.
- [ ] ST-21 manual: trigger UC-01 → check SMTP log for "Email notification sent".
- [ ] SMTP fail scenario: temporarily set bad `MAIL_PASS` → UC-01 still returns 201 with `emailNotificationSent: false`. No plain password in logs.
- [ ] Source repo: verify `SD-06-Send-Staff-Account-Notification.puml`
      exists; if not, extract from `SD-01`.

## 5. Dependency notes (per `rules/12`)

This UC uses `nodemailer`. If a new email library is added (e.g. switching
to `resend`), update `backend/DEPENDENCIES.md` + `docs/STACK.md` in the
same commit.