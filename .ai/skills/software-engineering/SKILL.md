# Software Engineering Skill — GiaPhuc_MyProject

> Reusable AI Engineering Skill for **Admin Staff Account Management + RBAC +
> Profile Permission**. Teaches any AI agent how to implement, document, test,
> model and track work **without inventing architecture**.

---

## 0. Đọc gì đầu tiên?

Đừng đọc hết file này. Mở **[AI-READING-GUIDE.md](./AI-READING-GUIDE.md)** trước — đó là bản đồ đọc nhanh theo task type. File này chỉ chứa tóm tắt.

## 1. How to use this skill

Khi AI được yêu cầu **implement / modify / analyse / update doc / audit**:

| Bước | Hành động |
| ---- | --------- |
| 1 | Mở `AI-READING-GUIDE.md` → chọn reading map theo task |
| 2 | Đọc `WORKFLOW.md` Phase A (Discover) + Phase B (Impact) |
| 3 | Đọc `rules/01–13` nếu có rule liên quan đến task |
| 4 | Thực thi Phase C–G |
| 5 | Chạy `scripts/check-skill-compliance.js` trước khi commit |

Skill **không thay thế** docs hiện có — nó orchestrate chúng:

| Existing artefact | Role |
| ----------------- | ---- |
| `docs/UC/UC-PACKAGE.md`       | UC definitions (UC-01..UC-08) |
| `docs/tests/UNIT-TEST.md`     | Unit-test cases (UT-01..UT-25) |
| `docs/tests/SYSTEM-TEST.md`   | System-test scenarios (ST-01..ST-24) |
| `docs/plantuml/CD-*.puml`     | Class Diagrams — 1 UC = 1 CD |
| `docs/plantuml/SD-*.puml`     | Sequence Diagrams — 1 UC = 1 SD |
| `docs/BACKLOG.md`             | Status + issues ledger |
| `docs/DOC-GUIDE.md`           | Documentation policy |

## 2. Workflow (7 phase)

| Phase | Output | Tooling |
| ----- | ------ | ------- |
| A — Discover | "What I found" + files | `Grep`, `Glob`, `Read` |
| B — Impact | 15-row matrix + TYPE | `rules/11`, `templates/change-classification.md` |
| C — Implement | code diff | `rules/02-architecture.md` |
| D — Test | test command + result | `npm test`, `npm run lint` |
| E — Docs | doc diff | `rules/08`, `rules/12` |
| F — UML | puml diff | `rules/03`, `rules/04`, `rules/05` |
| G — Validate | PASS/FAIL + Summary | `rules/10`, `checklists/release-checklist.md` |

Chi tiết mỗi phase: `WORKFLOW.md`. Skip = defect.

## 3. Rules (13 files)

| # | File | One-line |
| - | ---- | -------- |
| 01 | `01-source-of-truth.md` | Code wins; report drift, đừng sửa code theo doc cũ |
| 02 | `02-architecture.md` | Router→Middleware→Controller→Service→Repository→Model (default, không phải luật) |
| 03 | `03-use-case.md` | UC theo `UC-PACKAGE.md` template. **HARD RULE: 1 UC = 1 CD + 1 SD** |
| 04 | `04-class-diagram.md` | CD phản ánh class thật, orthogonal edges, B&W |
| 05 | `05-sequence-diagram.md` | SD phản ánh runtime call thật, có middleware categories |
| 06 | `06-plantuml-style.md` | skinparam block dùng chung; không màu |
| 07 | `07-testing.md` | UT/ST phản ánh test đã chạy; PASS chỉ khi có output |
| 08 | `08-documentation.md` | Follow `docs/DOC-GUIDE.md`; AI-specific addendum |
| 09 | `09-backlog.md` | 1 row / task trong BACKLOG; 1 row / issue trong Issues |
| 10 | `10-validation.md` | Drift detection + final consistency check |
| 11 | `11-change-impact-analysis.md` | 15-row matrix trước khi edit; từ chối edit file ngoài matrix |
| 12 | `12-library-framework-changelog.md` | Mỗi dep add/upgrade/remove phải ghi `DEPENDENCIES.md` + `docs/STACK.md` |
| 13 | `13-use-case-optimization-and-grouping.md` | **2 HARD RULES**: UC = user goal (không phải button); đừng over-merge |

## 4. Templates + Checklists + Examples

| | Path | Khi nào |
| - | ---- | ------ |
| Templates | `templates/` | Điền shell trước khi viết UC/CD/SD/UT/ST |
| Checklists | `checklists/` | Trước commit / trước declare milestone |
| Examples | `examples/` | 8 UC, mỗi UC có `README.md` + `notes.md` |

## 5. Source-of-truth priority

```
1. User requirement (verbatim)
2. Source code ← HIGHEST
3. Tests
4. API impl (router → controller → service)
5. Model / repository
6. docs/UC/UC-PACKAGE.md
7. docs/plantuml/CD-*.puml
8. docs/plantuml/SD-*.puml
9. README / docs/DOC-GUIDE.md
10. AI assumptions ← luôn re-check
```

**Stop and report** khi 1–9 xung đột. Không tự ý pick winner.

## 6. Completion gate

Task **CHƯA complete** cho đến khi mọi box trong `checklists/release-checklist.md` đã check. Phase G = hard gate.

## 7. HARD RULES

| # | Rule | Reference |
| - | ---- | --------- |
| HR-1 | 1 UC = 1 CD + 1 SD | `rules/03-use-case.md` |
| HR-2 | Skip Phase = defect | `WORKFLOW.md` |
| HR-3 | Không bịa class/endpoint/permission | `rules/01-source-of-truth.md` |
| HR-4 | UC = user goal (không phải button/field) | `rules/13-use-case-optimization-and-grouping.md` |
| HR-5 | Phase G = hard gate | `checklists/release-checklist.md` |

## 8. Out of scope

- Infrastructure provisioning (MongoDB, SMTP)
- CI/CD pipeline
- Production hardening (rate limit, httpOnly) — track ở `docs/BACKLOG.md`
- Đổi số UC id cũ
- Đổi PlantUML style mà không update `rules/06` + `DOC-GUIDE.md` cùng commit

---

Owner: **Huỳnh Gia Phúc**  
Last updated: 2026-10-02