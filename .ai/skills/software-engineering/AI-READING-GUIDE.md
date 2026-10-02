# AI Reading Guide — Software Engineering Skill

> **BẮT BUỘC ĐỌC TRƯỚC KHI CODE.** File này là bản đồ đọc nhanh cho mọi AI
> agent. Đừng đọc hết mọi thứ — đọc ĐÚNG thứ bạn cần.

---

## 1. 5-Second Orientation

Đây là bộ skill **Software Engineering**. Tất cả rules, templates, examples nằm trong thư mục `.ai/skills/software-engineering/`. Bộ skill này đi kèm ví dụ minh họa ở `examples/UC-01..08/` (domain Staff/RBAC), nhưng **bạn có thể đang làm dự án khác** — chỉ cần thay thế example UC bằng UC của dự án thật, các rule/template còn lại giữ nguyên.

```
.ai/skills/software-engineering/
  SKILL.md              ← file chính, đọc trước
  WORKFLOW.md           ← 7 phase (A–G)
  rules/01–13           ← 13 rule ngắn, load khi cần
  examples/UC-01..08/  ← 8 UC VÍ DỤ (Staff/RBAC) — có thể không liên quan dự án bạn
  checklists/          ← 4 checklist
  templates/           ← 9 template
```

## 2. Reading Map by Task Type

### Task: Hiểu một UC cụ thể (Understand one UC)

Đọc **theo thứ tự này**:

```
1. examples/UC-XX/README.md        ← developer-facing doc, tự chứa
2. docs/plantuml/SD-XX-*.puml     ← sequence diagram
3. docs/plantuml/CD-XX-*.puml     ← class diagram
4. examples/UC-XX/notes.md        ← change-impact + drift
```

**Skip**: các file khác trong skill.

---

### Task: Sửa code / thêm feature (Modify code)

Đọc **theo thứ tự này**:

```
1. AI-READING-GUIDE.md (this file) ← bạn đang ở đây
2. SKILL.md §1                     ← workflow A–G
3. WORKFLOW.md Phase A–B            ← discover + impact analysis
4. examples/UC-XX/README.md         ← UC liên quan
5. rules/02-architecture.md         ← layered pattern
6. rules/03-use-case.md             ← HARD RULE: 1 UC = 1 CD + 1 SD
7. Phase C → G                     ← implement, test, docs, UML, validate
```

**Skip**: các example UC khác, checklists (trừ khi cần reference).

---

### Task: Audit consistency / kiểm tra drift

Đọc **theo thứ tự này**:

```
1. SKILL.md §6                    ← source-of-truth priority
2. rules/01-source-of-truth.md    ← khi xung đột
3. rules/10-validation.md         ← drift detection
4. examples/UC-XX/notes.md        ← UC cần audit
5. checklists/release-checklist.md ← full gate
```

**Skip**: Phase C (implement), Phase D (test), templates.

---

### Task: Thêm UC mới (Add new UC)

Đọc **theo thứ tự này**:

```
1. SKILL.md §1                     ← workflow
2. WORKFLOW.md Phase A–B           ← discover + impact
3. rules/13-use-case-optimization-and-grouping.md  ← HARD RULES chống UC proliferation
4. examples/UC-01/README.md        ← canonical example
5. templates/use-case-template.md  ← template UC
6. rules/03-use-case.md            ← 1 UC = 1 CD + 1 SD
7. Phase C → G
```

**Skip**: các UC example khác.

---

### Task: Cập nhật PlantUML (Update PlantUML)

Đọc **theo thứ tự này**:

```
1. rules/03-use-case.md            ← HARD RULE
2. rules/06-plantuml-style.md     ← style guide
3. templates/class-diagram-template.puml
4. templates/sequence-diagram-template.puml
5. examples/UC-XX/README.md §12    ← CD + SD reference
6. checklists/uml-checklist.md    ← trước commit
```

**Skip**: Phase A–D, Phase E (docs), Phase G (trừ §F).

---

## 3. What to SKIP by Task Type

| Task | Skip |
| ---- | ---- |
| Understand UC | SKILL.md §0, §3–8; WORKFLOW Phase C–G; templates; checklists |
| Modify code | SKILL.md §3–8; examples UC khác; templates (trừ implementation-summary) |
| Audit | Phase C, D; SKILL.md §3; templates |
| Add new UC | SKILL.md §3; examples UC khác; checklists (trừ khi cần) |
| Update PlantUML | Phase A–D; Phase E; examples README |

## 4. Dependency Map

```
docs/UC/UC-PACKAGE.md
    ↑ reference
    ├── docs/plantuml/CD-01..08-*.puml
    │       1:1 (HARD RULE)
    ├── docs/plantuml/SD-01..08-*.puml
    │       1:1 (HARD RULE)
    ├── docs/tests/UNIT-TEST.md
    │       UC ↔ UT mapping
    ├── docs/tests/SYSTEM-TEST.md
    │       UC ↔ ST mapping
    └── docs/BACKLOG.md

backend/src/modules/**/
    ├── backend/src/models/**
    ├── backend/src/middlewares/**
    └── backend/src/config/**

frontend/src/pages/**/
    ├── frontend/src/api/**
    └── frontend/src/contexts/**

Skill orchestration:
SKILL.md → WORKFLOW.md (Phase A–G)
         → rules/01–13
         → examples/UC-01..08/
         → checklists/
         → templates/
```

## 5. Cheat Sheet — 3-line tokens

```
Hiểu UC:     examples/UC-XX/README.md + SD + CD
Sửa feature: SKILL.md + Phase A–B + UC README + rule 02 + rule 03
Audit drift:  rule 01 + rule 10 + release-checklist
Thêm UC mới: rule 13 → template → rule 03
PlantUML:     rule 03 + rule 06 + uml-checklist
Test:         rules/07 + npm test
```

## 6. Source-of-truth Priority (khi xung đột)

```
1. User requirement (explicit, verbatim)
2. Source code (backend/src/**, frontend/src/**)   ← HIGHEST
3. Tests (backend/tests/**)
4. API implementation (router → controller → service)
5. Model / repository implementation
6. docs/UC/UC-PACKAGE.md
7. docs/plantuml/CD-*.puml
8. docs/plantuml/SD-*.puml
9. README / docs/DOC-GUIDE.md
10. AI assumptions ← ALWAYS RECHECK
```

**Stop and report** khi 1–9 không khớp nhau. Không tự ý pick winner.

## 7. HARD RULES (không được phá vỡ)

| # | Rule | File |
| - | ---- | ---- |
| HR-1 | 1 UC = 1 CD + 1 SD | `rules/03-use-case.md` |
| HR-2 | Skip Phase = defect | `WORKFLOW.md` |
| HR-3 | Never invent class/endpoint/permission | `rules/01-source-of-truth.md` |
| HR-4 | UC = user goal, không phải button | `rules/13-use-case-optimization-and-grouping.md` |
| HR-5 | PHASE G = hard gate, không skip | `checklists/release-checklist.md` |

---

Owner: **Huỳnh Gia Phúc**  
Last updated: 2026-10-02
