# UML Checklist

Apply to **every** PlantUML file before declaring it done.

## Class Diagram (`CD-XX`)

- [ ] `skinparam linetype ortho` set.
- [ ] `skinparam shadowing false` set.
- [ ] `skinparam classAttributeIconSize 0` set.
- [ ] Title at top matches filename (`CD-XX — <Name>`).
- [ ] Every `class` block has a corresponding file in `src/`.
- [ ] Every method listed exists in the source.
- [ ] Every attribute listed either exists or is intentionally abstracted
      (and noted as such in a comment).
- [ ] Relationships are semantically correct (`-->`, `..>`, `--|>`).
- [ ] No invented classes (`DatabaseManager`, `UserManager`, `BaseRepository`,
      etc.) unless they exist in `src/`.
- [ ] No decorative colours; no shadows; white background.

## Sequence Diagram (`SD-XX`)

- [ ] `skinparam linetype ortho` and `shadowing false` set.
- [ ] Sequence skinparam block from `rules/06-plantuml-style.md` applied.
- [ ] Title at top matches filename (`SD-XX — <Name>`).
- [ ] Every participant exists (source, frontend, external system, actor, or DB).
- [ ] Every important message is a real method call or HTTP request.
- [ ] HTTP messages use `METHOD path` form.
- [ ] Permission middleware participant appears **only** if registered on the route.
- [ ] `alt` / `else` / `end` branches reflect actual control flow.
- [ ] No `opt [...]` square-bracket labels (avoids blue-link rendering).
- [ ] Activation blocks are balanced (`activate` paired with `deactivate`).
- [ ] Step numbers follow logical execution order.
- [ ] Error flows include only the HTTP codes the endpoint actually returns.

## Visual check

- [ ] No overlapping labels.
- [ ] No unreadable font size (use the project defaults).
- [ ] No excessive whitespace.
- [ ] Renders without errors in PlantUML CLI (`plantuml -tpng <file>.puml`).
