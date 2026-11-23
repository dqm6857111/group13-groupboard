# GroupBoard

A lightweight three-column Kanban board for student team assignments. It needs no account and stores data in the browser.

## Scope

- Three columns: To do, In progress, Done.
- Task create, edit, delete and status transitions.
- Assignees, optional due dates, overdue and due-soon highlighting.
- Local persistence with a versioned localStorage schema.
- Unit tests and a CI pipeline.

Out of scope: accounts, backend, real-time sync, notifications, native apps, attachments, subtasks, comments and analytics.

## Prerequisites

- Node.js 20 or later
- npm 10 or later

## Setup

```bash
npm ci
```

## Run

```bash
npm run dev
```

Open the local URL printed by Vite.

## Test

```bash
npm test
npm run test:coverage
```

The tests cover task CRUD, the status-transition matrix, due-date boundaries and storage fallback. Coverage includes `src/tasks.js` and `src/storage.js`.

## Build

```bash
npm run build
npm run preview
```

## Iteration switch

`src/main.js` exposes `FEATURES.iteration2`. Set it to `false` for Iteration 1 (board, CRUD and persistence), then to `true` for Iteration 2 (assignees and due dates). Commit the flag change separately so the two increments are visible in Git history.

## Project structure

```text
index.html
src/
  main.js        controller, rendering and event handling
  tasks.js       pure domain logic: CRUD, transitions, due dates
  storage.js     localStorage adapter with schema v1
  clock.js       local date helper
  styles.css     board layout and due-date states
tests/
  tasks.test.js
  storage.test.js
.github/workflows/ci.yml
docs/
  backlog.md
  evidence-index.md
```

## Security and limits

Task titles are rendered with `textContent`, not `innerHTML`, so HTML in a title is displayed as text. The app is local-only: data is stored in one browser and is not synchronised. There is no authentication, so anyone with access to the browser profile can see the board.

## Evidence

- Backlog: `docs/backlog.md`
- Trial issue: https://github.com/dqm6857111/group13-groupboard/issues/2
- Reviewed change: https://github.com/dqm6857111/group13-groupboard/pull/3
- CI run: https://github.com/dqm6857111/group13-groupboard/actions/runs/42584103917
- Release: `v1.0-a1`
- Evidence index: `docs/evidence-index.md`

## Assessor access

Public repository: https://github.com/dqm6857111/group13-groupboard
