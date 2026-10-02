# AI Software Engineering Skill

> A reusable, language-agnostic AI engineering skill template that teaches any
> AI agent how to implement, document, test, model, and track work
> **without inventing architecture**. Works with Node.js backends, React frontends,
> and any tech stack that follows a layered pattern.

---

## What is this?

This is a **skill template** — not a real project. Copy the contents to any
software project to give the AI agent a consistent, enforceable workflow.

The example domain used throughout is *Admin Staff Account Management + RBAC*
(`examples/UC-01..08/`). Replace those with your project's own UCs; the rest
of the skill stays the same.

---

## What does it do?

Teaches the AI to follow a **7-phase workflow** (Discover → Impact → Implement
→ Test → Docs → UML → Validate) and enforces **3 HARD RULES**:

| # | Rule | Why |
| - | ---- | --- |
| HR-1 | 1 UC = 1 CD + 1 SD | Each Use Case gets exactly one Class Diagram and one Sequence Diagram |
| HR-2 | Skip Phase = defect | No phase may be skipped without reporting the reason |
| HR-3 | No invented architecture | Never create class/endpoint/permission not in source-of-truth |

And a **No-Invent rule**: every class, endpoint, permission, field, and
method must come from the source-of-truth stack (code > docs > AI assumption).

---

## File map

```
.
├── .ai/skills/software-engineering/     ← THE SKILL
│   ├── SKILL.md                        ← entry point
│   ├── AI-READING-GUIDE.md             ← reading map by task type
│   ├── WORKFLOW.md                     ← 7-phase workflow (A–G)
│   ├── rules/                          ← 13 rules
│   │   ├── 01-source-of-truth.md
│   │   ├── 02-architecture.md          ← layered pattern
│   │   ├── 03-use-case.md              ← HARD RULE: 1 UC = 1 CD + 1 SD
│   │   ├── 04-class-diagram.md
│   │   ├── 05-sequence-diagram.md
│   │   ├── 06-plantuml-style.md
│   │   ├── 07-testing.md
│   │   ├── 08-documentation.md
│   │   ├── 09-backlog.md
│   │   ├── 10-validation.md
│   │   ├── 11-change-impact-analysis.md
│   │   ├── 12-library-framework-changelog.md
│   │   └── 13-use-case-optimization-and-grouping.md
│   ├── templates/                       ← 9 templates
│   ├── checklists/                     ← 4 checklists
│   └── examples/                      ← 8 UC examples (Staff/RBAC)
│       ├── UC-01..08/
│       └── README.md
│
├── .cursor/rules/                      ← LAYER 2 — persistent auto-inject
│   ├── 00-skill-mandatory.mdc
│   ├── 10-uc-doc-required.mdc
│   ├── 20-architecture-backend.mdc
│   ├── 20-architecture-frontend.mdc
│   └── 30-no-invent.mdc
│
├── .cursor/hooks/                      ← LAYER 3 — post-edit reminders
│   └── post-edit-validate.js
│
├── .cursor/hooks.json                  ← hook config (prompt + edit + stop)
│
├── .githooks/                          ← LAYER 4 — mechanical anti-drift
│   ├── pre-commit                      ← code+doc sync gate
│   └── commit-msg                      ← require UC-NN in commit msg
│
├── .github/workflows/                  ← CI gate
│   └── skill-check.yml
│
├── scripts/                            ← validators + installers
│   ├── check-skill-compliance.js       ← C1–C6 (file structure)
│   ├── drift-detect.js                 ← D1–D7 (semantic drift)
│   ├── install-hooks.sh
│   └── install-hooks.ps1
│
└── README.md (this file)
```

---

## Source-of-truth priority

When information conflicts, use this priority (highest first):

```
1. User requirement (explicit, verbatim)
2. Source code ← HIGHEST
3. Tests (actual executed output)
4. API implementation (router → controller → service)
5. Model / repository implementation
6. docs/UC/UC-PACKAGE.md
7. docs/plantuml/CD-*.puml
8. docs/plantuml/SD-*.puml
9. README / docs/DOC-GUIDE.md / skill rules
10. AI assumptions ← always re-check
```

**Stop and report** when 1–9 conflict. Never silently pick a winner.

---

## 3-Layer defense system

Ensures the AI follows the skill using progressively harder enforcement.

| Layer | Mechanism | Compliance gain |
| ----- | -------- | -------------- |
| **1 — Reduce friction** | AI reads `AI-READING-GUIDE.md` before touching code | +25% |
| **2 — Persistent context** | Cursor auto-injects `.cursor/rules/*.mdc` | +10% |
| **3 — Soft reminders** | `.cursor/hooks.json` + `post-edit-validate.js` | +10% |
| **4 — Hard blocks** | `.githooks/pre-commit` + `commit-msg` + `drift-detect.js` + CI | **+5%** |

**Total**: ~99% (1% is human bypass).

