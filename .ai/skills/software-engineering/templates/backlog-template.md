# Backlog Template

Mirror into `docs/BACKLOG.md`. Keep the two-table structure.

---

## I. Status Report

| # | Project Task | In-charge | Status | Notes (Work Item in Details) |
| - | ------------ | --------- | ------ | ---------------------------- |
| 1 | <Title> | <Owner> | Completed | <one-sentence summary> · verify: <command / URL / test id> · observed: <status code / log line / file count> |

Status values: `Completed`, `In Progress`, `Blocked`, `Not Started`.

## II. Project Issues

| # | Project Issue | Owner | Status | Notes (Solution, Suggestion, etc.) |
| - | ------------- | ----- | ------ | ---------------------------------- |

Status values: `Open`, `Resolved`, `Partially Resolved`, `Open (not in scope)`,
`Open (accepted trade-off)`.

## Update rules

- Append a new row; never renumber.
- When a task is finished, **edit** the existing row, do **not** add a duplicate.
- When an issue is resolved, change its status and append the resolution.

## AI checklist before adding a row

- [ ] Title is unique (search the existing doc first).
- [ ] In-charge column matches the project owner pattern (`Huỳnh Gia Phúc`).
- [ ] Notes column contains **verify** + **observed** lines.
- [ ] Status is consistent with the rest of the doc.
- [ ] Cross-link related rows by id when useful (e.g. "see Status #20").
