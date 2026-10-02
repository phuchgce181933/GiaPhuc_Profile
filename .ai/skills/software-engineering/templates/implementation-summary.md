# Implementation Summary Template

Use this template in the **final response** of every task. Fill in every
section; leave no `TBD` or `n/a` without an explanation.

The summary has **3 viewports** — Backend, Frontend, Backend ↔ Frontend
Contract — so each side is auditable on its own.

---

```md
Change types: TYPE …   (one per row of B / C / F matrix)
Impact matrix: N rows — <link to <change-impact-matrix.md> or inline table>

# Implementation Summary

## 1. Changed (1-line)
<one-paragraph summary — what the change accomplishes, in business terms>

## 2. Files Changed
- `<path>` — <role: backend/frontend/contract/doc/uml/test/config>
- (every file touched, including created ones; role tag is REQUIRED)

---

## 3. Backend Implementation  ← VIEWPORT A

### 3.1 Endpoint
- `METHOD /api/...` (new / modified) — one-line purpose

### 3.2 AuthN / AuthZ
- middleware: `<list>` (only those actually registered on the route)
- permission: `<PERM_XXX>` from `backend/src/constants/permissions.js`

### 3.3 Validation
- schema: `<name>.validator.js` — <one-line summary of what is validated>

### 3.4 Controller / Service / Repository
- `controller.method()` — append arrow <one-line>
- `service.method()` — append arrow <one-line>
- repository (if any) — append arrow <one-line>

### 3.5 Model / Schema
- model: `<name>.model.js` — <field added/changed/removed>

### 3.6 Env / Config
- new env: `VAR_NAME=<default>` (added to `.env.example` AND README env table? Y/N)

### 3.7 Backend Tests
- new UT: `UT-NN — <description>` (added to `docs/tests/UNIT-TEST.md`? Y/N)
- modified UT: `UT-NN — <what changed>`
- new ST: `ST-NN — <scenario>` (added to `docs/tests/SYSTEM-TEST.md`? Y/N)
- command: `cd backend && npm test`
- result: `PASS — N/N passed on YYYY-MM-DD` or `FAIL — N failures, see <file:line>` or `N/A — reason`

---

## 4. Frontend Implementation  ← VIEWPORT B

### 4.1 Page / Screen
- `frontend/src/pages/XxxPage.jsx` (new / modified) — <one-line purpose>
- route: `<path>` — guarded by `<RequirePermission ...>` ?

### 4.2 Component (if new)
- `frontend/src/components/Xxx.tsx` — purpose, props, emits

### 4.3 API Module
- `frontend/src/api/xxx.api.js#methodName` — HTTP call
- matches backend endpoint? Y/N (must be 1:1 with §3.1)

### 4.4 Hook (if new)
- `frontend/src/hooks/useXxx.js` — purpose, deps, return shape

### 4.5 State / Form / UX
- state: local | context | redux
- form library (if any): RHF | Formik | controlled
- loading / error UX: one-line

### 4.6 Frontend Tests
- new: `<test file> — <scenario>`
- command: `cd frontend && npm test`
- result: PASS / FAIL / N/A (mirrors backend §3.7)

---

## 5. Backend ↔ Frontend Contract  ← VIEWPORT C

### 5.1 Endpoint ↔ API method 1:1
| Backend route | Frontend call | Match? |
| ------------- | ------------- | ------ |
| `POST /api/staff` | `staff.api.js#createStaff` | ✓ / ✗ |

### 5.2 Request DTO
```json
{ "field": "type — description" }
```

### 5.3 Response DTO
```json
{ "success": true, "data": { "...": "..." } }
```

### 5.4 Error contract
| HTTP | Trigger | Frontend handling |
| ----- | ------- | ---------------- |
| 400 | validation | inline form errors |
| 401 | unauthenticated | redirect to /login |
| 403 | missing permission | toast + /forbidden |
| 404 | not found | inline / toast |
| 409 | conflict (dup) | inline on field |
| 500 | server | toast, retry button |

### 5.5 Contract drift?
- Y / N — if Y, <drift summary + recommended fix>

---

## 6. Documentation Updated
- `docs/UC/UC-PACKAGE.md` — <UC id, which field>
- `docs/BACKLOG.md` — <row added/edited>
- `README.md` — <env table / API table row>
- (or "no documentation update required" — must be intentional)

## 7. UML Updated (1 UC = 1 CD + 1 SD)
- Class Diagram: `CD-XX-<Name>.puml` (modified? new?) or `no UML change`
- Sequence Diagram: `SD-XX-<Name>.puml` (modified? new?) or `no UML change`
- Traceability table in `docs/UC/UC-PACKAGE.md` updated: yes / no / N/A
- **HARD RULE check**: did NOT combine multiple UCs into one diagram — PASS / FAIL

