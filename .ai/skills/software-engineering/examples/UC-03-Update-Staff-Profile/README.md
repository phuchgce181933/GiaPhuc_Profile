# UC-03 — Update Staff Profile

> **Developer-facing documentation.** Read this file alone to understand
> UC-03. Maintenance / impact / drift metadata lives in `notes.md`.

## 1. Mục đích (Purpose)

Admin cập nhật một hoặc nhiều field của staff: `fullName`, `email`,
`phone`, `address`, `isActive` (status). Endpoint này là UC gộp cho tất cả
biến thể UPDATE của Staff theo `rules/13` (UC optimization): không tách
thành UC riêng cho mỗi field.

## 2. Actor

**Admin** — role duy nhất có quyền `UPDATE_STAFF`.

## 3. Permission / Preconditions

- **Permission**: `UPDATE_STAFF`.
- **Preconditions**:
  - Bearer JWT hợp lệ.
  - `User.isActive === true` (caller).
  - `req.params.id` tồn tại trong DB.
  - Nếu thay đổi `email` hoặc `phone` → giá trị mới chưa được dùng bởi
    user khác.

## 4. Trigger

UI action: Admin mở `StaffEditPage.jsx?id=...` → sửa field → nhấn Save.

## 5. API

```
PUT /api/staff/:id
```

## 6. Input

| Field | Type | Required | Notes |
| ----- | ---- | -------- | ----- |
| `fullName` | string | no | nếu có → replace |
| `email` | string (email) | no | được lowercase |
| `phone` | string | no | unique |
| `address` | string | no | optional |
| `isActive` | boolean | no | dùng để activate/deactivate |

Tất cả field là optional trong PATCH/PUT — chỉ update field nào có trong body.

## 7. Main Flow

1. Admin mở `StaffEditPage` → sửa field → Submit.
2. `staff.api.js#updateStaff` gửi `PUT /api/staff/:id` với Bearer token.
3. `StaffRouter` → `authenticate()` → check `isActive`.
4. `requirePermission('UPDATE_STAFF')` → check permission.
5. `validate(staffUpdateSchema)` (Joi) → invalid → 400.
6. `StaffController.updateStaff` được gọi.
7. Controller gọi `StaffService.updateStaff(id, payload)`.
8. Service gọi `User.findById(id)` → không thấy → throw `ApiError(404)`.
9. Nếu payload có `email` → `User.findOne({ email, _id: { $ne: id } })` → trùng → 409.
10. Nếu payload có `phone` → tương tự email check → trùng → 409.
11. Service build update object (chỉ chứa field có trong payload).
12. Service `User.findByIdAndUpdate(id, update, { new: true })`.
13. Service trả về safe DTO (loại bỏ `passwordHash`, `activationToken`).
14. Controller wrap → 200 OK.

## 8. Alternative / Error Flow

| Code | Cause | Trigger step |
| ---- | ----- | ------------ |
| `400` | Validation failed (Joi) | step 5 |
| `401` | Missing / invalid JWT | step 3 |
| `403` | Account inactive | step 3 |
| `403` | Missing `UPDATE_STAFF` | step 4 |
| `404` | `id` not found | step 8 |
| `409` | Duplicate email | step 9 |
| `409` | Duplicate phone | step 10 |

## 9. Business Rules

- Email luôn lowercase trước khi lưu (`UT-25`).
- Chỉ update field **có mặt** trong body — không ghi đè field không gửi.
- `passwordHash` không bao giờ được update qua endpoint này (route riêng
  cho password change — out of UC scope).
- `isActive` toggle chính là chức năng "Activate / Deactivate" — vẫn thuộc
  UC-03, KHÔNG tạo UC-09 (per `rules/13`).
- Email notification: KHÔNG gửi khi update (chỉ gửi ở UC-01 Create).

## 10. Backend Implementation

### API
```
PUT /api/staff/:id
```
Body is partial — only the fields present are updated. Fields not in the
body are NOT overwritten.

### Authentication / Authorization
- `authenticate()` middleware (`backend/src/middlewares/auth.middleware.js`):
  decode JWT → populate `req.user`; reject inactive callers (403).
- `requirePermission('UPDATE_STAFF')` (`backend/src/middlewares/permission.middleware.js`).

### Validation
- `staffUpdateSchema` (Joi, `backend/src/modules/staff/staff.validator.js`):
  all fields optional; if present, validates `fullName` (string), `email` (email format),
  `phone` (string), `address` (string), `isActive` (boolean).
- `:id` must be a valid ObjectId.

### Controller
- `staff.controller.js#updateStaff(req, res)` — wraps service result in `{ success: true, data }` with status `200 OK`.

### Service
- `staff.service.js#updateStaff(id, payload)`:
  1. `User.findById(id)` → not found → throw `ApiError(404)`.
  2. If `payload.email` → `User.findOne({ email, _id: { $ne: id } })` → duplicate → throw `ApiError(409)`.
  3. If `payload.phone` → same check → duplicate → throw `ApiError(409)`.
  4. Build `update` object containing **only** fields present in `payload`.
  5. Lowercase email if present.
  6. `User.findByIdAndUpdate(id, update, { new: true })` + populate role.
  7. Strip `passwordHash`, `activationToken` → return safe DTO.

