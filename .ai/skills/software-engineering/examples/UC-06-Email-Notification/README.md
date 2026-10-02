# UC-06 — Send Staff Account Notification

> **Developer-facing documentation.** Read this file alone to understand
> UC-06. Maintenance / impact / drift metadata lives in `notes.md`.

## 1. Mục đích (Purpose)

Gửi email thông báo tài khoản cho Staff mới được tạo. Email chứa thông
tin đăng nhập tạm thời (email + password). Đây là một system-triggered
flow — không có actor trực tiếp, được gọi nội bộ từ UC-01.

> **Note**: theo `rules/13.9` (Side Effect ≠ Use Case), flow này là một
> side effect của UC-01. UC-06 được giữ riêng trong `docs/UC/UC-PACKAGE.md`
> vì business có thể cần tái sử dụng email pattern cho các use case khác
> (UC tương lai: password reset, role change notification, ...). Khi viết
> UC mới gọi `EmailService`, KHÔNG tạo UC riêng — gọi chung `EmailService`.

## 2. Actor

**System** — không có actor trực tiếp. Email gửi nội bộ từ
`StaffService.createStaff`.

## 3. Permission / Preconditions

- **Permission**: none (system-triggered, inherits caller's permission).
- **Preconditions**:
  - SMTP được cấu hình (`MAIL_USER`, `MAIL_PASS`).
  - User đã được persist trong DB.
  - `temporaryPassword` hoặc password đã generate.

## 4. Trigger

`StaffService.createStaff` (UC-01 step 15) gọi
`EmailService.sendStaffAccountCreatedEmail(user, temporaryPassword)`.

## 5. API

Không có HTTP endpoint. Đây là internal service call.

## 6. Input

| Field | Type | Source |
| ----- | ---- | ------ |
| `user` | User object | kết quả `User.create` (UC-01 step 14) |
| `temporaryPassword` | string | generate ở UC-01 step 13 |

## 7. Main Flow

1. `StaffService.createStaff` đã tạo xong User (UC-01).
2. Service gọi `EmailService.sendStaffAccountCreatedEmail(user, tempPassword)`.
3. `EmailService` build HTML + text body (escape user input).
4. `EmailService` tạo transporter (nodemailer) với SMTP creds từ `env`.
6. `EmailService.sendMail({ from, to: user.email, subject, html, text })`.
7. Success → `logger.info("Email notification sent")`.
8. Trả `{ emailNotificationSent: true }` cho caller (UC-01).

## 8. Alternative / Error Flow

| Scenario | Behaviour |
| -------- | --------- |
| SMTP not configured | `transporter.verify()` fail → log error → trả `emailNotificationSent: false` cho caller. UC-01 vẫn trả 201. |
| SMTP send fail (network / auth) | Catch exception → `logger.error("Email notification failed")` → KHÔNG log password / token → trả `emailNotificationSent: false`. UC-01 vẫn trả 201. |
| User email invalid format | Service detect → skip → trả `false`. UC-01 vẫn trả 201. |

Email failure **không bao giờ** làm fail UC-01. Account vẫn được tạo.

## 9. Business Rules

- Password gửi qua email phải ở dạng plain text (user cần nó để login lần
  đầu) — nhưng KHÔNG BAO GIỜ log plain password. Log chỉ ghi `"Email
  notification sent"` hoặc `"Email notification failed"`.
- `activationToken` (nếu có) KHÔNG được log.
- Email body phải escape user input để chống XSS / injection.
- Gmail SMTP yêu cầu App Password (không phải mật khẩu Gmail thường) —
  cấu hình qua env (`MAIL_PASS`).
- `MAIL_FROM` phải khớp với Gmail account đang gửi (Gmail chặn From
  spoofing).

## 10. Backend Implementation

### API
N/A — no HTTP endpoint. This is an **internal service call** invoked from
`StaffService.createStaff` (UC-01 step 15).

### Authentication / Authorization
- N/A — system-triggered flow; inherits the caller's permission context from UC-01.
- No middleware runs (pure function call).

### Validation
- All user-supplied input (`email`, `fullName`) is HTML-escaped before
  being interpolated into the email body (anti-SOX/Cross-site-scripting).

### Service
- `email.service.js#sendStaffAccountCreatedEmail(user, temporaryPassword)`:
  1. Build plain-text and HTML bodies; escape user input.
  2. Create a nodemailer transporter using SMTP creds from env
     (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`).
  3. Call `transporter.sendMail({ from, to, subject, html, text })`.
  4. On success → `logger.info("Email notification sent")` and return
     `{ emailNotificationSent: true }`.
  5. On failure (any exception) → `logger.error(...)` (no password or token
     ever logged) and return `{ emailNotificationSent: false }`.

### Repository
- N/A — no DB access. Reads only the in-memory `user` passed in.

### Model / Database
- N/A — no DB write.

### External Service
- **SMTP (nodemailer)** — Gmail requires an App Password set via `MAIL_PASS`.
  `MAIL_FROM` must match the Gmail account (Gmail blocks From spoofing).
- Other SMTP providers: configure `MAIL_HOST`, `MAIL_PORT` accordingly.

### Request Contract
N/A (internal call):
```ts
sendStaffAccountCreatedEmail(user: User, temporaryPassword: string)
```
- `user` — the User object just persisted by `User.create` (UC-01 step 14).
- `temporaryPassword` — generated or supplied at UC-01 step 13.

### Response Contract
```ts
{ emailNotificationSent: true }   // SMTP success
{ emailNotificationSent: false }  // any SMTP failure (never throws)
```

### Error Handling
| Scenario | Behaviour |
| -------- | --------- |
| SMTP misconfigured | `transporter.verify()` fail → `logger.error` → return `{ emailNotificationSent: false }`. UC-01 still returns 201. |
| SMTP send fail (network / auth) | catch exception → `logger.error` → return `{ emailNotificationSent: false }`. UC-01 still returns 201. |
| User email invalid format | Service detects → skip send → return `{ emailNotificationSent: false }`. UC-01 still returns 201. |

The email service **never throws** to its caller. Email failure must never
fail UC-01 — the account is already created.

### Backend Unit Tests (`backend/tests/unit/`)
- `UT-18` — `EmailService` builds transporter with correct SMTP creds.
- `UT-19` — `sendMail` invoked with correct payload (from / to / subject / body).
- `UT-20` — SMTP failure is caught and returns `{ emailNotificationSent: false }`; nothing is logged that contains the password.

### Backend System / API Tests (`docs/tests/SYSTEM-TEST.md`)
- `ST-21` — verify email log entry on UC-01 happy path (server log contains
  `"Email notification sent"` line after a successful create).
- `ST-01` (sub-step) — UC-01 happy path asserts the response includes
  `emailNotificationSent: true` (or `false` if intentionally unconfigured).

## 11. Frontend Implementation

**N/A — server-triggered flow, no UI component.**

The frontend never calls the email service directly. Any client-visible
signal about email delivery comes indirectly from the
`emailNotificationSent` flag returned by the UC-01 response (see
UC-01 §11 Frontend Implementation → Response Handling).

## 12. UML

- **Class Diagram**: `docs/plantuml/CD-06-Send-Staff-Account-Notification.puml`
- **Sequence Diagram**: `docs/plantuml/SD-06-Send-Staff-Account-Notification.puml`

Cardinality: 1 UC ↔ 1 CD ↔ 1 SD (per `rules/03-use-case.md` HARD RULE).

> **Drift note (NEEDS VERIFICATION)**: the previous reference listed this
> UC as "sub-flow inside `SD-01-Create-Staff.puml`". That violates 1 UC = 1
> SD. The fix is to extract `SD-06-Send-Staff-Account-Notification.puml`
> from the current `SD-01`. Verify in source repo that the new file
> exists; if not, create it by extracting the email branch from
> `SD-01`. Shared class (`EmailService`) is drawn in both CD-01 and
> CD-06.

## 13. Related Documentation

- UC body: `docs/UC/UC-PACKAGE.md` (UC-06 entry)
- BACKLOG: Status #6; Issue #2 (App Password), Issue #3 (From-address)
- Caller: UC-01 step 15
- Email pattern: future UCs (e.g. password reset) reuse this service
  rather than creating new UCs.