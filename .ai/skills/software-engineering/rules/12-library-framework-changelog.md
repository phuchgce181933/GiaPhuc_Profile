# Rule 12 — Library / Framework Changelog

Every time a dependency (npm/pip/cargo/maven/etc. package, framework,
runtime, or shared library) is added, upgraded, downgraded, or removed from
**any** project component, it MUST be recorded in the same commit.

This rule applies to:

- `backend/package.json` dependencies and devDependencies.
- `frontend/package.json` dependencies and devDependencies.
- Any other lockfile in the repo.
- Framework-level additions (e.g. switching from Express to Fastify, adding
  Vite plugins, adding Tailwind to a Vite project).

## What must be recorded

For each dependency change, one row in the changelog:

| Field | Description |
| ----- | ----------- |
| **Name** | Exact package name as in the lock file. |
| **Version (from → to)** | Pinned versions, no `^` / `~`. For `add`, leave "from" empty. For `remove`, leave "to" empty. |
| **Type** | `runtime` · `dev` · `peer` · `optional` |
| **Purpose** | One sentence: why the dep was added / changed. |
| **Used by** | Which files / modules import it (paths, not full lists). |
| **Replaces** | If removing, what the dep is replaced by (file / native API / nothing). |
| **Security / breaking** | If upgrading: CVE refs, migration steps, breaking changes. |
| **License** | License of the dep — only if changing or unknown. |
| **Date** | ISO date `YYYY-MM-DD` the change was committed. |
| **Commit** | Short SHA or commit message keyword. |

## Where to record

| Layer | File |
| ----- | ---- |
| Backend deps | `backend/DEPENDENCIES.md` (sibling of `backend/package.json`) |
| Frontend deps | `frontend/DEPENDENCIES.md` (sibling of `frontend/package.json`) |
| Cross-cutting / shared / runtime / framework | `docs/STACK.md` at the repo root |

`docs/STACK.md` is the **single source of truth** for the project-wide
technology inventory (Node version, React version, Mongo driver, deployment
runtime, etc.).

## Update rules

- **Add** a row when the dep is first introduced.
- **Edit in place** on upgrade / downgrade / license change. Do not append a
  second row for the same dep.
- **Mark removed** by appending `(removed YYYY-MM-DD)` to the row's Notes
  column or by setting the Status cell to `Removed`. Do not delete the row —
  the audit trail matters.
- Keep rows in chronological order of the **first** introduction; the `Date`
  column makes ordering explicit.

## Why this is mandatory

- `git log package.json` shows *when* a dep changed but not *why*. The
  changelog captures intent.
- Security review needs a single list of pinned versions.
- License audits need an inventory.
- Drift detection (`rules/10-validation.md`) can compare `package.json`
  against `DEPENDENCIES.md` to detect **undocumented** dep changes — those
  are always a defect.

## Format guidance (UX)

- One table per file. Sort by date DESC or ASC; pick one and stick to it.
- Use emoji or badges sparingly; a `[NEW]`, `[UP]`, `[REM]` tag in the row is
  enough.
- Keep Purpose to **one sentence**. Link to the BACKLOG row or UC id if more
  context is needed.

## Anti-patterns

- Adding a dep but not recording it in `DEPENDENCIES.md` / `docs/STACK.md`.
- Recording only the name + date, leaving Purpose empty.
- Recording the version range with `^` or `~` instead of the pinned version.
- Deleting the row when a dep is removed (instead of marking it `Removed`).
- Putting cross-cutting deps (e.g. Node runtime, Vite) in
  `backend/DEPENDENCIES.md` instead of `docs/STACK.md`.

## Cross-references

- `rules/08-documentation.md` — general doc discipline.
- `checklists/implementation-checklist.md` — `.env.example` companion updates.
- `rules/10-validation.md` — drift check `package.json` ↔ `DEPENDENCIES.md`.
- `rules/11-change-impact-analysis.md` — `Library / Framework` is a row in
  the impact matrix.

## Templates

- `templates/dependency-row-template.md` — single-row shell, used by AI when
  filling in a row.

## Worked example (illustrative — not committed)

```
| 2026-10-02 | joi | 17.13.3 → 17.13.3 | runtime | Schema validation for request bodies | backend/src/modules/staff/staff.validator.js | — | — | BSD-3-Clause |
| 2026-10-15 | bcrypt | 5.1.1 → 5.1.2 | runtime | Patch for CVE-2024-XXXX | backend/src/models/user.model.js | — | CVE-2024-XXXX fixed | MIT |
| 2026-11-01 | request | REMOVED | runtime | Replaced by native fetch in Node 22 | — | native `fetch` | — | MIT (was) |
```