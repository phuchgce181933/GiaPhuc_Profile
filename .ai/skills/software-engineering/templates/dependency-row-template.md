# Dependency Row Template

Use this when adding or editing a row in `backend/DEPENDENCIES.md`,
`frontend/DEPENDENCIES.md`, or `docs/STACK.md`.

See `rules/12-library-framework-changelog.md` for the rule that governs
this template.

## Single-row shell

```md
| <YYYY-MM-DD> | <package-name> | <version-from> → <version-to> | <runtime / dev / peer / optional> | <one-sentence purpose> | <file:path paths> | <replacement or "—"> | <CVE / breaking-change refs or "—"> | <license or "—"> |
```

## Status flags (use in the Notes column or as a separate column)

- `[NEW]` — first introduction
- `[UP]` — version upgrade
- `[DOWN]` — version downgrade
- `[PIN]` — version pinning change only (e.g. removing `^`)
- `[REM]` — removed

## Example rows

### Add

```
| 2026-10-02 | joi | → 17.13.3 | runtime | [NEW] Schema validation for request bodies | backend/src/modules/staff/staff.validator.js | — | — | BSD-3-Clause |
```

### Upgrade

```
| 2026-10-15 | bcrypt | 5.1.1 → 5.1.2 | runtime | [UP] Patch for CVE-2024-XXXX | backend/src/models/user.model.js | — | CVE-2024-XXXX fixed | MIT |
```

### Remove

```
| 2026-11-01 | request | 2.88.2 → (removed) | runtime | [REM] Replaced by native fetch (Node ≥ 18) | — | native `fetch` | — | MIT (was) |
```

## Cross-cutting entry (in `docs/STACK.md`)

```
| Layer | Component | Version | Source | Notes |
| ------ | --------- | ------- | ------ | ----- |
| Runtime | Node.js | 22.x LTS | official LTS | enforced in `package.json` engines |
| Build | Vite | 5.x | frontend only | — |
| DB driver | mongoose | 8.x | backend only | — |
| Mail | nodemailer | 6.x | backend only | uses Gmail SMTP via env |
```

## Anti-patterns

- Recording only the name, leaving Purpose empty.
- Using `^17.13.3` or `~5.1.1` instead of pinned versions.
- Deleting the row on `[REM]` instead of keeping it as an audit trail.
- Putting backend-only deps in `docs/STACK.md` (use
  `backend/DEPENDENCIES.md`).