# UC-08 — View Own Profile

> **Developer-facing documentation.** Read this file alone to understand
> UC-08. Maintenance / impact / drift metadata lives in `notes.md`.

## 1. Mục đích (Purpose)

Authenticated user xem profile của chính mình. Endpoint public-cho-user
(ai cũng có thể gọi miễn là authenticated + active), trả về safe DTO
của caller.

## 2. Actor

**Any authenticated user** — Admin, Staff, hoặc bất kỳ role nào.

## 3. Permission / Preconditions

- **Permission**: none (no `requirePermission` call — only `authenticate`).
- **Preconditions**:
  - Bearer JWT hợp lệ.
  - `User.isActive === true`.

## 5. API

```
GET /api/profile/me
```

## 6. Input

Không có path param, không có body, không có query. User id được lấy từ
JWT (`req.user._id`).

## 7. Main Flow

1. Caller GET `/api/profile/me` với Bearer token.
2. `ProfileRouter` → `authenticate()` middleware.
3. `authenticate()` decode JWT → `User.findById(decoded.sub)` + populate role.
4. `authenticate()` kiểm tra `User.isActive === true` (inactive → 403).
5. `ProfileController.getMe` được gọi.
6. Controller gọi `ProfileService.getMe(req.user._id)`.
7. Service gọi `User.findById(userId)` + populate role.
8. Service trả về safe DTO.
9. Controller wrap → 200 OK.

## 8. Alternative / Error Flow

| Code | Cause | Trigger |
| ---- | ----- | ------- |
| `401` | Missing / invalid JWT | step 2 |
| `403` | Account inactive | step 4 |

## 9. Business Rules

- Endpoint KHÔNG có `requirePermission` (intentionally) — user có thể xem
  profile của chính mình bằng bất kỳ role nào.
- Safe DTO — KHÔNG BAO GIỜ trả `passwordHash`, `activationToken`.
- Trả 403 (không 404) khi user inactive để phân biệt với "missing token" (401).
- Khác UC-02: UC-02 xem profile người khác (cần permission); UC-08 xem
  profile chính mình (không cần permission).

## 10. Backend Implementation

### API
```
GET /api/profile/me
```

### Authentication / Authorization
- `authenticate()` middleware (`backend/src/middlewares/auth.middleware.js`):
  decode JWT → `User.findById(decoded.sub)` + populate `role` → assign
  `req.user`; reject inactive users (403).
- **No `requirePermission` call** — any authenticated, active user may
  view their own profile regardless of role/permission set.

### Validation
- No path / query / body params. User id is derived from `req.user._id`
  (set by `authenticate`).

### Controller
- `profile.controller.js#getMe(req, res)` — wraps service result in
  `{ success: true, data }` with status `200 OK`.

### Service
- `profile.service.js#getMe(userId)`:
  1. `User.findById(userId)` + populate `role`.
  2. Strip `passwordHash`, `activationToken` → return safe DTO.

### Repository
- No dedicated repository — User is read via the Mongoose model directly.

### Model / Database
- `User` model — `passwordHash`, `activationToken` stripped before returning.
- `Role` model — populated into the response.

### External Service
- None.

### Request Contract
- Path: `GET /api/profile/me`
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

### Error Handling
| Code | Cause | Trigger |
| ---- | ----- | ------- |
| `401` | Missing / invalid JWT | authenticate |
| `403` | Account inactive (`User.isActive === false`) | authenticate |

> Inactive users get `403` (not `404`) so the client can distinguish from
> "missing token" (`401`). This is intentional — see §9.

### Backend Unit Tests (`backend/tests/unit/`)
- `UT-12`, `UT-14` — `authenticate` middleware behaviour (covers UC-08 happy path and inactive-block).
- `UT-15` — `getMe` returns safe DTO (no `passwordHash`, no `activationToken`).

### Backend System / API Tests (`docs/tests/SYSTEM-TEST.md`)
- `ST-12` — happy path GET /api/profile/me → 200 + safe DTO.
- `ST-13` — inactive user → 403.

## 11. Frontend Implementation

### Page / Screen
- `frontend/src/pages/ProfilePage.jsx` — read-only self-profile view, mounted at `/profile/me`.

### Form Fields
- Read-only display — no editable fields on this screen.
- (Editable self-update fields, if any, are out of scope for UC-08.)

### API Module
- `frontend/src/api/profile.api.js#getMe()` — `GET /api/profile/me` (Bearer token via interceptor).

### Request Payload
- None.

### Response Handling
- **Success (200)** — render full name, email, phone, address, role name + permissions.
- **`401`** — redirect to `/login`.
- **`403`** — show "Your account is inactive" panel; redirect to `/login` (or block further action).
- **`5xx`** — show generic error banner with retry.

### State Management
- Component state: `{ me, loading, error }`.
- `loading` — skeleton spinner during fetch.
- `error` — error panel for 4xx/5xx.
- The response is typically also written to the **auth context** so other
  pages can read `currentUser` without re-fetching.

### Loading / Success / Error UX
- **Loading** — skeleton placeholder.
- **Success** — read-only profile card.
- **Error** — error panel / banner.

### Permission / UI Visibility
- Route guarded by `RequireAuth` (logged-in only) — not `RequirePermission`,
  because **all** authenticated users may view their own profile.
- Sidebar/top-bar avatar menu links to `/profile/me` for every user.

### Frontend Tests
- (placeholder — add when frontend test suite is introduced; currently no FE test files in repo)

## 12. UML

- **Class Diagram**: `docs/plantuml/CD-08-View-Own-Profile.puml`
- **Sequence Diagram**: `docs/plantuml/SD-08-View-Own-Profile.puml`

Cardinality: 1 UC ↔ 1 CD ↔ 1 SD (per `rules/03-use-case.md` HARD RULE).

> **Drift note**: the previous reference listed
> `CD-02-Profile-and-Auth.puml`. Multi-UC diagram covering UC-02 + UC-08.
> Fixed to per-UC `CD-08-View-Own-Profile.puml`. Shared classes
> (`User`, `ProfileService`) appear in both CD-02 and CD-08.

## 13. Related Documentation

- UC body: `docs/UC/UC-PACKAGE.md` (UC-08 entry)
- BACKLOG: Status #5 (Profile module)
- Auth pattern: see UC-07 (Check Profile Permission)
- View other user: see UC-02 (View Staff Profile)