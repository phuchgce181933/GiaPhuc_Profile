# Documentation Checklist

Run after any change that touches documentation artefacts.

## Targeted updates only

- [ ] Only sections actually affected by the change were edited.
- [ ] No doc file was renamed or moved without updating cross-references in
      `README.md`, `SKILL.md`, and `BACKLOG.md`.

## README

- [ ] API table reflects the current router.
- [ ] Env table reflects `backend/.env.example` and `frontend/.env.example`.
- [ ] "Stack" / "Layout" still match the actual folder structure.

## UC package

- [ ] UC field table is the canonical one (see `templates/use-case-template.md`).
- [ ] UC ↔ Diagram traceability table updated.
- [ ] New UC id is not a duplicate of an existing one.

## Test docs

- [ ] `UNIT-TEST.md` row count = number of Jest cases in `tests/unit/`.
- [ ] `SYSTEM-TEST.md` row count = number of executed scenarios (plus
      `Not Executed` rows with a reason).
- [ ] Summary table updated.

## PlantUML

- [ ] Every diagram renders without errors in PlantUML CLI or planttext.com.
- [ ] No accidental blue links / coloured boxes.
- [ ] Class names match source files exactly.
- [ ] Arrow labels match real method names.

## Backlog

- [ ] Status Report has a new row for the task just finished (or the existing
      row's status was updated).
- [ ] Project Issues has a new row if new debt was discovered.
- [ ] No duplicate rows.

## Drift

- [ ] Run `rules/10-validation.md` drift checks (10 source/doc pairs).
- [ ] Report any drift found; do not silently fix.