## 8. Backlog Updated
- Status row: `<new row #N | edited row #M>` or `<no backlog change>`
- Issue row: `<new row #N | edited row #M | no new issue>`

## 9. Validation
- Architecture: PASS / FAIL / N/A — <one-line evidence>
- Tests: PASS / FAIL / N/A — <one-line evidence>
- Documentation: PASS / FAIL / N/A — <one-line evidence>
- UML: PASS / FAIL / N/A — <one-line evidence + 1:1:1 check>
- Contract (Backend ↔ Frontend): PASS / FAIL / N/A — <one-line evidence>
- Configuration / security: PASS / FAIL / N/A — <one-line evidence>
- **Drift check** (`scripts/drift-detect.js`): PASS / FAIL

## 10. Remaining Issues
- `None`
- or `<list of open items with severity (blocker / major / minor) and
  recommended next action>`
```

---

## Truthfulness rules

- A `PASS` requires the **command + observed output** that backs it.
  - Example: `Tests: PASS — \`npm test\` 25/25 passed on 2026-10-02`.
- A `FAIL` requires the failing output (not just "regression").
- An `N/A` requires a one-sentence explanation. Examples:
  - `N/A — no source code touched, documentation-only commit`.
  - `N/A — change is in a sub-module with its own pipeline (not in scope)`.
- "Not yet tested" is `N/A`, **never** `PASS`.
- If you did not run the command, say so. Do not invent counts.

## Header before the summary

Add a single line at the very top of the response:

```
Change types: <TYPE A–H list>
Impact matrix: <15 rows, link to it or inline table>
```

This makes the rest of the response auditable in 5 seconds.

## Viewport rules

- **§3 Backend** — must be filled if any `backend/src/**` file is in the
  impact matrix. If untouched, write `N/A — pure frontend change`.
- **§4 Frontend** — must be filled if any `frontend/src/**` file is in the
  impact matrix. If untouched, write `N/A — pure backend change`.
- **§5 Contract** — must be filled if BOTH §3 and §4 are filled, OR if the
  change is purely contract (e.g. wire-format bump, status code change).
  Otherwise `N/A — single-side change`.

## Worked example (Backend-only)

```md
Change types: TYPE C
Impact matrix: 15 rows, 4 Yes / 11 No (inline)

# Implementation Summary

## 1. Changed
Add `statusCode` field to staff update response envelope.

## 2. Files Changed
- `backend/src/modules/staff/staff.service.js` — backend
- `backend/src/modules/staff/staff.controller.js` — backend
- `docs/UC/UC-PACKAGE.md` — doc
- `docs/tests/UNIT-TEST.md` — doc
- `docs/BACKLOG.md` — doc

## 3. Backend Implementation
### 3.1 Endpoint
- `PATCH /api/staff/:id` (modified) — return `statusCode` in data envelope

### 3.2 AuthN / AuthZ
- middleware: `authenticate`, `requirePermission('UPDATE_STAFF')` (registered)
- permission: `UPDATE_STAFF`

### 3.3 Validation
- schema: `staffUpdateSchema` (Joi, unchanged)

### 3.4 Controller / Service / Repository
- `controller.updateStaff#...` — appends `statusCode` to response DTO
- `service.updateStaff#...` — returns safe DTO even on no-change

### 3.5 Model / Schema
- no model change

### 3.6 Env / Config
- none

### 3.7 Backend Tests
- modified UT: `UT-26` — expects `statusCode` in response
- command: `cd backend && npm test`
- result: PASS — 26/26 passed on 2026-10-02

## 4. Frontend Implementation
- N/A — pure backend change

## 5. Backend ↔ Frontend Contract
- N/A — pure backend change (no frontend file in matrix)

## 6. Documentation Updated
- `docs/UC/UC-PACKAGE.md` — UC-03 Postcondition updated.
- `docs/tests/UNIT-TEST.md` — UT-26 added.

## 7. UML Updated
- Class Diagram: no UML change
- Sequence Diagram: SD-03 — added `Svc --> Ctrl : statusCode` arrow.
- Traceability table: N/A (no UC added)
- HARD RULE check: PASS — single UC, single SD

## 8. Backlog Updated
- Status row: edited row #4 (note appended)
- Issue row: no new issue

## 9. Validation
- Architecture: PASS — no new layer added.
- Tests: PASS — 26/26.
- Documentation: PASS — UC-03 body reflects new behavior.
- UML: PASS — SD-03 label matches `updateStaff(...)` signature.
- Contract: N/A — single-side change.
- Configuration / security: N/A — no env / secret change.
- Drift check: PASS

## 10. Remaining Issues
- None
```

---

Owner: **Huỳnh Gia Phúc**
Last updated: 2026-10-02