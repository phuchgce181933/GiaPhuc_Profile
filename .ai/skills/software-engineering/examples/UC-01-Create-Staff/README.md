# UC-01 — Create Staff Account

> **Developer-facing documentation.** Read this file alone to understand
> UC-01. Maintenance / impact / drift metadata lives in `notes.md`.

## 1. Mục đích (Purpose)

Admin tạo một Staff account mới trong hệ thống. Hệ thống validate dữ liệu,
kiểm tra trùng lặp, hash mật khẩu, lưu User, gán Role và gửi email thông
báo tài khoản cho nhân viên mới.

## 2. Actor

**Admin** — role duy nhất có quyền `CREATE_STAFF` (theo
`backend/src/constants/permissions.js`).

## 3. Permission / Preconditions

- **Permission**: `CREATE_STAFF`.
- **Preconditions**:
  - Admin phải authenticated (Bearer JWT).
  - Role được truyền trong `roleId` phải tồn tại trong DB.
  - Email và phone phải chưa được dùng bởi user khác (unique index).

## 4. Trigger

UI action: Admin nhấn **Submit** trên `StaffCreatePage.jsx` (POST form).

## 5. API

```
POST /api/staff
```

## 6. Input

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `fullName` | string | yes | hiển thị trên UI |
| `email` | string (email) | yes | được lowercase trước khi lưu |
| `phone` | string | yes | unique index |
| `address` | string | no | optional |
| `roleId` | ObjectId | yes | ref tới `roles._id` |
| `temporaryPassword` | string | no | nếu thiếu → hệ thống sinh ngẫu nhiên |

## 7. Main Flow

1. Admin mở `StaffCreatePage` → điền form → nhấn Submit.
2. `staff.api.js#createStaff` gửi `POST /api/staff` với Bearer token.
3. `StaffRouter` nhận request → gọi `authenticate()` middleware.
4. `authenticate()` decode JWT → `User.findById(decoded.sub)` → `populate('role.permissions')` → gán `req.user`.
5. `authenticate()` kiểm tra `User.isActive === true` (inactive → 403).
6. `requirePermission('CREATE_STAFF')` kiểm tra `req.user.role.permissions` có chứa permission không → nếu thiếu → 403.
7. `validate(staffCreateSchema)` chạy Joi validation → dữ liệu không hợp lệ → 400.
8. `StaffController.createStaff` được gọi với `req.body` đã validate.
9. Controller gọi `StaffService.createStaff(payload)`.
10. Service gọi `User.findOne({ email })` để check trùng → trùng → throw `ApiError(409, "Email already exists")`.
11. Service gọi `User.findOne({ phone })` để check trùng → trùng → throw `ApiError(409, "Phone already exists")`.
12. Service gọi `RoleRepository.findById(payload.roleId)` → không tìm thấy → throw `ApiError(404, "Role not found")`.
13. Service hash password bằng `bcrypt.hash(temporaryPassword?, 10)`.
14. Service `User.create({...})` với `passwordHash`, `isActive: true`, `activationToken: undefined`.
15. Service gọi `EmailService.sendStaffAccountCreatedEmail(user, temporaryPassword)`.
16. Email fail → log error, vẫn trả success với `emailNotificationSent: false`.
17. Service trả về `{ user, userId, emailNotificationSent }` (safe DTO — không có `passwordHash`).
18. Controller wrap thành `{ success: true, data: ... }`, status `201 Created`.

## 8. Alternative / Error Flow

| Code | Cause | Trigger step |
| ---- | ----- | ------------ |
| `400` | Validation failed (Joi) | step 7 |
| `401` | Missing / invalid JWT | step 4 |
| `403` | Account inactive | step 5 |
| `403` | Missing `CREATE_STAFF` | step 6 |
| `404` | `roleId` not found | step 12 |
| `409` | Duplicate email | step 10 |
| `409` | Duplicate phone | step 11 |
| `500` | MongoDB / bcrypt / unexpected | any |

