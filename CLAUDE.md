## Testing

**All new features that affect scoring, parsing, or award logic must have tests.**

- Test runner: Jest (`npm test`)
- Tests live in `lib.test.js`
- Logic under test lives in `lib.js` (CommonJS-exported pure functions)

Run `npm test` before opening a PR.

### Adding a new feature with logic changes

1. Implement the pure logic in `lib.js` and export it
2. Write tests in `lib.test.js` — derive test cases from the README spec
3. Document the behavior in `README.md` (README is the source-of-truth spec)
4. Wire the function into `catfish-tracker.html`

### Architecture

| File | Purpose |
|---|---|
| `lib.js` | Pure functions: parsing, scoring, group logic, awards, formatting |
| `catfish-tracker.html` | DOM, UI, file I/O, server communication, IndexedDB |
| `server.js` | Express API + static serving |
| `lib.test.js` | Jest tests for `lib.js` |
| `README.md` | User-facing spec (source of truth for rules) |

### Standalone constraint

`catfish-tracker.html` must work opened directly as a `file://` URL.
`lib.js` must stay in the same directory as `catfish-tracker.html`.
Do not add ES module syntax (`import`/`export`) to `lib.js`.
