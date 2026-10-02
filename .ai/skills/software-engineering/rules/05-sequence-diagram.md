# Rule 05 — Sequence Diagram

Use `templates/sequence-diagram-template.puml` as the starting shell.

## Participant categories

Only use a participant that satisfies **at least one**:

1. Exists in backend `src/` or frontend `src/`.
2. Is an actual external system (MongoDB, SMTP provider, OAuth IdP).
3. Is an actor.
4. Is the database.

Naming conventions:

```
actor "Admin" as Admin
participant "React\nStaffCreatePage" as React
participant "StaffRouter" as Router
participant "AuthMiddleware" as AuthMw
participant "PermissionMiddleware\n(CREATE_STAFF)" as PermMw
database "MongoDB" as DB
participant "EmailService" as Email
participant "SMTP Provider" as SMTP
```

## Message rules

Every important message must correspond to:

- an actual method call,
- an HTTP request (with method + path),
- an actual DB operation (`findOne`, `insertOne`),
- an actual UI action (`navigate`, `toast.success`),
- or an explicitly documented logical operation (e.g. `hashPassword(plain)`).

Do **not** invent:

```
Service -> Repository : validateEverything()
```

if no such method exists.

## Branches

| Keyword | Use when |
| ------- | -------- |
| `alt` / `else` / `end` | mutually exclusive branches (success vs error). |
| `opt`                  | genuinely optional behaviour. |
| `loop`                 | repetition. |
| `break`                | terminating the flow on a condition. |
| `par` / `end`          | actual parallel execution (rare). |

Prefer `alt` over `opt` to avoid PlantUML rendering the label as a blue link
(see rule 06).

## Activation

Every `activate` needs a matching `deactivate`. Prefer letting PlantUML infer
activation when the arrow chain is unambiguous.

## Numbering

Numbers reflect logical execution order. Sub-operations use `5.1`, `5.2` etc.
A child step's number MUST be ≥ the parent step it belongs to.

## Anti-patterns

- Listing **every** HTTP status code on the diagram.
- Adding a `Middleware` participant that the route does not register.
- Adding `EmailService` when the UC is not an email-trigger UC.
- Two participants named the same thing (e.g. two `Controller`).

## Hard rule

- **One UC = one SD.** See the HARD RULE block at the end of
  `rules/03-use-case.md`. Do **not** create an SD that combines two or more
  UCs as parallel branches (e.g. UC-01 success + UC-01 error in one SD is
  fine; UC-01 + UC-02 + UC-08 in the same SD is not). Each UC gets its own
  SD file, even when the participants are largely the same.
- **Cardinality is 1 : 1 : 1.** `UC-XX` ↔ `CD-XX-<Name>.puml` ↔
  `SD-XX-<Name>.puml`. The same UC id `XX` is used in all three filenames.
- **Shared participants are allowed.** Two UCs may share `Router`,
  `Controller`, `MongoDB` — each UC still gets its own SD and those
  participants appear in both.
- **Shared diagrams are forbidden.** A single SD must not serve more than
  one UC. A "sub-flow of UC-01" referenced from UC-06 is still a violation
  of 1 : 1 : 1 — UC-06 must have its own `SD-06-...puml`.
