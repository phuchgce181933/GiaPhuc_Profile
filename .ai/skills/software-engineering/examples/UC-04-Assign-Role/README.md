# UC-04 — Assign Role

> **Developer-facing documentation.** Read this file alone to understand
> UC-04. Maintenance / impact / drift metadata lives in `notes.md`.

## 1. Mục đích (Purpose)

Admin gán một Role mới cho một Staff đã tồn tại. Role được chọn phải tồn
tại trong DB. Permission mới có hiệu lực ngay trên request tiếp theo của
user đó (vì `req.user` được re-fetch từ DB mỗi request).

## 2. Actor

**Admin** — role duy nhất có quyền `ASSIGN_ROLE`.

## 3. Permission / Preconditions

- **Permission**: `ASSIGN_ROLE`.
- **Preconditions**:
  - Bearer JWT hợp lệ.
  - `User.isActive === true` (caller).
  - `req.params.id` (target) tồn tại trong DB.
  - `req.body.roleId` tồn tại trong `roles` collection.

## 4. Trigger

UI action: Admin mở `StaffEditPage.jsx` → chọn role từ dropdown → Save.

## 5. API

```
PATCH /api/staff/:id/role
```

## 6. Input

| Field | In | Type | Required |
| ----- | -- | ---- | -------- |
| `id` | path | ObjectId | yes |
| `roleId` | body | ObjectId | yes |

## 7. Main Flow

1. Admin mở `StaffEditPage` → chọn role → Submit.
2. `staff.api.js#assignRole` gửi `PATCH /api/staff/:id/role` với Bearer.
3. `StaffRouter` → `authenticate()` → `isActive` check.
4. `requirePermission('ASSIGN_ROLE')` → check permission.
5. `validate(roleAssignSchema)` (Joi) → invalid → 400.
6. `StaffController.assignRole` được gọi.
7. Controller gọi `StaffService.assignRole(id, roleId)`.
8. Service gọi `RoleRepository.findById(roleId)` → không thấy → 404.
9. Service gọi `User.findByIdAndUpdate(id, { role: roleId }, { new: true })`.
10. Service trả về safe DTO.
11. Controller wrap → 200 OK.

## 8. Alternative / Error Flow

| Code | Cause | Trigger step |
| ---- | ----- | ------------ |
| `400` | Validation failed | step 5 |
| `401` | Missing / invalid JWT | step 3 |
| `403` | Account inactive | step 3 |
| `403` | Missing `ASSIGN_ROLE` | step 4 |
| `404` | Target user not found | step 9 |
| `404` | `roleId` not found | step 8 |

## 9. Business Rules

- Role mới **có hiệu lực ngay trên request kế tiếp** của user đó, KHÔNG
  cần đợi JWT refresh. `req.user` được `populate` từ DB mỗi request (JWT
  chỉ chứa `sub`).
- Endpoint riêng (`/:id/role`) chứ KHÔNG gộp vào `PUT /:id` (UC-03) vì:
  - Permission khác (`ASSIGN_ROLE` vs `UPDATE_STAFF`).
  - Business rule riêng (role change có thể cần audit log riêng).
  - Flow riêng (không validate các field khác của Staff).
- KHÔNG re-issue JWT. Frontend không cần refresh token.

## 10. Backend Implementation

### API
```
PATCH /api/staff/:id/role
```

### Authentication / Authorization
- `authenticate()` middleware (`backend/src/middlewares/auth.middleware.js`):
  decode JWT → populate `req.user`; reject inactive callers (403).
- `requirePermission('ASSIGN_ROLE')` (`backend/src/middlewares/permission.middleware.js`).

### Validation
- `roleAssignSchema` (Joi, `backend/src/modules/staff/staff.validator.js`):
  validates `roleId` as ObjectId (required).
- Path param `:id` must be a valid ObjectId.

### Controller
- `staff.controller.js#assignRole(req, res)` — wraps service result in `{ success: true, data }` with status `200 OK`.

