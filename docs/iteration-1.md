# Iteration 1 — Usable single-user board

## Goal

Deliver a runnable three-column board with task CRUD, status transitions and local persistence.

## Selected backlog

| ID | Requirement | Acceptance criteria | Owner |
|---|---|---|---|
| I1-01 | Tooling | `npm ci`, `npm run dev` and `npm run build` succeed | Du Qimeng |
| I1-02 | Task CRUD | Blank title rejected; create/edit/delete persist after reload | Du Qimeng |
| I1-03 | Status matrix | Forward and backward moves allowed; direct To do↔Done rejected | Du Qimeng |
| I1-04 | Persistence | Schema v1; corrupted JSON falls back with a warning | Du Qimeng |
| I1-05 | Board UI | Three columns and counts; 375 px layout usable | Shi Yijia |
| I1-06 | Tests and CI | CRUD, transitions and storage tests pass in CI | Ye Yuting |

## Responsibilities

- Du Qimeng: implementation, tests, CI, repository.
- Ye Yuting: test design, review, evidence.
- Shi Yijia: UI and accessibility.
- Teng Haochen: acceptance and report integration.

## Result

- All P0 criteria: [pass/fail]
- Demo: [link or screenshot]
- CI run: [link]
- Known limitations: [list]

## Retrospective

- What worked:
- What did not:
- One improvement for Iteration 2:
- Evidence link:
