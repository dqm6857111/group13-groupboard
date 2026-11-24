# Quality Scenario - Security (XSS and corrupted storage)

## Environment
- Node.js: 20.x
- App command: `npm ci` & `npm run dev`
- Viewport: 1280 x 800 and 375 x 812
- Browser: Chrome (Windows 11)

## Input 1 - HTML in a task title

1. Add a task with the title `<img src=x onerror=alert('xss')>`.
2. Save and reload the page.
3. Expected: the title is displayed as literal text; no alert appears.
4. Record the Console output.

Result: **Pass**
Evidence: `docs/evidence/xss-and-due-date-test.png` (Rendered safely as text without executing the script)

## Input 2 - Corrupted localStorage

1. Open DevTools -> Application -> Local Storage.
2. Set `groupboard:v1` to `{"version":1,"tasks":"bad"}`.
3. Reload the page.
4. Expected: an empty board and a warning; the app does not crash.

Result: **Pass**
Evidence: `docs/evidence/storage-corruption-test.png` (The board was cleared and a warning banner displayed safely)