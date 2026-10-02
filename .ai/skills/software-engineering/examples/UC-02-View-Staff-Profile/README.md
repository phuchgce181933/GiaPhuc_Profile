# UC-02 — View Staff Profile

> **Developer-facing documentation.** Read this file alone to understand
> UC-02. Maintenance / impact / drift metadata lives in `notes.md`.

## 1. Mục đích (Purpose)

Một user có quyền phù hợp xem profile của một staff khác bằng id. Trả về
safe DTO (không có `passwordHash`, không có `activationToken`). Có hai entry
phụ thuộc permission:

- `GET /api/staff/:id` — yêu cầu `VIEW_STAFF` (Admin).
- `GET /api/profile/:id` — yêu cầu `VIEW_PROFILE`.

## 2. Actor

**Admin** (qua staff router) hoặc **authorized user** (qua profile router).
Cả hai đều phải authenticated.

## 3. Permission / Preconditions

- **Permission**:
  - `/api/staff/:id` → `VIEW_STAFF`
  - `/api/profile/:id` → `VIEW_PROFILE`
- **Preconditions**:
  - Bearer JWT hợp lệ.
  - `User.isActive === true`.
  - `req.params.id` là một `ObjectId` hợp lệ và tồn tại trong DB.

## 4. Trigger

- UI action (Admin): mở `StaffViewPage.jsx?id=...`.
- UI action (authorized user): mở `ProfilePage.jsx?id=...`.

## 5. API

```
GET /api/staff/:id     — Admin
GET /api/profile/:id   — authorized user
```

## 6. Input

| Field | In | Type | Required |
| ----- | -- | ---- | -------- |
| `id` | path | ObjectId | yes |

Không có body, không có query.

## 7. Main Flow

1. Caller GET một trong hai endpoint với `:id` + Bearer token.
2. `Router` gọi `authenticate()` → `User.findById(decoded.sub)` + populate → gán `req.user`.
3. `authenticate()` kiểm tra `req.user.isActive === true`.
4. `requirePermission('VIEW_STAFF' | 'VIEW_PROFILE')` chạy.
5. `Controller.getOne(req, res)` được gọi.
6. Controller gọi `Service.getProfileById(req.params.id)`.
7. Service gọi `User.findById(id)` + `populate('role')`.
8. Service kiểm tra `User.isActive === false` (inactive user) → throw `ApiError(404, "User not found")`.
9. Service trả về safe DTO (loại bỏ `passwordHash`, `activationToken`).
10. Controller wrap thành `{ success: true, data: dto }`, status `200 OK`.

## 8. Alternative / Error Flow

| Code | Cause | Trigger step |
| ---- | ----- | ------------ |
| `400` | `:id` không phải ObjectId hợp lệ | step 7 |
| `401` | Missing / invalid JWT | step 2 |
| `403` | Account inactive | step 3 |
| `403` | Missing required permission | step 4 |
| `404` | User not found / inactive target | step 7, 8 |

## 9. Business Rules

- Safe DTO — KHÔNG BAO GIỜ trả `passwordHash` hay `activationToken`.
- Inactive user trả về `404` (không `200`), tránh leak existence.
- Permission granularity: hai endpoint khác nhau vì hai nhóm user khác nhau
  cần quyền khác nhau (`VIEW_STAFF` chỉ Admin; `VIEW_PROFILE` cho cả các
  role có staff permission).
- Cùng một user có thể truy cập được qua cả hai endpoint với permission
  phù hợp.

## 10. Backend Implementation

### API
```
GET /api/staff/:id      — Admin  (requires VIEW_STAFF)
GET /api/profile/:id    — any authorized user (requires VIEW_PROFILE)
```
Two endpoints exist because two distinct user groups need different
permissions to view the same resource.

### Authentication / Authorization
- `authenticate()` middleware (`backend/src/middlewares/auth.middleware.js`):
  decode JWT → `User.findById(decoded.sub)` + populate `role` → assign `req.user`; reject inactive users (403).
- `requirePermission(...)` (`backend/src/middlewares/permission.middleware.js`):
  - `/api/staff/:id` → `VIEW_STAFF`
  - `/api/profile/:id` → `VIEW_PROFILE`
- AND-semantics check on `req.user.role.permissions`.

### Validation
- Path param `:id` must be a valid Mongo ObjectId. Invalid format → `400` from Mongoose `CastError` handled by the global error middleware.
- No body / query validation needed.

### Controller
- `staff.controller.js#getOne(req, res)` — wraps `/api/staff/:id` result.
- `profile.controller.js#getOne(req, res)` — wraps `/api/profile/:id` result.
- Both return `{ success: true, data }` with status `200 OK`.

### Service
- `profile.service.js#getProfileById(id)` — primary service used by **both** endpoints:
  1. `User.findById(id)` + `populate('role')`.
  2. If `user === null` OR `user.isActive === false` → throw `ApiError(404, "User not found")`.
  3. Strip `passwordHash`, `activationToken` → return safe DTO.
