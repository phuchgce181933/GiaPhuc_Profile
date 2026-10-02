# Examples Index

Eight per-UC working examples — one per UC in the existing
`docs/UC/UC-PACKAGE.md`. Each folder is a self-contained, **developer-first**
slice for one UC.

## Per-folder structure (developer-first standard)

```
UC-XX-<Name>/
  README.md    # developer-facing documentation (13 sections)
  notes.md     # maintenance / impact / drift metadata only
```

### `README.md` — developer-facing

Each `README.md` is **readable on its own** — a developer should understand
the UC without opening any other file. Required 13 sections:

1. Mục đích (Purpose)
2. Actor
3. Permission / Preconditions
4. Trigger
5. API
6. Input
7. Main Flow (numbered, references real source)
8. Alternative / Error Flow
9. Business Rules
10. Source Code (layer-by-layer)
11. Tests (UT + ST)
12. UML (CD + SD, with cardinality reminder)
13. Related Documentation

See `UC-01-Create-Staff/README.md` as the canonical template.

### `notes.md` — maintenance only

Each `notes.md` is **not** documentation. It is for:

- 12-row Change Impact Matrix
- Drift observations (with link to source-of-truth decision)
- Source mapping (which file was touched when)
- Validation checklist
- Dependency notes (per `rules/12`)

Header:

```
# UC-XX — Maintenance Notes

> This file contains maintenance and validation metadata.
> It is not the primary developer documentation for this UC.
```

## UC ↔ CD ↔ SD = 1 : 1 : 1 (HARD RULE)

| UC | Class Diagram | Sequence Diagram |
| -- | ------------- | ---------------- |
| UC-01 — Create Staff | `CD-01-Create-Staff.puml` | `SD-01-Create-Staff.puml` |
| UC-02 — View Staff Profile | `CD-02-View-Staff-Profile.puml` | `SD-02-View-Staff-Profile.puml` |
| UC-03 — Update Staff Profile | `CD-03-Update-Staff-Profile.puml` | `SD-03-Update-Staff-Profile.puml` |
| UC-04 — Assign Role | `CD-04-Assign-Role.puml` | `SD-04-Assign-Role.puml` |
| UC-05 — Activate / Deactivate | `CD-05-Activate-Deactivate.puml` | `SD-05-Activate-Deactivate.puml` |
| UC-06 — Send Staff Account Notification | `CD-06-Send-Staff-Account-Notification.puml` | `SD-06-Send-Staff-Account-Notification.puml` `[NEEDS VERIFICATION]` |
| UC-07 — Check Profile Permission | `CD-07-Check-Profile-Permission.puml` | `SD-07-Check-Profile-Permission.puml` `[NEEDS VERIFICATION]` |
| UC-08 — View Own Profile | `CD-08-View-Own-Profile.puml` | `SD-08-View-Own-Profile.puml` |

> **NEEDS VERIFICATION**: UC-06 and UC-07 were previously documented as
> sub-flows / authZ-branches of `SD-01` / `SD-02` respectively. Per
> `rules/03-use-case.md` HARD RULE (1 UC = 1 SD), new SD files
> (`SD-06-…`, `SD-07-…`) must be extracted in the source repo. The
> `notes.md` of UC-06 and UC-07 flag it in §4 Validation checklist.

## Discrepancy with the task brief

The task brief that produced this skill listed example folder names as
`UC-01-Login`, `UC-02-Refresh`, …`UC-08-Permission`. The actual
`UC-PACKAGE.md` uses different UC IDs and names:

| Brief name | Actual UC id | Actual UC name |
| ---------- | ------------ | -------------- |
| UC-01 Login | UC-01 | Create Staff Account |
| UC-02 Refresh | UC-02 | View Staff Profile |
| UC-03 Create Staff | UC-03 | Update Staff Profile |
| UC-04 Update Staff | UC-04 | Assign Role |
| UC-05 Assign Role | UC-05 | Activate / Deactivate Account |
| UC-06 Update Status | UC-06 | Send Staff Account Notification |
| UC-07 Profile | UC-07 | Check Profile Permission |
| UC-08 Permission | UC-08 | View Own Profile |

Per rule 01 (source of truth), the actual package wins. The folders below
match `UC-PACKAGE.md`.

## Login / Refresh

The auth module exists in `backend/src/modules/auth/` (login + refresh) but is
**not** part of `UC-PACKAGE.md`. If you want to document it, propose:

- UC-09 — Login
- UC-10 — Refresh Token

before adding rows to `UC-PACKAGE.md`. Do not silently create them.

## Pre-existing diagram references (now fixed)

The original examples referenced multi-UC diagrams (`CD-01-Staff-Management.puml`,
`CD-02-Profile-and-Auth.puml`). Those were violations of `rules/03-use-case.md`
HARD RULE. All references have been updated to per-UC diagrams following
the table above.

## UC normalization decisions (per `rules/13`)

| Decision | UC | Reason |
| -------- | -- | ------ |
| **Kept separate** (not over-split) | UC-01..UC-08 | Each has a distinct user goal, permission set, or business rule. |
| **Kept together** (not over-merged) | `isActive` toggle folds into UC-03 (PUT full update) **and** has dedicated `UC-05` (PATCH /status) | Two endpoints with different shapes and audit potential. UC-03 is the "edit any field"; UC-05 is the dedicated lightweight toggle. |
| **Kept as UC despite side-effect nature** | UC-06 (Send Staff Account Notification) | Kept because email pattern is reusable for future UCs (password reset, role change). Marked in README §1. |
| **Kept as UC despite being middleware** | UC-07 (Check Profile Permission) | Kept because RBAC is an independent business capability with its own AND-semantics test suite (UT-12..17). Marked in README §1. |
| **Not split into "Edit Name / Edit Phone / …"** | UC-03 | Per `rules/13.4` — CRUD variation does not warrant a new UC. |

## Cross-references

- `rules/03-use-case.md` — HARD RULE 1 UC = 1 CD + 1 SD.
- `rules/13-use-case-optimization-and-grouping.md` — UC proliferation vs.
  over-merging HARD RULES.
- `rules/08-documentation.md` — developer-first README + maintenance-only
  notes.md.

---

Last updated: 2026-10-02