### Service
- `staff.service.js#assignRole(id, roleId)`:
  1. `RoleRepository.findById(roleId)` → not found → throw `ApiError(404, "Role not found")`.
  2. `User.findByIdAndUpdate(id, { role: roleId }, { new: true })` + populate `role`.
  3. Strip `passwordHash`, `activationToken` → return safe DTO.

### Repository
- `RoleRepository.findById(roleId)` (`backend/src/modules/role/role.repository.js`).

### Model / Database
- `User` model — field `role` (ref `Role`) is replaced wholesale (not merged).
- `Role` model — referenced by `roleId`.

### External Service
- None.

### Request Contract
```json
{
  "roleId": "65f0a1b2c3d4e5f6a7b8c9d0"
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
    "isActive": true,
    "role": {
      "_id": "65f0a1b2c3d4e5f6a7b8c9d0",
      "name": "Manager",
      "permissions": ["VIEW_PROFILE", "UPDATE_PROFILE", "..."]
    }
  }
}
```

### Error Handling
| Code | Cause | Trigger step |
| ---- | ----- | ------------ |
| `400` | Joi validation failed / invalid ObjectId | validator |
| `401` | Missing / invalid JWT | authenticate |
| `403` | Account inactive | authenticate |
| `403` | Missing `ASSIGN_ROLE` | requirePermission |
| `404` | Target user not found | Service step 2 |
| `404` | `roleId` not found | Service step 1 |

### Backend Unit Tests (`backend/tests/unit/`)
- `UT-21` — `RoleRepository.findById` returns null → service throws 404.
- `UT-22` — `assignRole` happy path persists new role reference.

### Backend System / API Tests (`docs/tests/SYSTEM-TEST.md`)
- `ST-08` — happy path PATCH /:id/role → 200, role persisted.
- `ST-09` — invalid `roleId` → 404.
- (additional) — newly assigned permissions take effect on the target user's next request (JWT is unchanged but `req.user` is re-fetched from DB per request).

## 11. Frontend Implementation

### Page / Screen
- `frontend/src/pages/StaffEditPage.jsx` — same page as UC-03; contains a Role dropdown in addition to the basic fields.

### Form Fields
- `roleId` — select (dropdown) populated from `GET /api/roles` on mount.
- All other staff fields are also editable (the page is shared with UC-03), but the **role change** is the only trigger that calls this UC's endpoint.

### API Module
- `frontend/src/api/staff.api.js#assignRole(id, roleId)` — `PATCH /api/staff/:id/role` (Bearer token via interceptor).

### Request Payload
```json
{
  "roleId": "65f0a1b2c3d4e5f6a7b8c9d0"
}
```

### Response Handling
- **Success (200)** — show success toast ("Role assigned"), refresh staff list / detail.
- **`404` (invalid roleId)** — show inline error on the role dropdown; do not save.
- **`404` (target user not found)** — global "user not found" error panel.
- **`403`** — redirect to `/forbidden`.

### State Management
- Local form state — the role dropdown value is initialised from the existing user's `role._id`.
- `loading` — disables Save while in-flight.
- `error` — inline for the role field, toast for other errors.

### Loading / Success / Error UX
- **Loading** — Save button disabled + spinner.
- **Success** — toast + UI refresh.
- **Error** — inline dropdown error OR toast.

### Permission / UI Visibility
- Route guarded by `RequirePermission(['ASSIGN_ROLE'])` (page also requires `UPDATE_STAFF` for the other fields).
- Role dropdown is rendered only if the current user has `ASSIGN_ROLE`; otherwise the field shows as a static read-only label.

### Frontend Tests
- (placeholder — add when frontend test suite is introduced; currently no FE test files in repo)

## 12. UML

- **Class Diagram**: `docs/plantuml/CD-04-Assign-Role.puml`
- **Sequence Diagram**: `docs/plantuml/SD-04-Assign-Role.puml`

Cardinality: 1 UC ↔ 1 CD ↔ 1 SD (per `rules/03-use-case.md` HARD RULE).

## 13. Related Documentation

- UC body: `docs/UC/UC-PACKAGE.md` (UC-04 entry)
- BACKLOG: Status row when this UC completes
- JWT contents: see `backend/src/modules/auth/auth.service.js` — only `sub`
  is signed
- Permission system: see UC-07