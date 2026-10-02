# PUSH.md

> Quick reference for pushing this skill template to your git remote.

## Current local state

- **Branch**: `agen_skill_document` (only branch)
- **Commits**: 2 (`init` + `config gitattributes`)
- **Files**: 64 total (skill only, no `backend/` / `frontend/`)

## How to push

```bash
# 1. Add your remote (replace with your actual git URL)
git remote add origin <your-repo-url>

# 2. Push the branch
git push -u origin agen_skill_document
```

Example with GitHub:

```bash
git remote add origin https://github.com/<your-account>/<your-repo>.git
git push -u origin agen_skill_document
```

Example with GitLab:

```bash
git remote add origin https://gitlab.com/<your-account>/<your-repo>.git
git push -u origin agen_skill_document
```

## Branch policy

This template lives **only on `agen_skill_document`**. Other branches should not
carry the skill files (`.ai/`, `.cursor/`, `.githooks/`, `.github/`,
`scripts/`).

If you create other branches from this one, the skill files will be there too
— strip them if needed:

```bash
git checkout other-branch
git rm -rf .ai .cursor .githooks .github scripts .gitattributes
git commit -m "strip: remove skill template from this branch"
```

## Works on any git account

The skill enforces rules using **file paths and patterns only**. There is no
hard-coded username, email, or remote URL. As long as `.githooks/pre-commit`,
`.githooks/commit-msg`, and `scripts/drift-detect.js` are present in the repo,
they work identically regardless of which git host (GitHub, GitLab, Bitbucket,
self-hosted, etc.) or which user account owns the repo.

---

Last updated: 2026-10-02