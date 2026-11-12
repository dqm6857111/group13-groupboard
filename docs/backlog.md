# GroupBoard Backlog

Live board: GitHub Project (GroupBoard Backlog)

| ID | Priority | Iteration | Difficulty | Requirement | Acceptance criteria | Owner |
|---|---|---|---|---|---|---|
| B-01 | P0 | I1 | L2 | Create task | Blank title rejected; card appears in To do and survives reload. | Du Qimeng |
| B-04 | P0 | I1 | L3 | Status transitions | To do→In progress→Done; direct To do↔Done rejected; reload preserves. | Du Qimeng |
| B-05 | P0 | I1 | L3 | Local persistence | Schema v1; corrupted JSON falls back to empty board with warning. | Du Qimeng |
| B-07 | P1 | I1 | L2 | Assignee | Editable member list; assign and unassign; reload preserves; removing a member unassigns tasks. | Du Qimeng |
| B-08 | P1 | I1 | L2 | Due date | Optional date; overdue red, due within 48 hours amber, otherwise neutral; reload preserves. | Du Qimeng |
| B-10 | P1 | I2 | L3 | Automated tests | CRUD, transitions and date classification covered; core coverage ≥80%; tests pass locally and in CI. | Ye Yuting |
