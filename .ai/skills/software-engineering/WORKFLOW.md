# Documentation & Engineering Workflow

> Canonical workflow for any AI agent (or human) using this skill.
> Every task runs through these 7 phases, **in order**. Skipping a phase is
> a defect. The phase outputs are the deliverable contract.

| Phase | Goal | Output |
| ----- | ---- | ------ |
| **A — Discover** | Understand the existing project | "What I found" + relevant file list |
| **B — Change Impact Analysis** | Decide what to touch | 15-row matrix + change types |
| **C — Implement** | Write / modify the code | git diff of matrix-allowed files |
| **D — Test** | Verify the code actually works | command + result |
| **E — Documentation Update** | Sync docs with code | list of updated doc files |
| **F — UML Update** | Sync PlantUML with code (1 UC = 1 CD + 1 SD) | list of touched puml files |
| **G — Final Consistency Validation** | Drift detection + checklist | PASS / FAIL matrix + Implementation Summary |

---

## Phase A — DISCOVER

**What it is**: understand the existing project before touching anything.

**Inputs**

- The user's current requirement (verbatim).
- This skill (`SKILL.md`, `WORKFLOW.md`).
- Existing project artefacts (docs, PlantUML, BACKLOG, source code).

**Activities**

1. Read the user's requirement carefully. Identify:
   - UC id (or note "new UC needed")
   - Feature / module name
   - Actor (Admin / Staff / System / external)
2. Read `docs/UC/UC-PACKAGE.md` to see if a UC for this already exists.
3. Run `Grep` / `Glob` to find relevant source files:
   - `backend/src/modules/<feature>/*`
   - `backend/src/models/*`
   - `backend/src/middlewares/*`
   - `frontend/src/pages/*`, `frontend/src/api/*`
4. Read at least one `examples/UC-XX-*` folder if a similar UC exists.
5. List, in the response, every file you have inspected.

**Output**

A one-paragraph "What I found" + a bullet list of relevant files.

**Pass criteria**

- [ ] You can name the UC id, the route, the controller method, the service method.
- [ ] You can name at least one existing test (UT-XX / ST-XX) if any.
- [ ] You have **not** invented any class / endpoint / permission that does not exist.

---

## Phase B — CHANGE IMPACT ANALYSIS

**What it is**: a 15-row matrix of every area the change might affect.

**Inputs**

- The user's requirement.
- The "What I found" list from Phase A.

**Activities**

1. Open `rules/11-change-impact-analysis.md`.
2. Walk through all 15 rows.
3. For each row, decide `Yes` / `No`. If `Yes`, list the exact files.
4. Compute the change type using `templates/change-classification.md`
   (TYPE A–H; can be multiple).
5. **UC creation gate**: if the change might warrant a new UC id, first
   apply `rules/13-use-case-optimization-and-grouping.md` — the 17-section
   HARD RULE on UC proliferation vs. over-merging. If the analysis says
   "fold into existing UC", DO NOT assign a new UC id. Only proceed to
   step 6 if rule 13 approves a new UC.
6. Include the matrix in your response under
   *"Implementation Summary → 2. Files Changed"*.

**Output**

A 15-row matrix with `Yes` / `No` + files + reason + a single line:

```
Change types: <TYPE …>
```

**Pass criteria**

- [ ] Every `No` has a one-line justification.
- [ ] Every `Yes` has at least one file path.
- [ ] The matrix is included verbatim in the response.

---

## Phase C — IMPLEMENT

**What it is**: write / modify the actual code.

**Inputs**: the impact matrix from Phase B.

**Activities**

1. For each `Yes` row in the matrix, make the corresponding change.
2. Follow `rules/02-architecture.md` for layered pattern.
3. Follow `checklists/implementation-checklist.md` for code hygiene.
4. If a new env var is added:
   - Update `.env.example` in the same commit.
   - Update README env table in the same commit.
5. If a new permission constant is added:
   - Update `constants/permissions.js` and `seed.js` in the same commit.
6. If a new dep is added or upgraded:
   - Update `DEPENDENCIES.md` (`backend/` or `frontend/`) in the same commit.
   - Update `docs/STACK.md` if cross-cutting (per `rules/12-…`).
   - Update `package.json` and lock file.
7. If middleware is not registered on the route, **do not** add it to the
   SD (per `rules/02-architecture.md`).

**Output**: a git diff showing only files in the `Yes` rows of the matrix.

**Pass criteria**

- [ ] `git diff --stat` lists exactly the files in the matrix.
- [ ] No drive-by edits.
- [ ] No new TODO / FIXME / console.log left behind.

---

## Phase D — TEST

**What it is**: verify the code actually works.

**Inputs**: the implementation from Phase C.

**Activities**

