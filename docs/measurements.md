# Process Improvement Measurements

## Problem observed in Iteration 1

- CI failed due to invalid workflow YAML and node_modules accidentally being pushed (missing .gitignore). Additionally, manual testing was insufficient to catch logic errors early.
- Evidence: Assignment 1 report Section 4.4 and Iteration 1 retrospective

## Improvement applied in Iteration 2

- Implemented a PR template, required CI checks (npm ci, npm test, npm run build), and added 24 automated tests to increase coverage.
- Owner: Ye Yuting (Quality Lead) & Du Qimeng (Technical Lead)
- Date: 2026-11-24

## Measurements

| Metric | Iteration 1 | Iteration 2 | Evidence |
|---|---|---|---|
| CI failures | 2 (YAML & node_modules) | 0 | [GitHub Actions link](https://github.com/dqm6857111/group13-groupboard/actions) |
| PR first-review time | ~12 hours | ~2 hours | PR #8 and PR #9 timestamps |
| Defects found after merge | 0 | 0 | Repository Issues page |
| Core statement coverage | ~20% (2 tests) | 100% (26 tests) | `npm run test:coverage` output |
| Escaped defects | 0 | 0 | N/A |

## Conditions that affect comparison

- Iteration 1 included project setup and CI configuration.
- Iteration 2 included more tests but used a warm npm cache.
- Team availability: Iteration 2 had better asynchronous communication and a clear review SLA (24h).

## Conclusion

- **Did the improvement work?** Yes, the CI pipeline caught formatting issues immediately, and automated tests gave us confidence to refactor the UI for team features without breaking core logic.
- **What would we change next?** Next time, we would introduce E2E (End-to-End) tests (e.g., Playwright) to test the actual browser UI interactions, and set up stricter branch protection rules.