Email failure (`EmailService` throws) → KHÔNG làm fail toàn request. Chỉ
log + flip `emailNotificationSent: false`.

## 9. Business Rules

- Email luôn được lowercase trước khi lưu → cả khi update (`UT-25`).
- Phone có unique index trong DB; duplicate → 409 (không phải 200).
- `temporaryPassword` nếu user không cung cấp → hệ thống tự sinh (đủ dài,
  đủ phức tạp) — chỉ gửi qua email, không bao giờ trả trong response.
- Response KHÔNG BAO GIỜ chứa `passwordHash` hay `activationToken`
  (`safe DTO`).
- Email chứa password plain text + activation link — gửi qua SMTP TLS.

## 10. Backend Implementation

### API
```
POST /api/staff
```

### Authentication / Authorization
- `authenticate()` middleware (`backend/src/middlewares/auth.middleware.js`):
  decode JWT → `User.findById(decoded.sub)` + `populate('role.permissions')` → assign `req.user`; reject inactive users (403).
- `requirePermission('CREATE_STAFF')` (`backend/src/middlewares/permission.middleware.js`): AND-semantics check on `req.user.role.permissions`.

### Validation
- `staffCreateSchema` (Joi, `backend/src/modules/staff/staff.validator.js`):
  validates `fullName`, `email` (email format), `phone`, `address` (optional), `roleId` (ObjectId), `temporaryPassword` (optional).

### Controller
- `staff.controller.js#createStaff(req, res)` — wraps service result in `{ success: true, data }` with status `201 Created`.

### Service
- `staff.service.js#createStaff(payload)` orchestrates:
  1. `User.findOne({ email })` → duplicate → throw `ApiError(409)`.
  2. `User.findOne({ phone })` → duplicate → throw `ApiError(409)`.
  3. `RoleRepository.findById(payload.roleId)` → not found → throw `ApiError(404)`.
  4. `bcrypt.hash(temporaryPassword?, 10)`.
  5. `User.create({ ...payload, passwordHash, isActive: true, activationToken: undefined })`.
  6. `EmailService.sendStaffAccountCreatedEmail(user, tempPassword)` — failure is caught and logged, does not propagate.
  7. Returns safe DTO `{ user, userId, emailNotificationSent }`.

### Repository
- `RoleRepository.findById(roleId)` (`backend/src/modules/role/role.repository.js`) — only the Role lookup goes through a dedicated repository. `User` is manipulated via the Mongoose model directly.

### Model / Database
- `User` model (`backend/src/models/user.model.js`) — fields: `fullName`, `email` (lowercased, indexed unique), `phone` (indexed unique), `address`, `passwordHash`, `isActive`, `activationToken`, `role` (ref `Role`).
- `Role` model (`backend/src/models/role.model.js`) — referenced by `roleId`.

### External Service
- `EmailService.sendStaffAccountCreatedEmail` (`backend/src/services/email.service.js`) — nodemailer SMTP; see UC-06 for full email behaviour.

### Request Contract
```json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "phone": "0901234567",
  "address": "Hanoi",
  "roleId": "65f0a1b2c3d4e5f6a7b8c9d0",
  "temporaryPassword": "Temp@1234"
}
```
> `temporaryPassword` is optional — server generates one if omitted (never returned in response).

