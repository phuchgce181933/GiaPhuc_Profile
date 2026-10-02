# Rule 02 — Architecture

The default layered pattern in this repository is:

```
Router
  ↓
Middleware(s)
  ↓
Controller
  ↓
Service
  ↓
Repository  (optional)
  ↓
Model
  ↓
MongoDB
```

This is a **default**, not a law.

## Decision rules

- **Include a layer only if the actual endpoint uses it.**
- Login may use Router → Controller → Service → Repository → Model → DB.
- A read-only endpoint may skip the Repository layer if the Model exposes a
  suitable static method (`User.findById`).
- Middleware that is not registered on the route MUST NOT appear in the SD.

### Middleware-in-SD clarification

The sequence-diagram template (`templates/sequence-diagram-template.puml`)
includes `AuthMiddleware`, `PermissionMiddleware`, `ValidateMiddleware` as
**default participants**. They are listed to remind the AI of the common
shape, but the rule above still binds:

- Remove `PermissionMiddleware` from the SD if the route does not call
  `requirePermission(...)`.
- Remove `ValidateMiddleware` if the route has no body to validate (e.g.
  `GET`, `DELETE` with no schema).
- Remove `AuthMiddleware` only if the route is intentionally public (rare —
  flag in the UC body).

If all three are removed, the SD becomes a 2-party diagram (Actor → Page →
Axios → Router → DB / SMTP). That is fine — minimal is correct.

## Existing module layout

```
backend/src/modules/<feature>/
  <feature>.router.js
  <feature>.controller.js
  <feature>.service.js
  <feature>.validator.js
  <feature>/*.repository.js    (only when not using model static methods)
```

Do not invent new layers (e.g. `BaseRepository`, `GenericService`) without an
explicit user requirement.

## Configuration discipline

- Environment-specific config lives in `.env`.
- Never hard-code `localhost`, `127.0.0.1`, MongoDB URI, JWT secret, or mail
  password in any class / component / service / route.
- Use the existing `src/config/env.js` for new env vars.
- Update `backend/.env.example` and the README env table in the same commit.

## Frontend mirror

The frontend has **no equivalent layered contract**. Each page calls an axios
module in `frontend/src/api/`. Keep new pages consistent with `StaffListPage`
etc.
