# Rule 13 — Use Case Optimization & Feature Grouping

> Two complementary HARD RULES that govern **when to create a new UC** and
> **when to keep UC separate**. The first prevents UC proliferation; the
> second prevents over-merging. Both must be applied **before** writing a
> new UC body, before generating its CD / SD (per rule 03), and before
> adding rows to `docs/UC/UC-PACKAGE.md`.

**Where this fits in the workflow:**

```
Phase A — Discover
Phase B — Change Impact Analysis
        └─► BEFORE creating a new UC, apply rule 13
        │     1. Is this a new user goal?        (section 3)
        │     2. Or a variation of an existing UC? (sections 1, 4, 12)
        │     3. If creating, am I about to over-merge? (counter-rule)
        └─► Only then: assign UC id, write UC body, generate CD + SD (rule 03)
Phase C — Implement
...
```

---

## HARD RULE — USE CASE OPTIMIZATION & FEATURE GROUPING

AI MUST NOT create a new Use Case for every new button, field, action,
endpoint, UI control, or small feature request.

Use Case represents a meaningful **USER GOAL / BUSINESS CAPABILITY**.

Use Case does **NOT** represent:

- a button
- a form field
- a modal
- a tab
- a dropdown
- a checkbox
- a table action
- a UI component
- a single API endpoint
- a single database operation
- a minor state change

Before creating a new UC, AI MUST determine whether the requested change
belongs to an existing UC.

### 1. CRUD GROUPING RULE

If a feature group already has matching CRUD:

```
Create
Read
Update
Delete
```

then **variations of the same operation do NOT automatically become new
Usecase**.

Examples:

Existing:

```
UC-01 Staff Management
```

or:

```
UC-01 Create Staff
UC-02 View Staff
UC-03 Update Staff
UC-04 Delete Staff
```

If the user requests:

- Edit staff information
- Edit phone
- Edit address
- Edit email
- Edit status
- Activate staff
- Deactivate staff
- Change staff information

AI must check first:

> "Is this a variation of UPDATE?"

If **YES**:

- **DO NOT** create a new UC.
- **INSTEAD**: update the existing UC.

Example:

```
UC-03 Update Staff Profile
```

may include:

- update fullName
- update phone
- update address
- update email
- activate / deactivate
- update other editable staff attributes

if they share the same business goal.

### 2. USER GOAL RULE

A UC should represent a **meaningful USER GOAL**.

Example: "Admin manages staff information" may include:

- view list
- open profile
- edit information
- change status
- update role

but the split must be justified by the **actual business goal**, not by
the number of endpoints.

```
Endpoint   ≠ Use Case
Button     ≠ Use Case
Service method    ≠ Use Case
Repository method ≠ Use Case
```

### 3. WHEN TO CREATE A NEW UC

Only create a new UC when **at least one** of the following holds:

1. There is a clearly different USER GOAL.
2. There is an independent BUSINESS CAPABILITY.
3. The actor pursues a meaningfully different business objective.
4. The flow has significantly different precondition / authorization /
   business rule.
5. The lifecycle or transaction is meaningfully different.
6. The requirement explicitly defines it as an independent business
   function.
7. The existing UC has grown so large that keeping it together hurts
   readability or maintainability.

If none of the above:

```
DO NOT CREATE A NEW UC.
```

### 4. WHEN NOT TO CREATE A NEW UC

DO **NOT** create a new UC if the request is only:

- add a button
- add a field
- add a column
- add a filter
- add a sort
- add a search
- add a pagination
- add a dropdown
- add a checkbox
- add a modal
- add a confirm dialog
- add a validation
- add a status toggle
- add an activate / deactivate
- add an edit field
- add an API endpoint serving an existing UC
- add a repository method
- add a service method
- add a permission variation
- change the UI layout
- change how data is displayed

All of the above are:

```
MODIFICATION OF EXISTING UC
```

unless business analysis proves it is genuinely a new user goal.

### 5. EXAMPLE — EDIT STATUS

Existing:

```
UC-03 Update Staff
```

User request: *"Thêm chức năng Edit Status cho Staff."*

AI MUST **NOT** immediately create:

```
UC-06 Edit Staff Status
```

Instead, analyse:

```
Existing UC: UC-03 Update Staff
New requirement: update staff.isActive
Question:
  "Is changing status an independent business goal
   or just a kind of UPDATE for Staff?"
```

If it is just an UPDATE:

```
KEEP: UC-03 Update Staff
UPDATE:
  - UC description
  - Main flow
  - Alternative flow if needed
  - Class Diagram
  - Sequence Diagram
  - Unit Test
  - System Test
  - Backlog
DO NOT create a new UC.
```

### 6. UI / UX OPTIMIZATION RULE

AI MUST optimize the UI around **user goals**, not around backend
endpoints.

Do **NOT** design:

