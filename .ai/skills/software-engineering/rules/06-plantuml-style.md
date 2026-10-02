# Rule 06 — PlantUML Style

All diagrams in this project use a **strict black-and-white visual language**.
Decorative colours, shadows and curved edges are forbidden.

## Standard skinparam block

```plantuml
!pragma useStickyOnly true
skinparam classAttributeIconSize 0
skinparam shadowing false
skinparam padding 3
skinparam nodesep 60
skinparam ranksep 50
skinparam linetype ortho
```

For sequence diagrams, add:

```plantuml
skinparam sequence {
    ActorFontSize 18
    ParticipantFontSize 17
    MessageFontSize 15
    LifeLineStrategy nosolid
    LifeLineBorderColor #000000
    LifeLineBackgroundColor #FFFFFF
    ArrowColor #000000
    ActorBorderColor #000000
    ParticipantBorderColor #000000
    GroupBackgroundColor #FFFFFF
    GroupBorderColor #000000
}
```

## Accidental-blue-link trap

PlantUML renders labels inside `opt [...]`, `note over X : ... [link]`, etc.
as blue hyperlinks. Avoid:

```plantuml
opt [Invalid credentials]   ' BAD — renders blue
```

Prefer:

```plantuml
opt Invalid credentials     ' GOOD — plain text
```

or:

```plantuml
group Invalid credentials
  ...
end
```

## Pre-render checklist

For every generated diagram, run mentally:

- [ ] White background, black borders, black arrows.
- [ ] No coloured `Group`, `Box`, or `Note` boxes.
- [ ] No `opt [...]` square-bracket labels.
- [ ] No `linetype polyline` / `curved` keywords.
- [ ] Title at top matches filename (`CD-XX — Name`).
- [ ] Diagram opens without errors in PlantUML CLI / planttext.com.

## When the user asks for colour

Add a one-line justification comment at the top of the file and update rule
06 (this file) and `docs/DOC-GUIDE.md` in the same commit.
