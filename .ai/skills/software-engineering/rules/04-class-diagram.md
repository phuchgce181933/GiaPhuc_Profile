# Rule 04 — Class Diagram

Use `templates/class-diagram-template.puml` as the starting shell.

## Inclusion rules

Only draw a class when **all** of the following hold:

- the class file exists under `backend/src/` or `frontend/src/`;
- the class participates in the UC being modelled.

## Attributes and methods

- Use `+ public`, `- private`, `# protected`.
- Omit getters/setters unless they carry business logic.
- Keep attributes to **important fields only** (`passwordHash`, `isActive`,
  `role`, etc.). Skip timestamps unless they're part of the UC.
- Methods listed must exist as defined in the source.

## Relationships

| Notation | When |
| -------- | ---- |
| `-->`   | A calls a method on B (control dependency). |
| `..>`   | A instantiates / uses B without holding a reference (factory / util). |
| `--\|>` | Inheritance. |
| `..\|>` | Implementation of an interface (this repo has none yet). |
| `*--`   | Composition (B cannot exist without A). |
| `o--`   | Aggregation (B can exist without A). |

Default direction: top-down (Router at top, DB not drawn on CD).

## Style

- Black & white only. See rule 06.
- Orthogonal edges (`linetype ortho`).
- Use the project's existing skinparam block.

## Anti-patterns

- Drawing a "DatabaseManager", "UserManager", "BaseController", "BaseRepository"
  unless the file exists.
- Drawing every method on every class.
- Adding classes that "look architecturally correct" but are not in `src/`.
- Drawing a UC's CD with classes from a different UC just because they share
  a module.

## Hard rule

- **One UC = one CD.** See the HARD RULE block at the end of
  `rules/03-use-case.md`. Do **not** create a CD that mixes two or more UCs
  (e.g. `CD-01-Staff-CRUD-and-Auth.puml` covering UC-01 + UC-02 + UC-08).
  If two UCs share classes, both UCs still get their own CD and the shared
  classes appear in both.
- **Cardinality is 1 : 1 : 1.** `UC-XX` ↔ `CD-XX-<Name>.puml` ↔
  `SD-XX-<Name>.puml`. The same UC id `XX` is used in all three filenames.
- **Shared classes are allowed.** Two UCs may share the `User` class —
  each UC still gets its own CD, and `User` is drawn in both.
- **Shared diagrams are forbidden.** A single CD must not serve more than
  one UC, regardless of how tempting the consolidation feels.