### Repository
- No dedicated repository — User is read/written via the Mongoose model.

### Model / Database
- `User` model — all updatable fields. `passwordHash` cannot be changed via this endpoint (separate password-change flow, out of UC scope).

### External Service
- None. Email is **not** sent on update (only on Create — see UC-01 / UC-06).

### Request Contract (partial update)
```json
{
  "fullName": "Nguyen Van B",
  "email": "b@example.com",
  "phone": "0907654321",
  "address": "Saigon",
  "isActive": true
}
```
> Any subset of fields may be sent; omitted fields remain unchanged.

### Response Contract (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "65f0a1b2c3d4e5f6a7b8c9d0",
    "fullName": "Nguyen Van B",
    "email": "b@example.com",
    "phone": "0907654321",
    "address": "Saigon",
    "isActive": true,
    "role": { "_id": "...", "name": "Staff", "permissions": ["..."] }
  }
}
```

### Error Handling
| Code | Cause | Trigger step |
| ---- | ----- | ------------ |
| `400` | Joi validation failed / invalid ObjectId | validator |
| `401` | Missing / invalid JWT | authenticate |
| `403` | Account inactive | authenticate |
| `403` | Missing `UPDATE_STAFF` | requirePermission |
| `404` | Target user not found | Service step 1 |
| `409` | Duplicate email | Service step 2 |
| `409` | Duplicate phone | Service step 3 |
| `500` | MongoDB / unexpected | any |

### Backend Unit Tests (`backend/tests/unit/`)
- `UT-04`, `UT-05` — `staffUpdateSchema` validator behaviour.
- `UT-25` — email is lowercased on update (mirrors Create behaviour).

### Backend System / API Tests (`docs/tests/SYSTEM-TEST.md`)
- `ST-06` — happy path PUT → 200 + safe DTO.
- `ST-07` — duplicate email on PUT → 409.

## 11. Frontend Implementation

### Page / Screen
- `frontend/src/pages/StaffEditPage.jsx` — edit form, mounted at `/staff/:id/edit`.

### Form Fields
| Field | Component | Pre-populated? |
| ----- | --------- | -------------- |
| `fullName` | text input | yes (from `GET /api/staff/:id`) |
| `email` | email input | yes |
| `phone` | tel input | yes |
| `address` | text input | yes |
| `isActive` | toggle / switch | yes |

### API Module
- `frontend/src/api/staff.api.js#updateStaff(id, payload)` — `PUT /api/staff/:id` (Bearer token via interceptor).
- Page loads existing staff via `staff.api.js#getOne(id)` on mount, then submits only changed fields.

### Request Payload
```json
{
  "fullName": "Nguyen Van B",
  "email": "b@example.com",
  "phone": "0907654321",
  "address": "Saigon",
  "isActive": true
}
```
> Only the fields the user actually edited are sent (diff vs. original).

### Response Handling
- **Success (200)** — show success toast, navigate back to `/staff/:id` (detail view).
- **`409` duplicate email/phone** — inline error on the offending field, form re-enabled.
- **`400` validation error** — display field-level errors.
- **`403`** — redirect to `/forbidden`.
- **`404`** — show "User not found" empty state.

### State Management
- Form state — local; initialised from `getOne(id)` response.
- `dirty` flag — tracked to enable/disable Save button.
- `loading` — disables Save button + spinner during in-flight.
- `error` — inline for 400/409, toast for others.

### Loading / Success / Error UX
- **Loading (initial fetch)** — skeleton form.
- **Loading (submit)** — Save disabled, spinner.
- **Success** — toast + redirect.
- **Error** — inline field errors OR toast.

### Permission / UI Visibility
- Route guarded by `RequirePermission(['UPDATE_STAFF'])`; non-admin redirected to `/forbidden`.
- "Edit" button on the staff list/detail pages hidden when current user lacks `UPDATE_STAFF`.

### Frontend Tests
- (placeholder — add when frontend test suite is introduced; currently no FE test files in repo)

## 12. UML

- **Class Diagram**: `docs/plantuml/CD-03-Update-Staff-Profile.puml`
- **Sequence Diagram**: `docs/plantuml/SD-03-Update-Staff-Profile.puml`

Cardinality: 1 UC ↔ 1 CD ↔ 1 SD (per `rules/03-use-case.md` HARD RULE).

> **Drift note**: the previous reference listed `CD-01-Staff-Management.puml`.
> That was a multi-UC diagram. Fixed to per-UC `CD-03-Update-Staff-Profile.puml`.
> Shared classes (`User`, `Role`) appear in both CD-01 and CD-03.

## 13. Related Documentation

- UC body: `docs/UC/UC-PACKAGE.md` (UC-03 entry)
- BACKLOG: edit existing Status row when this UC completes
- Activate/Deactivate behaviour: covered by `isActive` field in this UC
  (not a separate UC per `rules/13.4`)
- Email pattern on Create: see UC-01; on Update: not used