### Response Contract (201 Created)
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65f0a1b2c3d4e5f6a7b8c9d0",
      "fullName": "Nguyen Van A",
      "email": "a@example.com",
      "phone": "0901234567",
      "address": "Hanoi",
      "isActive": true,
      "role": { "_id": "...", "name": "Staff", "permissions": ["..."] }
    },
    "userId": "65f0a1b2c3d4e5f6a7b8c9d0",
    "emailNotificationSent": true
  }
}
```
> Response **never** includes `passwordHash` or `activationToken` (safe DTO).

### Error Handling
| Code | Cause | Trigger step |
| ---- | ----- | ------------ |
| `400` | Joi validation failed | validator |
| `401` | Missing / invalid JWT | authenticate |
| `403` | Account inactive | authenticate |
| `403` | Missing `CREATE_STAFF` | requirePermission |
| `404` | `roleId` not found | RoleRepository |
| `409` | Duplicate email | Service step 1 |
| `409` | Duplicate phone | Service step 2 |
| `500` | MongoDB / bcrypt / unexpected | any |

Email failure is logged and flips `emailNotificationSent` to `false`; it does **not** fail the request.

### Backend Unit Tests (`backend/tests/unit/`)
- `UT-01..11` — happy path, validators, permission, duplicate email/phone, missing role.
- `UT-18..20` — `EmailService` behaviour (success / SMTP failure / no-credentials).
- `UT-25` — email is lowercased on save.

### Backend System / API Tests (`docs/tests/SYSTEM-TEST.md`)
- `ST-01` — full POST + verify User persisted + email log entry.
- `ST-02` — duplicate email returns 409.
- `ST-03` — missing `CREATE_STAFF` returns 403.

## 11. Frontend Implementation

### Page / Screen
- `frontend/src/pages/StaffCreatePage.jsx` — form screen, mounted at `/staff/new`.

### Form Fields
| Field | Component | Validation |
| ----- | --------- | ---------- |
| `fullName` | text input | required, min 2 chars |
| `email` | email input | required, RFC-5322 |
| `phone` | tel input | required, 10–11 digits |
| `address` | text input | optional |
| `roleId` | select (dropdown) | required — fetched from `GET /api/roles` |
| `temporaryPassword` | password input | optional — auto-generated if blank |

### API Module
- `frontend/src/api/staff.api.js#createStaff(payload)`
- HTTP call: `POST /api/staff` (Bearer token attached by shared axios interceptor).
- Maps backend field names 1:1; no transformation needed.

### Request Payload
```json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "phone": "0901234567",
  "address": "Hanoi",
  "roleId": "65f0a1b2c3d4e5f6a7b8c9d0",
  "temporaryPassword": "Temp@1234"
}
```

### Response Handling
- **Success (201)** — show success toast ("Staff account created"), navigate to `/staff` (list) or `/staff/:id` (detail).
- **`emailNotificationSent: false`** — show warning toast ("Account created but email failed to send — Admin must notify manually").
- **`400`** — display field-level errors returned by Joi (`error.details[].path`).
- **`409` duplicate email/phone** — show inline error on the offending field.
- **`403` missing permission** — global toast + redirect to `/forbidden`.

### State Management
- Form state — local (React Hook Form or controlled inputs).
- `loading` flag — disables Submit button + shows spinner during in-flight request.
- `error` state — global toast for 4xx/5xx; inline errors for `400` / `409`.
- Role options — fetched on mount via `role.api.js#listRoles` and stored in local component state.

### Loading / Success / Error UX
- **Loading** — Submit button disabled, spinner inline.
- **Success** — toast + navigation; form reset.
- **Error** — toast (network/server) OR inline (validation/duplicate); Submit re-enabled.

### Permission / UI Visibility
- Route guarded by `RequirePermission(['CREATE_STAFF'])` HOC; non-admin redirected to `/forbidden`.
- Sidebar entry "Create Staff" hidden when `user.role.permissions` does not include `CREATE_STAFF`.

### Frontend Tests
- (placeholder — add when frontend test suite is introduced; currently no FE test files in repo)

## 12. UML

- **Class Diagram**: `docs/plantuml/CD-01-Create-Staff.puml`
- **Sequence Diagram**: `docs/plantuml/SD-01-Create-Staff.puml`

Cardinality: 1 UC ↔ 1 CD ↔ 1 SD (per `rules/03-use-case.md` HARD RULE).

## 13. Related Documentation

- UC body: `docs/UC/UC-PACKAGE.md` (UC-01 entry)
- BACKLOG: Status #4, #6, #20, #21, #22 (email-related fixes)
- README (project root): API table + env table (`MAIL_USER`, `MAIL_PASS`,
  `FRONTEND_URL`)
- Side effects: see UC-06 (email notification flow)
- Permission enforcement pattern: see UC-07