# Change Classification Template (TYPE A–H)

Per the original task brief section 14, classify every change **before**
editing. A change can be more than one type — list all that apply.

| Type | Scope | Docs to update | Code areas |
| ---- | ----- | -------------- | ---------- |
| **A** — Documentation only | README, BACKLOG, UC body, test docs, PlantUML | <the affected doc> | none |
| **B** — UI only | frontend pages, components, styles | possibly README, possibly BACKLOG | `frontend/src/{pages,components,styles}` |
| **C** — Backend behavior | service / repository / model logic, validators | UC body, CD, SD, UT, ST, BACKLOG | `backend/src/modules/**`, `backend/src/models/**` |
| **D** — API contract | new endpoint, new field, new error code, contract change | UC body, README API table, SD, ST, BACKLOG | router + controller (signature) |
| **E** — Database / model | new field, new index, new collection, migration | UC body, CD (model), ST, BACKLOG, possibly `.env.example` | `backend/src/models/**`, `scripts/migrate/**` |
| **F** — Authentication / authorization | permission constant, JWT, middleware | UC-07 body, UC-08 body, README, SD, ST, BACKLOG | `middlewares/auth.middleware.js`, `middlewares/permission.middleware.js`, `constants/permissions.js` |
| **G** — Architecture | new layer / new abstraction / new pattern | UC body (if UC changes), CD, SD, README architecture, BACKLOG | usually multiple modules |
| **H** — Cross-cutting | a change that spans ≥ 3 of the above | all of the above | all of the above |

## How to classify

1. List every file the change touches.
2. Group by the table above.
3. If a file fits two types, list both. Example: a new endpoint that adds
   a new field to the model is TYPE D + TYPE E.
4. Put the classification in the response header:

```
Change types: TYPE C, TYPE D
```

## UC creation gate (mandatory)

If the change is TYPE C / D / F (or any change that introduces a new
backend behavior, new endpoint, or new permission), the AI MUST first
apply **`rules/13-use-case-optimization-and-grouping.md`**:

- Does this represent a new USER GOAL, or is it a variation of an
  existing UC (e.g. another field on the edit form, another endpoint
  serving the same business capability)?
- If "variation of existing UC" → fold into the existing UC. **DO NOT**
  assign a new UC id.
- If "new user goal" → assign the next free UC id (`UC-XX`) and follow
  rule 03 (1 UC = 1 CD + 1 SD).

See `rules/13-use-case-optimization-and-grouping.md` for the full
17-section HARD RULE (incl. the "DO NOT OVER-MERGE" counter-rule).

## Why this matters

- The impact matrix (`rules/11`) lists every area; the classification tells
  the **AI which docs are mandatory**. Skipping the classification is the
  #1 reason docs drift.
- The release checklist (`checklists/release-checklist.md`) uses the
  classification to decide which "Validation" rows are PASS / FAIL / N/A.

## Decision tree

```
New library / framework?
  → also requires rule 12 (DEPENDENCIES.md + docs/STACK.md)

New permission?
  → TYPE F + TYPE C (constants/permissions.js + middleware + service)

New env var?
  → TYPE E or TYPE F (model or middleware) + rule 08 (.env.example + README)

New endpoint?
  → TYPE D + TYPE C (controller + service + repo) + UT + ST + UC + CD + SD

New page?
  → TYPE B + UT (axios mock) + ST + UC + CD (frontend) + SD

New table in DB?
  → TYPE E + TYPE C (model + repo) + UT + ST + UC + CD + SD
```

## Anti-patterns

- Classifying a change as TYPE A (doc only) when it touches source code.
- Forgetting TO UPDATE.
- Refusing to classify ("it's everything") — break it into the 3 most
  prominent types.