1. `cd backend && npm run lint` → 0 errors, 0 warnings.
2. `cd backend && npm test` → record passed / failed count.
3. `cd frontend && npm run lint` → 0 errors.
4. `cd frontend && npm run build` → success.
5. If a new test was added:
   - Add a row in `UNIT-TEST.md` per `rules/07-testing.md`.
   - Update the Summary table.
6. If a new system scenario was added:
   - Add a row in `SYSTEM-TEST.md`.

**Output**: a "## 3. Tests" block with command + result.

**Pass criteria**

- [ ] Lint passes.
- [ ] Tests pass (or are explicitly `N/A` with reason).
- [ ] New test rows have an actual executed date.
- [ ] Status `Passed` only when `npm test` actually returned 0.

---

## Phase E — DOCUMENTATION UPDATE

**What it is**: keep docs in sync with code.

**Inputs**: the implementation from Phase C.

**Activities**

1. Re-read `rules/08-documentation.md`.
2. For each `Yes` doc row in the impact matrix:
   - Update only the affected sections.
   - Cross-link to source-of-truth files.
3. README: update API table / env table / architecture section.
4. BACKLOG: append or edit a row.
5. UC package: edit the affected UC body in place (do **not** create
   `UC-XX.md` per use case — keep one canonical file).
6. If a new dep was added, update `DEPENDENCIES.md` / `docs/STACK.md`.

**Output**: a "## 4. Documentation Updated" block listing every doc file.

**Pass criteria**

- [ ] Each updated file is in the impact matrix.
- [ ] No doc was rewritten wholesale.
- [ ] Cross-references resolve (no broken `[text](path)` links).

---

## Phase F — UML UPDATE

**What it is**: keep PlantUML in sync with code (and obey the HARD RULE).

**Inputs**: the implementation from Phase C.

**Activities**

1. Re-read the HARD RULE at the end of `rules/03-use-case.md`:
   **1 UC = 1 CD + 1 SD**.
2. If the implementation introduces a **new** class / method / route / flow:
   - Update the affected UC's CD (`CD-XX-<Name>.puml`).
   - Update the affected UC's SD (`SD-XX-<Name>.puml`).
3. If the implementation **modifies** an existing one, edit in place — do
   not create a new CD or SD.
4. Do **not** combine multiple UCs into one diagram.
5. Apply `checklists/uml-checklist.md` to every changed diagram.
6. Update the UC ↔ Diagram traceability table in `docs/UC/UC-PACKAGE.md`.

**Output**: a "## 5. UML Updated" block listing every puml touched.

**Pass criteria**

- [ ] Every diagram is a 1:1 mapping with a UC.
- [ ] Every class / participant / method in the diagram exists in source.
- [ ] No accidental colours, blue links, or curved edges.
- [ ] Diagram renders in PlantUML CLI / planttext.com without errors.

---

## Phase G — FINAL CONSISTENCY VALIDATION

**What it is**: drift detection + release checklist + Implementation
Summary.

**Inputs**: every prior phase's output.

**Activities**

1. Re-read `rules/10-validation.md`.
2. Walk the 10 source/doc pairs and report drift.
3. Run `checklists/release-checklist.md`.
4. If any FAIL, fix it (or report it in "Remaining Issues").
5. Build the Implementation Summary using
   `templates/implementation-summary.md` (8 sections, all populated).
6. Prepend the response with:
   ```
   Change types: <TYPE …>
   Impact matrix: <15 rows, inline>
   ```

**Output**: a "## 7. Validation" matrix with PASS / FAIL / N/A per row +
the complete Implementation Summary.

**Pass criteria**

- [ ] Every PASS has an evidence (command + output).
- [ ] Every FAIL is either fixed or reported in "## 8. Remaining Issues".
- [ ] The summary contains all 8 sections.
- [ ] No `TBD` / `n/a` placeholder.

---

## Workflow summary table

For quick reference, paste this at the top of the response:

| Phase | Output | Tooling / source |
| ----- | ------ | ---------------- |
| A — Discover | "What I found" + files | `Grep`, `Glob`, `Read` |
| B — Impact | 15-row matrix + TYPE | `rules/11`, `templates/change-classification.md` |
| C — Implement | code diff | existing patterns + `rules/02` |
| D — Test | test command + result | `npm test`, `npm run lint` |
| E — Docs | doc diff | `rules/08`, `rules/12` |
| F — UML | puml diff | `rules/04`, `rules/05`, HARD RULE in `rules/03` |
| G — Validate | checklist + summary | `rules/10`, `checklists/release-checklist.md`, `templates/implementation-summary.md` |

---

## Out of scope

- Setting up CI / CD.
- Provisioning infrastructure (MongoDB Atlas, SMTP).
- Renumbering existing UC IDs (requires explicit user approval).
- Changing PlantUML style without updating `rules/06-plantuml-style.md` and
  `docs/DOC-GUIDE.md` in the same commit.

---

Owner: **Huỳnh Gia Phúc**  
Last updated: 2026-10-02