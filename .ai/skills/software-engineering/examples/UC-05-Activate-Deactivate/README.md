# UC-05 — Activate / Deactivate Account

> **Developer-facing documentation.** Read this file alone to understand
> UC-05. Maintenance / impact / drift metadata lives in `notes.md`.

## 1. Mục đích (Purpose)

Admin bật / tắt trạng thái hoạt động của một Staff (`User.isActive`).
Deactivated user bị `authenticate` middleware chặn ngay lập tức (trả 403).

UC-05 hiện tại cùng chung endpoint `PATCH /api/staff/:id/status` nhưng vì
business goal độc lập (vô hiệu hóa tài khoản) + có thể cần audit + có thể
phân quyền riêng sau này, UC-05 được giữ tách khỏi UC-03 (Update Staff
Profile). Xem `rules/13` để hiểu tiêu chí split.

## 2. Actor

**Admin** — role duy nhất có quyền `UPDATE_STAFF` (tái sử dụng permission
của UC-03 vì cùng domain Staff).

## 3. Permission / Preconditions

- **Permission**: `UPDATE_STAFF`.
- **Preconditions**:
  - Bearer JWT hợp lệ.
  - `User.isActive === true` (caller — Admin vẫn phải active).
  - `req.params.id` tồn tại trong DB.

## 4. Trigger

UI action: Admin nhấn **Activate** / **Deactivate** button trên
`StaffListPage.jsx` cho một row cụ thể.

## 5. API

```
PATCH /api/staff/:id/status
```

## 6. Input

| Field | In | Type | Required |
| ----- | -- | ---- | -------- |
| `id` | path | ObjectId | yes |
| `isActive` | body | boolean | yes |

## 7. Main Flow

1. Admin nhấn Activate/Deactivate button trên `StaffListPage`.
2. `staff.api.js#setActive` gửi `PATCH /api/staff/:id/status` với Bearer.
3. `StaffRouter` → `authenticate()` → `isActive` check (caller).
4. `requirePermission('UPDATE_STAFF')` → check permission.
5. `validate(statusSchema)` (Joi: `{ isActive: boolean required }`) → invalid → 400.
6. `StaffController.setActive` được gọi.
7. Controller gọi `StaffService.setActive(id, isActive)`.
8. Service gọi `User.findByIdAndUpdate(id, { isActive }, { new: true })`.
9. Service trả về safe DTO.
10. Controller wrap → 200 OK.
11. Deactivate: lần request kế tiếp của target user bị `authenticate`
    chặn (vì `User.isActive === false`).

## 8. Alternative / Error Flow

| Code | Cause | Trigger step |
| ---- | ----- | ------------ |
| `400` | Validation failed | step 5 |
| `401` | Missing / invalid JWT | step 3 |
| `403` | Caller account inactive | step 3 |
| `403` | Missing `UPDATE_STAFF` | step 4 |
| `404` | `id` not found | step 8 |

Target-side effect: khi user bị deactivate, request kế tiếp của họ trả 403
(không phải 401 — họ vẫn có token hợp lệ).

## 9. Business Rules

- `isActive` toggle **có hiệu lực ngay** trên request kế tiếp của target
  user (không cần đợi JWT refresh).
- KHÔNG xóa `activationToken` khi deactivate — chỉ flip `isActive`.
- KHÔNG gửi email thông báo (out of scope, có thể thêm ở UC riêng nếu
  product yêu cầu).
- Endpoint riêng (`/:id/status`) tách khỏi `PUT /:id` (UC-03) vì:
  - Audit / analytics có thể muốn track status change riêng.
  - Có thể cần permission riêng (`DEACTIVATE_STAFF`) trong tương lai.
  - Flow khác: chỉ validate `{ isActive }`, không touch các field khác.

## 10. Backend Implementation

### API
```
PATCH /api/staff/:id/status
```

### Authentication / Authorization
- `authenticate()` middleware (`backend/src/middlewares/auth.middleware.js`):
  decode JWT → populate `req.user`; reject inactive callers (403).
- `requirePermission('UPDATE_STAFF')` (`backend/src/middlewares/permission.middleware.js`).
- Note: the **target** user does NOT need any permission (Admin is acting on them).

### Validation
- `statusSchema` (Joi, `backend/src/modules/staff/staff.validator.js`):
  validates `isActive` as boolean (required).
- Path param `:id` must be a valid ObjectId.

### Controller
- `staff.controller.js#setActive(req, res)` — wraps service result in `{ success: true, data }` with status `200 OK`.

