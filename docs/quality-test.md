# Quality Scenario — Security (XSS and corrupted storage)

## Environment

- Browser: Chrome/Edge version:
- OS:
- Node.js: 20.x
- App command: `npm ci && npm run dev`
- Viewport: 1280 × 800 and 375 × 812

## Input 1 — HTML in a task title

1. Add a task with the title `<img src=x onerror=alert('xss')>`.
2. Save and reload the page.
3. Expected: the title is displayed as literal text; no alert appears.
4. Record the Console output.

Result: [pass/fail]

Evidence: [screenshot / console screenshot]

## Input 2 — Corrupted localStorage

1. Open DevTools → Application → Local Storage.
2. Set `groupboard:v1` to `{"version":1,"tasks":"bad"}`.
3. Reload the page.
4. Expected: an empty board and a warning; the app does not crash.

Result: [pass/fail]

Evidence: [screenshot]

## Input 3 — Long title

1. Add a task with a 500-character title.
2. Expected: the card wraps and does not overflow the column.

Result: [pass/fail]

Evidence: [screenshot]

## Notes

Task titles are rendered with `textContent`, not `innerHTML`. The storage adapter validates the schema and due-date format before loading.
