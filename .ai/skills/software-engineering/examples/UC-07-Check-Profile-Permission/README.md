# UC-07 — Check Profile Permission

> **Developer-facing documentation.** Read this file alone to understand
> UC-07. Maintenance / impact / drift metadata lives in `notes.md`.

## 1. Mục đích (Purpose)

Middleware `requirePermission(...perms)` kiểm tra user hiện tại có đủ
permission cần thiết để truy cập một route. Đây là cross-cutting capability
— được dùng bởi gần như tất cả protected routes (UC-01, UC-02, UC-03,
UC-04, UC-05).

> **Note**: theo `rules/13.11` (UC Splitting Threshold) + `rules/13.15`
> (AI MUST CHALLENGE UC PROLIFERATION), flow này là middleware behavior —
> không phải user goal trực tiếp. UC-07 được giữ vì:
>
> - Đây là một **business capability độc lập** (RBAC check) với permission
>   semantics riêng (ALL vs ANY).
> - Cần tách riêng để test coverage riêng (`UT-12..17`).
> - Future UCs (audit, role management) sẽ reuse middleware này.

## 2. Actor

**Middleware** — không có actor trực tiếp. Được invoke bởi router sau
`authenticate`.

## 3. Permission / Preconditions

- **Permission**: n/a (middleware này **enforce** permission).
- **Preconditions**:
  - `req.user` đã được set bởi `authenticate` middleware.
  - `req.user.role.permissions` đã được populate.

## 4. Trigger

Route handler trên bất kỳ protected endpoint nào gọi
`requirePermission(...perms)`. Trong source hiện tại:

- `staff.router.js`: `requirePermission('CREATE_STAFF')`, `'UPDATE_STAFF'`, `'ASSIGN_ROLE'`
- `profile.router.js`: `requirePermission('VIEW_PROFILE')`
- `staff.router.js` GET `/:id`: `requirePermission('VIEW_STAFF')`

## 5. API

Không có HTTP endpoint. Đây là middleware function.

## 6. Input

| Field | Type | Source |
| ----- | ---- | ------ |
| `...perms` | string[] | arguments passed by the route at registration |
| `req.user` | User (with populated `role.permissions`) | set by `authenticate` |

## 7. Main Flow

1. Route handler đã register `requirePermission('X', 'Y', ...)` qua router.
2. Request đi qua `authenticate` (UC-08 step 2) → `req.user` populated.
3. `requirePermission(...perms)` được gọi.
4. Middleware lấy `req.user.role.permissions` (array of strings).
5. Kiểm tra **ALL** of `perms` ⊆ `req.user.role.permissions` (AND, not OR).
6. Nếu đủ → `next()`.
7. Nếu thiếu → `next(new ApiError(403, "Missing permission(s): X, Y"))`.
8. `ApiError` middleware trả response `403 Forbidden` với payload chuẩn.

## 8. Alternative / Error Flow

| Code | Cause | Trigger |
| ---- | ----- | ------- |
| `401` | `req.user` không có (authenticate skipped or failed) | req.user missing |
| `403` | `req.user.role === null` | role was deleted / not populated |
| `403` | `req.user.role.permissions` thiếu ≥ 1 required | step 7 |

## 9. Business Rules

- **AND semantics, NOT OR**. `requirePermission('A', 'B')` yêu cầu **cả A
  và B** đều có trong `req.user.role.permissions`. Sai lầm phổ biến:
  đọc thành "A hoặc B".
- Permission là string constants từ `backend/src/constants/permissions.js`.
- Role có thể có 0 permission → vẫn trả 403.
- Middleware phải đặt **sau** `authenticate` trong chuỗi middleware. Nếu
  `req.user` thiếu → 401 (không 403), vì đó là authentication failure.

## 10. Backend Implementation

### API
N/A — this is an **Express middleware** function, not an HTTP route.
Signature:
```js
requirePermission(...perms: string[]) => (req, res, next) => void
```

### Authentication / Authorization
- This middleware **enforces** authorization. It must be mounted **after**
  `authenticate()` (which sets `req.user`). If `req.user` is missing, the
  middleware forwards a `401` (authentication failure, not authorization).
