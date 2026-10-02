# Rule 08 — Documentation

This rule is an **AI-specific addendum** to `docs/DOC-GUIDE.md`. Read the
DOC-GUIDE first; it is authoritative for documentation policy. This rule only
adds the workflow layer the AI must follow.

## AI documentation workflow

After every code change, run:

1. **Phase A** — did the change touch any of: README, UC package, BACKLOG,
   unit tests, system tests, PlantUML, `.env.example`?
2. If yes → list the affected files in the response (in the *Implementation
   Summary → Documentation Updated* section).
3. If no → say "no documentation update required" explicitly.

## Update granularity

- Update only the sections of a doc that the change actually affects.
- Never rewrite a whole doc just because one row changed.
- Never copy the entire implementation into a doc — describe the behaviour, not
  the source.

## Per-UC README standard (developer-first)

When `examples/UC-XX-Name/README.md` exists (or is created), it MUST be
**developer-facing** — readable on its own without bouncing to other files.

The README must answer all of:

1. What does this UC do? (purpose)
2. Who is the actor?
3. What permission / preconditions are required?
4. What is the trigger (UI / API / system event)?
5. What is the API (method + path)?
6. What is the input shape?
7. What is the main flow, step by step?
8. What are the alternative / error flows?
9. What are the important business rules?
10. Where is the source code (layer-by-layer)?
11. Where are the unit / system tests?
12. Which Class Diagram and Sequence Diagram?
13. Which related docs (UC-PACKAGE / BACKLOG / README)?

Required template lives in `examples/UC-01-Create-Staff/README.md` and is
mirrored in every other UC example. Any UC example whose README is shorter
than ~50 lines is a defect.

## notes.md purpose (maintenance only)

`examples/UC-XX-Name/notes.md` is **not** documentation. It is for:

- change-impact matrix (12 rows, simplified form of `rules/11`),
- drift observations,
- source mapping (which file changed when this UC was last touched),
- validation notes (what to verify before declaring this UC done),
- dependency notes (per `rules/12` if a dep was added for this UC).

Required header:

```
# UC-XX — Maintenance Notes

> This file contains maintenance and validation metadata.
> It is not the primary developer documentation for this UC.
```

notes.md must NOT repeat the business flow already in README.md.

## Source-of-truth interaction

If a doc contradicts the implementation after a code change, follow rule 01
(source of truth): the implementation wins, the doc is updated, and the
discrepancy is reported.

## Adding a new doc file

Before creating a new doc file:

1. Confirm no existing doc covers it (search `docs/` and README).
2. Confirm the user has approved a new file (default = no).
3. Add a row to BACKLOG.md describing the new doc.

## Anti-patterns

- Writing a doc before the code is merged.
- Writing "this will be implemented" without marking the row as `Not Executed`.
- Hard-coding API paths or status codes that disagree with the router.
- Adding example values that look pretty but contradict the validator.
