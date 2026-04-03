# CLAUDE.md

## Project Overview
- BR Inventory is a single-file web app (`br-inventory.html`) for managing Baskin-Robbins product ordering at 8750 Bayview Ave
- Vanilla HTML/CSS/JS, no build system, no framework
- External dependency: html2pdf.js v0.10.2 via CDN
- Data persisted in browser localStorage
- Mobile-first design, now full-width (no longer constrained to 390px)

## Key Architecture
- All app code lives in `br-inventory.html` (HTML + CSS + JS)
- `br-logic.js` contains extracted pure business logic for testing
- `br-logic.test.js` has 78 unit tests (Jest)
- The send bar is positioned **outside** `page-inventory` div (moved there to help with PDF capture)

## Lessons Learned

### html2pdf.js / html2canvas
- **html2canvas captures fixed-position elements from the viewport** regardless of which DOM element you pass to `.from()`. You must hide fixed elements on the live DOM before capture.
- **`onclone` callback runs AFTER html2canvas reads the options object.** You cannot dynamically set `height`, `windowHeight`, or `jsPDF.format` inside `onclone` — those values are already consumed. Modify the live DOM and measure `scrollHeight` before calling html2pdf.
- **Sticky elements (`position: sticky`) collapse content behind them.** Before measuring `scrollHeight`, set sticky elements to `position: relative` so all content flows naturally and is included in the measurement.
- **Always wait for browser reflow** (double `requestAnimationFrame`) after DOM changes before measuring `scrollHeight`.
- **Restore all modified styles in a `finally` block** so the page returns to normal after capture, even if an error occurs.

### General
- Always push to `main` when the user expects to see changes on reload (they view from main, not feature branches).
- Product names must be ALL CAPS — enforce uppercase on any new items.
- Version string is in the footer: "April 2026, Ver X.X"
- Never introduce duplicate `catch` blocks on the same `try` — it's a syntax error that silently breaks the entire `<script>` tag.
