# AGENTS.md — Rules for any AI agent working in this repo

This project uses the **software-engineering skill** installed at
`.ai/skills/software-engineering/`. The skill is mandatory for every code,
feature, or doc task.

---

## 1. Read the skill FIRST

Before you touch any file:

1. Open `.ai/skills/software-engineering/AI-READING-GUIDE.md` and pick the
   reading map that matches the task type (implement UC, bug fix, audit,
   refactor, etc.).
2. Open `.ai/skills/software-engineering/WORKFLOW.md` (Phase A + B at minimum).
3. Skim `.ai/skills/software-engineering/SKILL.md` §1 (the 7-phase workflow).

---

## 2. Follow 7 phases A → G — no skipping

| Phase | Name | Output |
| ----- | ---- | ------ |
| **A** | Discover | UC id + route + method + service method identified |
| **B** | Change Impact | 15-row matrix (Yes/No + file paths), TYPE A–H |
| **C** | Implement | Backend / Frontend code + tests |
| **D** | Test | Unit + integration tests passing |
| **E** | Documentation | `docs/UC/UC-PACKAGE.md` + rules updated |
| **F** | UML | `CD-XX-*.puml` + `SD-XX-*.puml` per UC (1 UC = 1 CD + 1 SD) |
| **G** | Validate | `check-skill-compliance.js` + `drift-detect.js` PASS |

**Skip phase = defect** (HARD RULE HR-2). If you must skip, report why
in the output.

---

## 3. HARD RULES — never break these

| # | Rule |
|---|------|
| HR-1 | 1 UC = 1 CD + 1 SD (see `rules/03-use-case.md`) |
| HR-2 | Skip phase = defect |
| HR-3 | Never invent class / endpoint / permission / field / method |
| HR-4 | UC = user goal, not button/field |
| HR-5 | Phase G = hard gate (checklist before declaring done) |

---

## 4. Source-of-truth priority (when conflict)

```
1. User requirement (verbatim)        ← HIGHEST
2. Source code (backend/src/**, frontend/src/**)
3. Tests (actual executed output)
4. API implementation (router → controller → service)
5. Model / repository implementation
6. docs/UC/UC-PACKAGE.md
7. docs/plantuml/CD-*.puml
8. docs/plantuml/SD-*.puml
9. README / docs/DOC-GUIDE.md / skill rules
10. AI assumption                    ← LOWEST, always re-check
```

When 1–9 conflict → **STOP and report**. Never pick a winner silently.

---

## 5. Output format — always use the 10-section summary

Use `.ai/skills/software-engineering/templates/implementation-summary.md`
verbatim. Required sections:

```
## 1. Changed
## 2. Files Changed
## 3. Backend Implementation (or "N/A — <reason>")
## 4. Frontend Implementation (or "N/A — <reason>")
## 5. Backend ↔ Frontend Contract (or "N/A — <reason>")
## 6. Documentation Updated
## 7. UML Updated (1 UC = 1 CD + 1 SD)
## 8. Backlog Updated
## 9. Validation (PASS / FAIL / N/A + evidence)
## 10. Remaining Issues
```

If a section is N/A, write `N/A — <reason>`. **Never skip a section.**

---

## 6. Before commit — refuse, still mandatory

These are mechanical gates the skill enforces; respect them even if the
AI is not asked:

- **Commit message** must include a UC reference: `UC-NN` (or one of the
  exempt prefixes: `docs:`, `chore:`, `ci:`, `test:`, `wip:`, `refactor:`).
- **Code change** without matching `docs/UC/`, `docs/plantuml/`, or
  `docs/BACKLOG.md` update → pre-commit BLOCKS.
- Run `node scripts/check-skill-compliance.js` and
  `node scripts/drift-detect.js --all` before declaring done.

---

## 7. When in doubt

> **STOP. Report. Ask the user.**

Do not silently invent architecture. Do not silently pick a winner between
conflicting sources. Do not silently skip a phase.

---

## File map (quick reference)

```
.ai/skills/software-engineering/
├── AI-READING-GUIDE.md       ← start here
├── WORKFLOW.md               ← Phase A + B details
├── SKILL.md                  ← 7-phase overview
├── rules/                    ← 13 rules (read by topic)
│   ├── 01-source-of-truth.md
│   ├── 02-architecture.md
│   ├── 03-use-case.md        ← HR-1: 1 UC = 1 CD + 1 SD
│   ├── ...
│   └── 13-use-case-optimization-and-grouping.md
├── templates/                ← copy/paste templates
│   ├── implementation-summary.md
│   ├── change-classification.md
│   └── ...
├── checklists/               ← Phase G hard gate
├── examples/UC-01..08/       ← 8 worked examples (Staff module)
└── README.md

.cursor/rules/                ← auto-injected by Cursor (Layer 2)
.cursor/hooks/                ← post-edit reminders (Layer 3)
.githooks/                    ← mechanical anti-drift (Layer 4)
.github/workflows/            ← CI gate
scripts/                      ← check-skill-compliance + drift-detect
```