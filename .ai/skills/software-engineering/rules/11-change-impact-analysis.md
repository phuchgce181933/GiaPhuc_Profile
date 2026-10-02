# Rule 11 — Change Impact Analysis

Before editing **any** file, build a 15-area impact matrix.

## The matrix

The matrix has 15 rows. The columns are: `Area | Affected? (Yes/No) | Files | Reason`.

| # | Area | Affected? | Files | Reason |
| - | ---- | --------- | ----- | ------ |
| 1 | Backend module(s) | yes/no | path:line | which method/route changes |
| 2 | Backend tests | yes/no | path | new or updated test cases |
| 3 | Frontend pages | yes/no | path | which page consumes the change |
| 4 | Frontend API module | yes/no | path | which axios wrapper changes |
| 5 | Database / models | yes/no | path | new field, index, or migration |
| 6 | Permissions | yes/no | path | permission constant affected |
| 7 | ENV vars | yes/no | path | new var, value change, removal |
| 8 | Library / Framework (rule 12) | yes/no | path | `package.json` add/upgrade/remove → `DEPENDENCIES.md` + `docs/STACK.md` |
| 9 | Use Case (UC-PACKAGE.md) | yes/no | UC id | flow or contract change |
| 10 | Class Diagram | yes/no | CD id | class added/removed/renamed |
| 11 | Sequence Diagram | yes/no | SD id | new arrow / new participant |
| 12 | Unit Test doc | yes/no | UT id | new or updated case |
| 13 | System Test doc | yes/no | ST id | new or updated scenario |
| 14 | Backlog (Status row + Issue row) | yes/no | row id | which task completes / new debt |
| 15 | README | yes/no | section | API table / env table / architecture |

## Decision rule

If an area is **NOT** affected, do not edit it. The matrix exists to prevent
drive-by edits.

## When the matrix is large (>10 affected rows)

- Split the work into multiple commits (one per logical area).
- Each commit must leave the repo in a consistent state (tests + lint pass).

## When the matrix is small (<3 rows)

- A single commit is fine.
- Still include the matrix in the response so the user can audit.