```
1 API → 1 screen
1 endpoint → 1 UC → 1 page
```

Example — Staff Management UI may have:

```
Staff List
  ├── Search
  ├── Filter
  ├── View
  ├── Edit
  ├── Change Status
  └── Assign Role
```

All of the above can belong to a single Staff Management experience.

UI must be organized by **USER TASK / USER GOAL**.

Do not split the UI into many screens just because the backend exposes
many endpoints.

### 7. CRUD UI GROUPING

For a CRUD entity, prefer this layout:

```
Staff Management
  │
  ├── List
  │    ├── Search
  │    ├── Filter
  │    └── Pagination
  │
  ├── View
  │
  ├── Create
  │
  └── Edit
       ├── Information
       ├── Role
       └── Status
```

instead of:

```
Create Staff Page
View Staff Page
Edit Staff Page
Edit Status Page
Edit Role Page
...
```

if the business requirement does not require independent flows.

### 8. ACTION CONSOLIDATION

If many actions act on the same entity and serve the same business goal,
AI MUST consider grouping them into one UC.

Example:

```
Edit Staff
  - update name
  - update phone
  - update address
  - update email
  - activate
  - deactivate
```

may all live in `UC-03 Update Staff`.

If role assignment has its own business rule and authorization:

```
UC-04 Assign Role    ← own UC is justified
```

If notification only happens as a side effect:

```
do NOT necessarily create a separate UC.
```

Example:

```
Update Staff
  → Save Staff
  → Send Notification
```

Notification can be **internal behavior / side effect** of `UC-03`.

### 9. SIDE EFFECT ≠ USE CASE

DO **NOT** create a new UC just because the system performs an extra
side effect.

Example:

```
Create Staff
  → save database
  → hash password
  → assign role
  → send email
```

does **NOT** mean you must create:

```
UC-01 Create Staff
UC-02 Hash Password
UC-03 Assign Role
UC-04 Send Email
```

If all four are steps of the same user goal, keep them in `UC-01 Create
Staff`.

### 10. ENDPOINT ≠ USE CASE

A UC may use:

- one endpoint
- several endpoints
- one endpoint with many operations / branches

DO **NOT** conclude:

```
N endpoints = N Use Cases
```

Example:

```
PATCH /api/staff/:id
PATCH /api/staff/:id/status
PATCH /api/staff/:id/role
```

may all belong to the same Staff Management / Update Staff capability
if the business semantics allow it.

Analyse the **business goal** before creating a UC.

### 11. UC SPLITTING THRESHOLD

AI should only split a UC into several UCs when keeping it together
causes one of the following:

- The flow becomes too long and hard to read.
- Actors are meaningfully different.
- Authorization is meaningfully different.
- Business rules are meaningfully different.
- Preconditions are meaningfully different.
- Transaction / lifecycle is different.
- The user goal is different.
- The test scope becomes too large.
- The UI workflow is genuinely independent.
- The requirement explicitly calls for an independent capability.

If only a few fields or actions differ:

```
KEEP SAME UC.
```

### 12. UC NORMALIZATION CHECK (mandatory before creating a new UC)

Before creating a new UC, AI MUST run this checklist:

```
[ ] Is this a new user goal?
[ ] Is this a new business capability?
[ ] Is the actor different?
[ ] Is the authorization meaningfully different?
[ ] Are the preconditions meaningfully different?
[ ] Are the business rules meaningfully different?
[ ] Is the lifecycle different?
[ ] Is the transaction different?
[ ] Is the UI workflow genuinely independent?
[ ] Can an existing UC contain this requirement clearly?
```

If the answer to the last question is:

> "Existing UC can contain this requirement"

then:

```
DO NOT CREATE NEW UC.
```

If, after answering all questions, the AI still cannot decide, the
default is:

```
DO NOT CREATE NEW UC.  ← errs on the side of fewer UCs.
```

This default is the **counter-balance** to the next HARD RULE — see
"Do Not Over-Merge" below.

### 13. EXISTING UC UPDATE PROCEDURE

If the requirement belongs to an existing UC:

- **DO NOT** create a new UC.
- MUST update, in the same change set:
  1. The existing UC body.
  2. The existing Class Diagram (per rule 03 — 1 UC = 1 CD).
  3. The existing Sequence Diagram (per rule 03 — 1 UC = 1 SD).
  4. Unit Test documentation.
  5. System Test documentation.
  6. BACKLOG row.
  7. README if API / behaviour changed.
  8. UI documentation / design if any.

Still kept:

```
ONE UC → ONE CD → ONE SD
```

The HARD RULE in `rules/03-use-case.md` continues to apply.

### 14. UI CHANGE IMPACT

Every UI change must be classified as one of:

