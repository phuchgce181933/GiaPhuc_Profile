# Rule 03 — Use Case

UCs follow the **exact** field table used in `docs/UC/UC-PACKAGE.md`:

| Field | Value |
| ----- | ----- |
| UC Name | … |
| UC ID | UC-XX |
| Feature | … |
| Actor | … |
| Description | … |
| Precondition | … |
| Main Flow | numbered steps |
| Alternative Flow | … |
| Exception Flow | … |
| Postcondition | … |

Additional columns the existing package uses (keep them):

- Related API
- Permission
- Related classes
- Related tests
- Class Diagram reference (`CD-XX`)
- Sequence Diagram reference (`SD-XX`)

## Numbering

- UC IDs are **stable**. Never silently renumber.
- The current package contains **UC-01 .. UC-08** for Staff Management. See
  `examples/README.md` for the discrepancy with the informal "UC-01 Login"
  list in the task brief that produced this skill.
- If a feature is genuinely new, propose the next free number (UC-09) and
  **justify** it.

## Templates

Use `templates/use-case-template.md` as a shell, then mirror it into
`docs/UC/UC-PACKAGE.md` — do not create a separate `UC-XX.md` file.

## Anti-patterns

- A UC without Actor or Precondition.
- A UC whose Main Flow includes a class / method that does not exist.
- A UC duplicating another (use "Related UC" instead).
- A UC that documents *intended* behaviour not yet implemented (must be marked
  as such in BACKLOG).

---

## HARD RULE — ONE UC = ONE CLASS DIAGRAM + ONE SEQUENCE DIAGRAM

MỖI USE CASE PHẢI CÓ UML RIÊNG.

Quy tắc bắt buộc:

ONE UC
    ↓
ONE CLASS DIAGRAM
    +
ONE SEQUENCE DIAGRAM

Không được gom nhiều Use Case vào cùng một Class Diagram hoặc
cùng một Sequence Diagram.

Ví dụ:

UC-01 Create Staff
→ CD-01-Create-Staff.puml
→ SD-01-Create-Staff.puml

UC-02 View Staff Profile
→ CD-02-View-Staff-Profile.puml
→ SD-02-View-Staff-Profile.puml

UC-03 Update Staff Profile
→ CD-03-Update-Staff.puml
→ SD-03-Update-Staff.puml

UC-04 Assign Role
→ CD-04-Assign-Role.puml
→ SD-04-Assign-Role.puml

UC-05 Activate/Deactivate Staff
→ CD-05-Activate-Deactivate.puml
→ SD-05-Activate-Deactivate.puml

### Why this is a hard rule

- A CD/SD that mixes several UCs becomes a *module overview*, not a UC model.
  It hides which classes / participants actually participate in each UC.
- Traceability from UC to diagram is broken when one diagram covers many UCs.
- Code review and drift detection (rule 10) cannot answer "does this UC still
  match its diagram?" if the diagram shows three UCs at once.

### Naming rule

- `CD-XX-<Name>.puml` and `SD-XX-<Name>.puml` where `XX` matches the UC id.
- One filename = one UC. The traceability table in `docs/UC/UC-PACKAGE.md`
  (`UC ↔ Diagram Traceability`) becomes a 1:1 mapping, not M:N.

### Allowed exceptions (rare, must be justified)

- A truly trivial UC (e.g. a single GET that returns a static enum) can
  reference an existing CD/SD of a related UC — but this must be explicitly
  stated in the UC body ("Diagram: reuse CD-04 / SD-04") and the BACKLOG
  must record the justification.
- A new UC that is a strict subset of an existing UC (e.g. "View own profile"
  as subset of "View any profile") can be modelled by an `extend` arrow on
  the existing SD rather than a new diagram — still record this in the UC
  body.

### Cross-references

- See also `rules/04-class-diagram.md` for class-level inclusion rules.
- See also `rules/05-sequence-diagram.md` for participant-level inclusion
  rules. Both must be applied **per UC** under this hard rule.
- **See also `rules/13-use-case-optimization-and-grouping.md`** — applies
  *before* this rule. Rule 13 decides whether the change warrants a new UC
  at all; this rule decides how to model that UC in UML once it exists.
