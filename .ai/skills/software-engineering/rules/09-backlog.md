# Rule 09 — Backlog

`docs/BACKLOG.md` has **two tables**, in this order:

## I. Status Report

One row per completed task:

| # | Project Task | In-charge | Status | Notes (Work Item in Details) |

Status values: `Completed`, `In Progress`, `Blocked`, `Not Started`.

The Notes column is **mandatory** and must contain:

- one-sentence description,
- a way to reproduce / verify (URL, command, test id),
- observed result (status code, log line, file count).

## II. Project Issues

One row per open or resolved issue:

| # | Project Issue | Owner | Status | Notes (Solution, Suggestion, etc.) |

Status values: `Open`, `Resolved`, `Partially Resolved`, `Open (not in scope)`,
`Open (accepted trade-off)`.

## Update rules

- Append new rows; **never renumber**.
- When a task is completed, move from "In Progress" to "Completed" **by editing
  the existing row** — do not add a new row for the same task.
- When an issue is resolved, set status to `Resolved` and append the resolution
  to the Notes column.
- Duplicate rows are a defect.

## AI behaviour

- After implementing a feature, append a row to Status Report.
- After discovering a new tech debt, append a row to Project Issues.
- Cross-link related rows by id (e.g. "see Status #21").

## Templates

- `templates/backlog-template.md` — both table shells + column definitions.