- `staff.service.js` may delegate to the same `getProfileById` (no duplication).

### Repository
- No dedicated repository — User is read via the Mongoose model directly.

### Model / Database
- `User` model (`backend/src/models/user.model.js`) — `passwordHash`, `activationToken` stripped before returning.
- `Role` model — populated into the response.

### External Service
- None.

### Request Contract
- Path: `GET /api/staff/:id` or `GET /api/profile/:id`
- Headers: `Authorization: Bearer <jwt>`
- Body / query: none.

### Response Contract (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "65f0a1b2c3d4e5f6a7b8c9d0",
    "fullName": "Nguyen Van A",
    "email": "a@example.com",
    "phone": "0901234567",
    "address": "Hanoi",
    "isActive": true,
    "role": {
      "_id": "...",
      "name": "Staff",
      "permissions": ["VIEW_PROFILE", "..."]
    }
  }
}
```
> Response **never** includes `passwordHash` or `activationToken`.

### Error Handling
| Code | Cause | Trigger step |
| ---- | ----- | ------------ |
| `400` | `:id` is not a valid ObjectId | Mongoose CastError |
| `401` | Missing / invalid JWT | authenticate |
| `403` | Account inactive | authenticate |
| `403` | Missing required permission (`VIEW_STAFF` or `VIEW_PROFILE`) | requirePermission |
| `404` | User not found OR target user inactive (no existence leak) | Service step 2 |

### Backend Unit Tests (`backend/tests/unit/`)
- `UT-12..17` — `requirePermission` middleware behaviour (covers UC-07) — exercised on both `/api/staff/:id` and `/api/profile/:id` paths.
- `UT-15` — `getProfileById` returns safe DTO (no `passwordHash`, no `activationToken`).
- `UT-16` — `getProfileById` on inactive user → 404.

### Backend System / API Tests (`docs/tests/SYSTEM-TEST.md`)
- `ST-04` — Admin `GET /api/staff/:id` with `VIEW_STAFF` → 200 + safe DTO.
- `ST-05` — `GET /api/profile/:id` without `VIEW_PROFILE` → 403.
- `ST-12` (sub-case) — inactive target user → 404.

## 11. Frontend Implementation

### Page / Screen
- `frontend/src/pages/StaffViewPage.jsx` — Admin view, mounted at `/staff/:id`.
- `frontend/src/pages/ProfilePage.jsx` — generic profile view, mounted at `/profile/:id` (also reused at `/profile/me` — see UC-08).

### Form Fields
- Read-only display — no editable fields on this screen.

### API Module
- `frontend/src/api/staff.api.js#getOne(id)` — `GET /api/staff/:id`.
- `frontend/src/api/profile.api.js#getOne(id)` — `GET /api/profile/:id`.
- Both attach Bearer token via the shared axios interceptor.

### Request Payload
- None (path param only).

### Response Handling
- **Success (200)** — render `fullName`, `email`, `phone`, `address`, role name + permissions (read-only).
- **`401`** — redirect to `/login`.
- **`403`** — redirect to `/forbidden` (or show "no permission" panel).
- **`404`** — show "User not found" empty state.

### State Management
- Component state: `{ user, loading, error }`.
- `loading` — shows skeleton spinner during fetch.
- `error` — renders error panel on 4xx/5xx.

### Loading / Success / Error UX
- **Loading** — skeleton placeholder while fetch in-flight.
- **Success** — read-only profile card.
- **Error** — empty state ("User not found") for 404; error banner for 5xx.

### Permission / UI Visibility
- `StaffViewPage` mounted only when current user has `VIEW_STAFF` (Admin) — route-guarded by `RequirePermission(['VIEW_STAFF'])`.
- `ProfilePage` mounted when current user has `VIEW_PROFILE` OR is viewing `/profile/me` — route-guarded by `RequirePermission(['VIEW_PROFILE'])` (or `RequireAuth` for `/profile/me`).

### Frontend Tests
- (placeholder — add when frontend test suite is introduced; currently no FE test files in repo)

## 12. UML

- **Class Diagram**: `docs/plantuml/CD-02-View-Staff-Profile.puml`
- **Sequence Diagram**: `docs/plantuml/SD-02-View-Staff-Profile.puml`

Cardinality: 1 UC ↔ 1 CD ↔ 1 SD (per `rules/03-use-case.md` HARD RULE).

> **Drift note**: the previous reference listed two CDs (`CD-01` + `CD-02`).
> That was a violation of 1 UC = 1 CD. The single correct CD is
> `CD-02-View-Staff-Profile.puml`. Shared classes (`User`, `Role`) are
> drawn inside that one CD.

## 13. Related Documentation

- UC body: `docs/UC/UC-PACKAGE.md` (UC-02 entry)
- BACKLOG: Status #5 (Profile module); Issue #7 (DB name separation) —
  unrelated to UC-02 itself
- Permission semantics: see UC-07 (Check Profile Permission)
- Auth pattern: see UC-08 (View Own Profile) — simpler variant