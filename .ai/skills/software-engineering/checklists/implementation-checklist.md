# Implementation Checklist

Run **before** staging a code change for commit.

## Scope

- [ ] The change was triggered by an explicit user requirement.
- [ ] The change is described in one sentence.
- [ ] An impact matrix has been built (see `rules/11-change-impact-analysis.md`).

## Code

- [ ] No `console.log` / `console.error` left in (use `utils/logger.js`).
- [ ] No hard-coded `localhost`, `127.0.0.1`, secrets, Mongo URI, JWT secret,
      mail password in any `.js` / `.jsx` file.
- [ ] New env vars added to `backend/.env.example` and `frontend/.env.example`.
- [ ] New permission constants added to `backend/src/constants/permissions.js`.
- [ ] New validators added to the relevant `*.validator.js` file.
- [ ] No duplicate logic — check whether an existing util/service does this.
- [ ] The router file wires the controller method with the correct middleware
      order: `authenticate → requirePermission → validate → controller`.

## Frontend

- [ ] New pages live in `frontend/src/pages/` and are registered in the router.
- [ ] New API calls go through `frontend/src/api/<feature>.api.js`.
- [ ] No axios instance outside `frontend/src/api/axios.js`.
- [ ] Permission-gated UI uses `usePermission(...)` hook.

## Security

- [ ] `passwordHash` and `activationToken` are not part of any response.
- [ ] User-supplied strings rendered in HTML are escaped (server side too).
- [ ] No secrets logged in any branch.

## Tests

- [ ] `cd backend && npm test` passes locally.
- [ ] `cd backend && npm run lint` passes.
- [ ] `cd frontend && npm run lint` passes.
- [ ] `cd frontend && npm run build` succeeds.
- [ ] Test count change matches the new/modified test files.

## Pre-commit

- [ ] No untracked file is a `.env`, `.env.local`, or a `node_modules/` excerpt.
- [ ] `git status --short` matches the impact matrix exactly.
- [ ] Commit message names the UC id or feature.