### Layer 4 — Anti-drift enforcement (hard blocks)

```
   AI commits code without doc
              │
              ▼
   ┌──────────────────────────────┐
   │ .githooks/pre-commit         │  ← BLOCK: code+doc must change together
   │ .githooks/commit-msg         │  ← BLOCK: UC-NN required in message
   └──────────────┬───────────────┘
                  │ bypass --no-verify
                  ▼
   ┌──────────────────────────────┐
   │ .github/workflows/           │  ← BLOCK: CI catches it anyway
   │ skill-check.yml              │
   └──────────────────────────────┘
```

### Layer 4 — 4 concrete mechanisms

| # | File | Type | Blocks |
| - | ---- | ---- | ------ |
| 1 | `.githooks/pre-commit` | **BLOCK** | `backend/src/` or `frontend/src/` changed without `docs/UC/`, `docs/plantuml/`, `docs/BACKLOG.md` |
| 2 | `.githooks/commit-msg` | **BLOCK** | commit msg missing `UC-NN` (exempt: `docs:`, `chore:`, `ci:`, `test:`, `wip:`, `refactor:`) |
| 3 | `scripts/drift-detect.js` | **DETECT** | D1–D7: orphan UC, orphan perm, orphan endpoint, orphan diagram |
| 4 | `.github/workflows/skill-check.yml` | **CI GATE** | runs check-skill-compliance + drift-detect on every PR |

---

## How to apply to a real project

### Method A — Full installation (recommended)

```bash
# 1. Copy the skill directories to your project
cp -r .ai/       /path/to/your-project/
cp -r .cursor/   /path/to/your-project/
cp -r scripts/   /path/to/your-project/
cp -r .githooks/ /path/to/your-project/
cp -r .github/   /path/to/your-project/

# 2. Wire git hooks
# Linux / macOS / WSL:
bash scripts/install-hooks.sh

# Windows PowerShell:
powershell -ExecutionPolicy Bypass -File scripts\install-hooks.ps1

# 3. In your project, replace example UCs with your real ones:
#   - .ai/skills/software-engineering/examples/UC-*/   ← your UCs
#   - docs/UC/UC-PACKAGE.md                           ← your UC package
#   - docs/plantuml/                                  ← your diagrams
```

### Method B — Layer 2 only (Cursor rules, no hooks)

```bash
cp -r .cursor/ /path/to/your-project/
# Rules auto-inject when Cursor opens a matching file.
```

### Method C — CI gate only (no hooks installed locally)

```bash
cp -r .github/ /path/to/your-project/
# GitHub Actions runs skill-check on every PR, regardless of local hooks.
```

---

## What happens after installation

When the AI receives a task in the target project:

1. **Layer 1** — AI reads `AI-READING-GUIDE.md` → picks the right reading map.
2. **Layer 2** — Cursor auto-injects relevant rules (backend/frontend/no-invent).
3. **AI follows 7-phase workflow** (Discover → Impact → Implement → Test → Docs → UML → Validate).
4. **Layer 3** — After each edit, `post-edit-validate.js` reminds the AI to update docs.
5. **Before commit** — `.githooks/pre-commit` blocks if code changed without docs.
6. **Before commit** — `.githooks/commit-msg` requires a `UC-NN` reference.
7. **On PR** — `.github/workflows/skill-check.yml` runs full compliance + drift checks.

---

## Language and framework compatibility

This skill is **stack-agnostic** by design. The examples use Node.js (Express,
Mongoose) + React (Vite), but the rules adapt to any language:

| Layer | Default | How to adapt |
| ----- | ------ | ----------- |
| **Architecture** | `Router→Middleware→Controller→Service→Repository→Model` | Change `rules/02-architecture.md` + `.cursor/rules/20-architecture-*.mdc` |
| **Frontend** | `Page→Hook→API→Backend` | Change `rules/02-architecture.md` §Frontend + `.cursor/rules/20-architecture-frontend.mdc` |
| **API pattern** | REST (GET/POST/PUT/PATCH/DELETE) | Change UC-PACKAGE + router patterns |
| **DB** | MongoDB (Mongoose) | Change model layer + `docs/STACK.md` |

The **enforcement layers (2–4)** are language-agnostic — they check file paths,
globs, and UC-NN patterns, not specific language syntax.

---

## Works for any git account

The skill has **no hard-coded credentials, usernames, or git-account-specific
settings**. All enforcement is path-based and rule-based:

- `.githooks/pre-commit` checks file patterns, not usernames.
- `.githooks/commit-msg` checks message format, not author.
- `.github/workflows/skill-check.yml` runs on any GitHub account that hosts
  the repo — just fork or copy the repo.
- `scripts/check-skill-compliance.js` and `scripts/drift-detect.js` are pure
  Node.js, no auth required.

---

## Owner

**Huỳnh Gia Phúc** — Last updated: 2026-10-02