| Class | Meaning | Create new UC? |
| ----- | ------- | -------------- |
| **A** | Cosmetic (colour, spacing, font) | No |
| **B** | Usability improvement (better label, clearer layout) | No |
| **C** | Existing UC enhancement (new field on existing edit form) | No |
| **D** | New business capability (e.g. "Audit Staff Changes") | **Maybe** — only after business goal is confirmed |

Examples:

| Request | Classification | Decision |
| ------- | -------------- | -------- |
| "Add search Staff" | C | Fold into existing Staff Management UC |
| "Add filter status" | C | Fold into existing Staff Management UC |
| "Add Edit Status" | C | Fold into existing Update Staff UC |
| "Add Audit Staff Changes" | D (potentially) | Confirm business goal; may warrant a new UC |

### 15. AI MUST CHALLENGE UC PROLIFERATION

AI must actively detect UC proliferation. If a project has:

```
UC-01 Create Staff
UC-02 Edit Staff Name
UC-03 Edit Staff Phone
UC-04 Edit Staff Address
UC-05 Edit Staff Email
UC-06 Edit Staff Status
UC-07 Edit Staff Role
```

AI MUST audit and propose normalization.

DO **NOT** default-accept UC proliferation.

The goal is:

```
FEWER, CLEARER, MEANINGFUL USE CASES.
```

NOT:

```
MORE USE CASES = BETTER DOCUMENTATION.
```

### 16. UC DESIGN PRINCIPLE

Use Case must be designed by:

```
USER GOAL
```

NOT by:

```
DATABASE OPERATION
API ENDPOINT
BUTTON
SERVICE METHOD
REPOSITORY METHOD
```

Priority order (highest first):

```
User Goal
   ↓
Business Capability
   ↓
Use Case
   ↓
UI Flow
   ↓
API
   ↓
Application Code
   ↓
Database
```

DO **NOT** invert this logic just because the source code has many
endpoints / methods.

### 17. FINAL RULE

Before creating any new UC, ask:

> "Is this really a new user goal,
> or is it just another operation of an existing user goal?"

If it is **another operation**:

```
UPDATE EXISTING UC.
```

If it is a **new user goal**:

```
CREATE NEW UC.
```

Never create a UC simply because the developer added a new button,
endpoint, method, field, or CRUD variation.

---

## HARD RULE — DO NOT OVER-MERGE USE CASES

> Counter-rule to the previous one. The goal is **not** "as few UCs as
> possible". The goal is **"each UC has the right business scope"**.

DO **NOT** merge every function of an entity into a single UC just
because they live in the same module.

Example:

```
Staff Management
  ├── Create Staff
  ├── Update Staff
  ├── Assign Role
  ├── View Profile
  └── Activate / Deactivate
```

does **NOT** necessarily become:

```
UC-01 Staff Management
```

If the functions have:

- different user goals
- different business rules
- different permissions
- different flows
- different transactions

then keep them as **separate UCs**.

The goal is **NOT**:

```
"as few UCs as possible."
```

The goal **IS**:

```
"each UC has the right business scope."
```

Therefore:

```
DO NOT OVER-SPLIT.    ← rules 13.1 – 13.17 above
DO NOT OVER-MERGE.    ← this section
```

Choose the **smallest meaningful business boundary**.

### 13.X — Decision rule when in doubt

When the two HARD RULES conflict, apply this tie-breaker:

1. Can the new requirement be **clearly** described as a step of an
   existing UC? → Fold it in. (rules 13.1–13.12)
2. If a dedicated stakeholder / product owner would name it as a
   separate feature, with its own success criteria? → New UC.
3. If still ambiguous → **default to fewer UCs** (fold in), but flag
   the decision in the response and in `docs/BACKLOG.md` Project Issues
   so it can be revisited.

### Anti-patterns revisited

| Anti-pattern | Detected by |
| ------------ | ----------- |
| One UC per CRUD variation | rule 13.1, 13.5 |
| One UC per endpoint | rule 13.10, 13.16 |
| One UC per button / modal | rule 13.4, 13.6 |
| One mega-UC for the whole module | this section (DO NOT OVER-MERGE) |
| Side effect promoted to UC | rule 13.9 |
| Service method promoted to UC | rule 13.2, 13.16 |

### Cross-references

- `rules/03-use-case.md` — HARD RULE "one UC = one CD + one SD". Once
  rule 13 says "this IS a new UC", rule 03 says "give it exactly one CD
  and one SD".
- `rules/04-class-diagram.md`, `rules/05-sequence-diagram.md` — diagram
  inclusion rules applied per UC.
- `WORKFLOW.md` Phase B — apply rule 13 BEFORE assigning a new UC id.
- `templates/change-classification.md` — TYPE C / D / F frequently
  trigger the question "is this a new UC?"; the answer must reference
  rule 13.
- `templates/use-case-template.md` — used once rule 13 has approved the
  new UC.