- Permission constants: `backend/src/constants/permissions.js`
  (e.g. `CREATE_STAFF`, `UPDATE_STAFF`, `ASSIGN_ROLE`, `VIEW_STAFF`, `VIEW_PROFILE`).

### Validation
- Input is `...perms` (variadic string array). No format validation —
  caller passes string constants from `permissions.js`.

### Controller / Service / Repository
- N/A — middleware is a single synchronous function with no MVC layers.

### Model / Database
- N/A — operates only on the already-populated `req.user.role.permissions`
  (no DB access).

### External Service
- None.

### Request Contract
- `req.user` — populated by `authenticate` middleware.
- `req.user.role` — populated Mongoose `Role` document (may be `null`).
- `req.user.role.permissions` — array of permission strings.
- `perms` — arguments passed at router registration time.

### Response Contract
- Success → `next()` (request continues to next middleware/handler).
- Failure → `next(new ApiError(403, "Missing permission(s): X, Y"))`
  (or `401` if `req.user` is missing).

### Error Handling
| Code | Cause | Trigger |
| ---- | ----- | ------- |
| `401` | `req.user` missing — middleware placed before `authenticate` | req.user is undefined |
| `403` | `req.user.role === null` (role deleted / not populated) | role is null |
| `403` | ≥ 1 required permission missing from `req.user.role.permissions` | AND check fails |

**Important semantics**:
- `requirePermission('A', 'B')` requires **BOTH A and B** (AND, NOT OR).
  Common mistake: reading it as "A or B".

### Backend Unit Tests (`backend/tests/unit/`)
- `UT-12` — single permission required, present → `next()` called.
- `UT-13` — single permission required, missing → `ApiError(403)`.
- `UT-14` — multiple permissions, AND semantics (all required).
- `UT-15` — multiple permissions, only one present → `ApiError(403)`.
- `UT-16` — `req.user.role === null` → `ApiError(403)`.
- `UT-17` — `req.user` missing → `ApiError(401)` (not 403).

### Backend System / API Tests (`docs/tests/SYSTEM-TEST.md`)
- **Implicit**: every protected endpoint row in `SYSTEM-TEST.md` exercises
  this middleware (UC-01, UC-02, UC-03, UC-04, UC-05). No dedicated
  `ST-NN` row is required because the behaviour is covered by each
  endpoint's own system test.

## 11. Frontend Implementation

**N/A — backend middleware, no UI component.**

Frontend visibility is governed **indirectly**: the client hides routes /
menu entries for permissions the current user does not hold, by inspecting
`user.role.permissions` returned by `GET /api/profile/me` (see UC-08).

Typical client pattern:
```jsx
<RequirePermission permissions={['CREATE_STAFF']}>
  <StaffCreatePage />
</RequirePermission>
```
where `RequirePermission` is a frontend HOC that reads from the auth
context. This HOC is a **client-side convenience only** — the backend
middleware is the authoritative gate.

## 12. UML

- **Class Diagram**: `docs/plantuml/CD-07-Check-Profile-Permission.puml`
- **Sequence Diagram**: `docs/plantuml/SD-07-Check-Profile-Permission.puml`

Cardinality: 1 UC ↔ 1 CD ↔ 1 SD (per `rules/03-use-case.md` HARD RULE).

> **Drift note (NEEDS VERIFICATION)**: the previous reference listed this
> UC as "authZ branch inside `SD-02-View-Profile.puml`". That violates 1
> UC = 1 SD. The fix is to extract `SD-07-Check-Profile-Permission.puml`
> from the authZ branch of `SD-02`. Verify in source repo; if not, create
> it. Shared class (`PermissionMiddleware`) is drawn in both CD-02 and
> CD-07.

## 13. Related Documentation

- UC body: `docs/UC/UC-PACKAGE.md` (UC-07 entry)
- BACKLOG: Status #3 (RBAC layer)
- Used by: UC-01, UC-02, UC-03, UC-04, UC-05
- Cross-references with the AND semantics: `UT-17` documents this clearly;
  UC body wording should be updated to match (drift).