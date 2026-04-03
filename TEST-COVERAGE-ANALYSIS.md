# Test Coverage Analysis — BR Inventory App

## Current State (Before This PR)

**Test coverage: 0%.** The codebase had zero tests, zero testing infrastructure, and no separation between business logic and DOM code.

---

## What Was Done

1. **Testing infrastructure** — Jest installed and configured
2. **Logic extraction** — Pure business logic extracted from `br-inventory.html` into `br-logic.js` (a testable CommonJS module)
3. **78 unit tests** written across 18 test suites covering the extracted logic

### Coverage of `br-logic.js` (extracted module)

| Metric     | Coverage |
|------------|----------|
| Statements | 100%     |
| Branches   | 98.57%   |
| Functions  | 100%     |
| Lines      | 100%     |

---

## What Is Tested

| Area | Functions | Tests |
|------|-----------|-------|
| Data integrity | SECTIONS, DEFAULT_PRICES | 8 |
| State management | createEmptyState, loadStateFromStorage, getInv, getPrice, setPrice, getCustomItems | 14 |
| Default price application | applyDefaultPrices | 7 |
| Order calculations | calculateTotals, calculateLineTotal | 8 |
| Input parsing | parseInventoryValue, parsePriceValue | 9 |
| Text formatting | padR, padL, formatCurrency | 10 |
| WhatsApp export | buildWhatsAppMessage | 7 |
| Custom item management | addCustomItem, removeCustomItem | 7 |
| Date formatting | formatDateForDisplay, formatDateForFilename | 6 |
| Integration (end-to-end workflows) | full workflow scenarios | 2 |

---

## What Is NOT Tested (Gap Analysis)

The following areas remain untested and represent opportunities for improvement:

### 1. DOM Rendering (`buildInventoryForm`, `buildPricingForm`, `buildManagePage`)
- **Risk: HIGH** — These functions generate the entire UI. Bugs here directly affect users.
- **Recommendation:** Add jsdom-based integration tests that verify:
  - Correct number of rows rendered per section
  - Disabled items get `is-disabled` class and disabled inputs
  - Custom items appear after base items
  - Input fields have correct initial values from state
  - Section headers render with correct names

### 2. DOM Event Handlers (`setVal`, `updatePrice`, `updateTotals` in-page)
- **Risk: HIGH** — These handle every user interaction on the inventory and pricing pages.
- **Recommendation:** Add tests that simulate:
  - Input change events update state correctly
  - CSS classes (`has-value`, `order-value`) toggle based on input values
  - Debounced save fires after input stops
  - Totals display elements update in real-time

### 3. PDF Generation (`sendAsInventory`, `sendSummaryPDF`)
- **Risk: MEDIUM** — Depends on `html2pdf` CDN library. Hard to unit-test, but critical for the app's primary export feature.
- **Recommendation:**
  - Mock `html2pdf` and verify it receives correct options (scale, format, margins)
  - Verify the order-value row is injected and removed correctly
  - Verify the summary PDF only includes items with `order > 0`
  - Test filename generation with and without date
  - Test the Web Share API fallback to download

### 4. WhatsApp Share (`sendAsText` — the in-page version)
- **Risk: LOW** — The pure logic is tested via `buildWhatsAppMessage`, but the `location.href` redirect is not.
- **Recommendation:** Verify the `wa.me` URL is correctly encoded.

### 5. Clear/Reset Flow (`confirmClear`)
- **Risk: MEDIUM** — Double-tap confirmation and state reset. A bug could cause accidental data loss.
- **Recommendation:**
  - Test that first tap changes button text to "Sure?"
  - Test that second tap within 3s clears all inventory data
  - Test that timeout reverts button without clearing
  - Test that localStorage is cleaned

### 6. Page Navigation (`showPage`)
- **Risk: LOW** — Simple tab switching, but controls which page builds on navigate.
- **Recommendation:** Test that `buildPricingForm` is called when switching to pricing, and `buildManagePage` when switching to manage.

### 7. LocalStorage Persistence (save/restore cycle)
- **Risk: MEDIUM** — Data loss bugs are the worst kind for users.
- **Recommendation:**
  - Round-trip test: save state to mock localStorage, reload, verify state matches
  - Test behavior when localStorage is full (quota exceeded)
  - Test behavior when localStorage contains corrupted data

### 8. Staff/Date Persistence (`saveStaffDate`, init restore)
- **Risk: LOW** — Simple save/restore of two fields.
- **Recommendation:** Test the DOMContentLoaded init logic restores date and staff correctly.

### 9. Accessibility & Mobile UX
- **Risk: MEDIUM** — App is mobile-first; broken layout = unusable.
- **Recommendation:**
  - Verify `inputmode="numeric"` on inventory inputs
  - Verify `inputmode="decimal"` on price inputs
  - Verify disabled items have `tabindex="-1"`
  - Check that sticky elements (header, totals, send bar) have correct CSS

---

## Priority Recommendations

| Priority | Area | Effort | Impact |
|----------|------|--------|--------|
| **P0** | DOM rendering tests (buildInventoryForm, buildPricingForm) | Medium | High — catches UI regressions |
| **P0** | Event handler tests (setVal, updatePrice) | Medium | High — user interaction correctness |
| **P1** | Clear/reset flow | Low | Medium — prevents accidental data loss |
| **P1** | localStorage round-trip tests | Low | Medium — prevents data loss on reload |
| **P2** | PDF generation mocked tests | High | Medium — export is key feature |
| **P2** | Page navigation tests | Low | Low — simple logic |
| **P3** | Accessibility audits | Medium | Medium — mobile usability |

---

## Architectural Recommendation

The biggest barrier to testability is that **all code lives in a single HTML file** with tight coupling between business logic and DOM manipulation. The extraction of `br-logic.js` in this PR demonstrates the pattern. To achieve full testability:

1. **Continue extracting** — Move DOM-building functions into a separate module that accepts a document/container parameter (dependency injection)
2. **Separate concerns** — State management, rendering, and event handling should be distinct layers
3. **Consider a bundler** — Even a lightweight tool like esbuild would enable proper module imports in the HTML file while keeping the development experience simple

This would enable comprehensive testing without needing a full browser environment for most tests.