### Service
- `staff.service.js#setActive(id, isActive)`:
  1. `User.findByIdAndUpdate(id, { isActive }, { new: true })` + populate role.
  2. Strip `passwordHash`, `activationToken` → return safe DTO.

### Repository
- No dedicated repository — User is read/written via the Mongoose model.

### Model / Database
- `User` model — field `isActive` is the only field changed.

### External Service
- None. Email is **not** sent on activate/deactivate (out of UC scope).

### Request Contract
```json
{
  "isActive": false
}
```

### Response Contract (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "65f0a1b2c3d4e5f6a7b8c9d0",
    "fullName": "Nguyen Van A",
    "email": "a@example.com",
    "phone": "0901234567",
    "isActive": false,
    "role": { "_id": "...", "name": "Staff", "permissions": ["..."] }
  }
}
```

### Error Handling
| Code | Cause | Trigger step |
| ---- | ----- | ------------ |
| `400` | Joi validation failed / invalid ObjectId | validator |
| `401` | Missing / invalid JWT | authenticate |
| `403` | Caller account inactive | authenticate |
| `403` | Missing `UPDATE_STAFF` | requirePermission |
| `404` | Target user not found | Service step 1 |

**Target-side effect**: after the target user is deactivated, their **next** request hits `authenticate`, sees `isActive === false`, and returns `403` — they still have a valid JWT, but it is now blocked.

### Backend Unit Tests (`backend/tests/unit/`)
- `UT-23` — `setActive` persists new `isActive` value.
- `UT-24` — `authenticate` middleware blocks an inactive user (returns 403) — same test path as UC-08.

### Backend System / API Tests (`docs/tests/SYSTEM-TEST.md`)
- `ST-10` — happy path PATCH /:id/status → 200 + new state.
- `ST-11` — deactivated user's subsequent request → 403.

## 11. Frontend Implementation

### Page / Screen
- `frontend/src/pages/StaffListPage.jsx` — staff table view, mounted at `/staff`.

### Component / Action
- Each row has an **Activate** / **Deactivate** button. Clicking it opens a confirmation modal, then calls the API.

### Form Fields
- None — the modal asks only for confirmation; the new `isActive` value is derived from the current state (toggle).

### API Module
- `frontend/src/api/staff.api.js#setActive(id, isActive)` — `PATCH /api/staff/:id/status` (Bearer token via interceptor).

### Request Payload
```json
{
  "isActive": false
}
```

### Response Handling
- **Success (200)** — show success toast ("Staff deactivated"), refresh row / list.
- **`403` missing permission** — redirect to `/forbidden`.
- **`404` target not found** — show "User not found" toast and refresh list (row removed).
- **`400` validation** — show generic error toast (rare — boolean-only payload).

### State Management
- Component-level: optimistic UI update of the row's status badge while in-flight, then reconciled with server response.
- `loading` — disables the button + shows spinner while in-flight.
- `error` — reverts optimistic update + toast on failure.

### Loading / Success / Error UX
- **Loading** — button disabled, inline spinner, optimistic UI (badge flips immediately).
- **Success** — toast + final UI state from server.
- **Error** — revert optimistic update, toast.

### Permission / UI Visibility
- Route guarded by `RequirePermission(['UPDATE_STAFF'])` (same as the staff list page itself).
- Activate/Deactivate button shown only when current user has `UPDATE_STAFF`.

### Frontend Tests
- (placeholder — add when frontend test suite is introduced; currently no FE test files in repo)

## 12. UML

- **Class Diagram**: `docs/plantuml/CD-05-Activate-Deactivate.puml`
- **Sequence Diagram**: `docs/plantuml/SD-05-Activate-Deactivate.puml`

Cardinality: 1 UC ↔ 1 CD ↔ 1 SD (per `rules/03-use-case.md` HARD RULE).

> **Drift note**: the previous reference listed
> `CD-01-Staff-Management.puml`. Multi-UC diagram. Fixed to per-UC
> `CD-05-Activate-Deactivate.puml`. Shared class (`User`) appears in both
> CD-03 (Update) and CD-05.

## 13. Related Documentation

- UC body: `docs/UC/UC-PACKAGE.md` (UC-05 entry)
- BACKLOG: Status row when this UC completes
- Auth blocking behaviour: see `auth.middleware.js` `authenticate`
- Related field update: see UC-03 (also writes `isActive` but via full
  PUT — UC-05 is the lightweight toggle variant)