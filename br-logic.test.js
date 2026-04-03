const {
  SECTIONS,
  DEFAULT_PRICES,
  LS_KEYS,
  createEmptyState,
  loadStateFromStorage,
  getInv,
  getPrice,
  setPrice,
  getCustomItems,
  applyDefaultPrices,
  calculateTotals,
  calculateLineTotal,
  parseInventoryValue,
  parsePriceValue,
  padR,
  padL,
  formatCurrency,
  buildWhatsAppMessage,
  addCustomItem,
  removeCustomItem,
  formatDateForDisplay,
  formatDateForFilename,
} = require('./br-logic');

// ═══════════════════════════════════════
// PRODUCT DATA INTEGRITY
// ═══════════════════════════════════════
describe('SECTIONS data integrity', () => {
  test('should have 13 sections', () => {
    expect(SECTIONS).toHaveLength(13);
  });

  test('every section should have a name and items array', () => {
    SECTIONS.forEach(section => {
      expect(section.name).toBeDefined();
      expect(typeof section.name).toBe('string');
      expect(section.name.length).toBeGreaterThan(0);
      expect(Array.isArray(section.items)).toBe(true);
      expect(section.items.length).toBeGreaterThan(0);
    });
  });

  test('every item should have a name and unit (TUB or CASE)', () => {
    SECTIONS.forEach(section => {
      section.items.forEach(item => {
        expect(item.name).toBeDefined();
        expect(typeof item.name).toBe('string');
        expect(['TUB', 'CASE']).toContain(item.unit);
      });
    });
  });

  test('only DECORATING VANILLA should be disabled', () => {
    const disabledItems = [];
    SECTIONS.forEach(section => {
      section.items.forEach(item => {
        if (item.disabled) disabledItems.push(item.name);
      });
    });
    expect(disabledItems).toEqual(['DECORATING VANILLA']);
  });

  test('section names should be unique', () => {
    const names = SECTIONS.map(s => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test('total base item count should be 73', () => {
    const total = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
    expect(total).toBe(70);
  });
});

describe('DEFAULT_PRICES data integrity', () => {
  test('TUB default price should be 60.99', () => {
    expect(DEFAULT_PRICES['_TUB_DEFAULT']).toBe(60.99);
  });

  test('PREPACK default price should be 34.21', () => {
    expect(DEFAULT_PRICES['_PREPACK_DEFAULT']).toBe(34.21);
  });

  test('all specific prices should be positive numbers', () => {
    Object.entries(DEFAULT_PRICES).forEach(([key, val]) => {
      expect(typeof val).toBe('number');
      expect(val).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════
describe('createEmptyState', () => {
  test('should return empty state object', () => {
    const state = createEmptyState();
    expect(state).toEqual({ inventory: {}, prices: {}, customItems: {} });
  });

  test('should return a new object each time', () => {
    const a = createEmptyState();
    const b = createEmptyState();
    expect(a).not.toBe(b);
  });
});

describe('loadStateFromStorage', () => {
  test('should load valid data from storage', () => {
    const mockStorage = {
      getItem: (key) => {
        const data = {
          [LS_KEYS.inventory]: JSON.stringify({ 0: { 0: { have: 5, order: 3 } } }),
          [LS_KEYS.prices]: JSON.stringify({ 0: { 0: 76.22 } }),
          [LS_KEYS.customItems]: JSON.stringify({ 0: [{ name: 'TEST', unit: 'TUB' }] }),
        };
        return data[key] || null;
      }
    };
    const state = loadStateFromStorage(mockStorage);
    expect(state.inventory[0][0]).toEqual({ have: 5, order: 3 });
    expect(state.prices[0][0]).toBe(76.22);
    expect(state.customItems[0]).toHaveLength(1);
  });

  test('should return empty state for null storage values', () => {
    const mockStorage = { getItem: () => null };
    const state = loadStateFromStorage(mockStorage);
    expect(state).toEqual({ inventory: {}, prices: {}, customItems: {} });
  });

  test('should return empty state on invalid JSON', () => {
    const mockStorage = { getItem: () => '{invalid json' };
    const state = loadStateFromStorage(mockStorage);
    expect(state).toEqual({ inventory: {}, prices: {}, customItems: {} });
  });

  test('should handle storage that throws errors', () => {
    const mockStorage = { getItem: () => { throw new Error('quota exceeded'); } };
    const state = loadStateFromStorage(mockStorage);
    expect(state).toEqual({ inventory: {}, prices: {}, customItems: {} });
  });
});

describe('getInv', () => {
  test('should initialize missing section and item', () => {
    const state = createEmptyState();
    const inv = getInv(state, 0, 0);
    expect(inv).toEqual({ have: 0, order: 0 });
    expect(state.inventory[0][0]).toBe(inv);
  });

  test('should return existing inventory data', () => {
    const state = createEmptyState();
    state.inventory[2] = { 1: { have: 10, order: 5 } };
    const inv = getInv(state, 2, 1);
    expect(inv).toEqual({ have: 10, order: 5 });
  });

  test('should not overwrite existing data for other items in section', () => {
    const state = createEmptyState();
    state.inventory[0] = { 0: { have: 3, order: 1 } };
    getInv(state, 0, 1);
    expect(state.inventory[0][0]).toEqual({ have: 3, order: 1 });
  });
});

describe('getPrice / setPrice', () => {
  test('getPrice should return 0 for unset prices', () => {
    const state = createEmptyState();
    expect(getPrice(state, 0, 0)).toBe(0);
  });

  test('setPrice should store and retrieve price', () => {
    const state = createEmptyState();
    setPrice(state, 0, 0, 76.22);
    expect(getPrice(state, 0, 0)).toBe(76.22);
  });

  test('setPrice should initialize section if missing', () => {
    const state = createEmptyState();
    setPrice(state, 5, 3, 99.99);
    expect(state.prices[5][3]).toBe(99.99);
  });
});

describe('getCustomItems', () => {
  test('should return empty array for section with no custom items', () => {
    const state = createEmptyState();
    expect(getCustomItems(state, 0)).toEqual([]);
  });

  test('should initialize array and return same reference', () => {
    const state = createEmptyState();
    const items = getCustomItems(state, 3);
    items.push({ name: 'TEST', unit: 'TUB' });
    expect(getCustomItems(state, 3)).toHaveLength(1);
  });
});

// ═══════════════════════════════════════
// DEFAULT PRICES APPLICATION
// ═══════════════════════════════════════
describe('applyDefaultPrices', () => {
  test('should apply specific item prices', () => {
    const state = createEmptyState();
    applyDefaultPrices(state, SECTIONS);
    // BROWNIE is section 0, item 0
    expect(state.prices[0][0]).toBe(76.22);
  });

  test('should apply TUB default to TUB items without specific price', () => {
    const state = createEmptyState();
    applyDefaultPrices(state, SECTIONS);
    // FLAVOUR OF THE MONTH – THIS MONTH (section 2, item 0) is TUB with no specific price
    expect(state.prices[2][0]).toBe(60.99);
  });

  test('should apply PREPACK default to PRE-PACKS items', () => {
    const state = createEmptyState();
    applyDefaultPrices(state, SECTIONS);
    // PRE-PACKS is section 6
    expect(state.prices[6][0]).toBe(34.21);
  });

  test('should not overwrite existing prices', () => {
    const state = createEmptyState();
    state.prices[0] = { 0: 100.00 };
    applyDefaultPrices(state, SECTIONS);
    expect(state.prices[0][0]).toBe(100.00);
  });

  test('should return true when changes were made', () => {
    const state = createEmptyState();
    const changed = applyDefaultPrices(state, SECTIONS);
    expect(changed).toBe(true);
  });

  test('should return false when no changes needed', () => {
    const state = createEmptyState();
    applyDefaultPrices(state, SECTIONS);
    const changed = applyDefaultPrices(state, SECTIONS);
    expect(changed).toBe(false);
  });

  test('COOKIE DOUGH TOPPING (CASE, no specific price, not PRE-PACKS, not TUB) gets no default', () => {
    const state = createEmptyState();
    applyDefaultPrices(state, SECTIONS);
    // TOPPINGS section (10), COOKIE DOUGH TOPPING is item 2
    // It's a CASE item in a non-PRE-PACKS section with no specific price
    expect(state.prices[10][2]).toBeUndefined();
  });
});

// ═══════════════════════════════════════
// CALCULATIONS
// ═══════════════════════════════════════
describe('calculateTotals', () => {
  test('should return zero totals for empty state', () => {
    const state = createEmptyState();
    const { totalOrder, orderValue } = calculateTotals(state, SECTIONS);
    expect(totalOrder).toBe(0);
    expect(orderValue).toBe(0);
  });

  test('should correctly sum order quantities', () => {
    const state = createEmptyState();
    getInv(state, 0, 0).order = 5;
    getInv(state, 0, 1).order = 3;
    const { totalOrder } = calculateTotals(state, SECTIONS);
    expect(totalOrder).toBe(8);
  });

  test('should correctly calculate order value', () => {
    const state = createEmptyState();
    getInv(state, 0, 0).order = 2;
    setPrice(state, 0, 0, 76.22);
    const { orderValue } = calculateTotals(state, SECTIONS);
    expect(orderValue).toBeCloseTo(152.44, 2);
  });

  test('should include custom items in totals', () => {
    const state = createEmptyState();
    addCustomItem(state, 0, 'CUSTOM BROWNIE', 'CASE');
    const customIdx = SECTIONS[0].items.length; // index after base items
    getInv(state, 0, customIdx).order = 4;
    setPrice(state, 0, customIdx, 50.00);
    const { totalOrder, orderValue } = calculateTotals(state, SECTIONS);
    expect(totalOrder).toBe(4);
    expect(orderValue).toBeCloseTo(200.00, 2);
  });

  test('should not count have values in totals', () => {
    const state = createEmptyState();
    getInv(state, 0, 0).have = 10;
    getInv(state, 0, 0).order = 0;
    const { totalOrder } = calculateTotals(state, SECTIONS);
    expect(totalOrder).toBe(0);
  });
});

describe('calculateLineTotal', () => {
  test('should multiply price by quantity', () => {
    expect(calculateLineTotal(76.22, 3)).toBeCloseTo(228.66, 2);
  });

  test('should return 0 when quantity is 0', () => {
    expect(calculateLineTotal(76.22, 0)).toBe(0);
  });

  test('should return 0 when price is 0', () => {
    expect(calculateLineTotal(0, 5)).toBe(0);
  });
});

// ═══════════════════════════════════════
// INPUT PARSING
// ═══════════════════════════════════════
describe('parseInventoryValue', () => {
  test('should parse valid integers', () => {
    expect(parseInventoryValue('5')).toBe(5);
    expect(parseInventoryValue('100')).toBe(100);
  });

  test('should return 0 for empty string', () => {
    expect(parseInventoryValue('')).toBe(0);
  });

  test('should return 0 for negative values', () => {
    expect(parseInventoryValue('-3')).toBe(0);
  });

  test('should truncate decimals', () => {
    expect(parseInventoryValue('3.7')).toBe(3);
  });

  test('should return 0 for non-numeric input', () => {
    expect(parseInventoryValue('abc')).toBe(0);
    expect(parseInventoryValue(undefined)).toBe(0);
    expect(parseInventoryValue(null)).toBe(0);
  });
});

describe('parsePriceValue', () => {
  test('should parse valid decimals', () => {
    expect(parsePriceValue('76.22')).toBe(76.22);
  });

  test('should return 0 for empty string', () => {
    expect(parsePriceValue('')).toBe(0);
  });

  test('should return 0 for negative values', () => {
    expect(parsePriceValue('-10.50')).toBe(0);
  });

  test('should return 0 for non-numeric input', () => {
    expect(parsePriceValue('abc')).toBe(0);
  });
});

// ═══════════════════════════════════════
// TEXT FORMATTING
// ═══════════════════════════════════════
describe('padR', () => {
  test('should pad string to specified width', () => {
    expect(padR('hello', 10)).toBe('hello     ');
  });

  test('should truncate string longer than width', () => {
    expect(padR('hello world', 5)).toBe('hello');
  });

  test('should handle exact length', () => {
    expect(padR('hello', 5)).toBe('hello');
  });

  test('should convert numbers to strings', () => {
    expect(padR(42, 5)).toBe('42   ');
  });
});

describe('padL', () => {
  test('should left-pad string to specified width', () => {
    expect(padL('5', 4)).toBe('   5');
  });

  test('should truncate string longer than width', () => {
    expect(padL('hello world', 5)).toBe('hello');
  });

  test('should handle exact length', () => {
    expect(padL('hello', 5)).toBe('hello');
  });

  test('should convert numbers to strings', () => {
    expect(padL(42, 5)).toBe('   42');
  });
});

describe('formatCurrency', () => {
  test('should format with dollar sign and 2 decimal places', () => {
    const result = formatCurrency(152.44);
    expect(result).toMatch(/^\$152\.44$/);
  });

  test('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  test('should format large numbers', () => {
    const result = formatCurrency(1234.56);
    // Locale-dependent, but should contain $, 1234 or 1,234, and .56
    expect(result).toContain('$');
    expect(result).toContain('.56');
  });
});

// ═══════════════════════════════════════
// WHATSAPP MESSAGE GENERATION
// ═══════════════════════════════════════
describe('buildWhatsAppMessage', () => {
  test('should include header with date and staff', () => {
    const state = createEmptyState();
    const { msg } = buildWhatsAppMessage(state, SECTIONS, 'April 3, 2026', 'John');
    expect(msg).toContain('*BASKIN-ROBBINS PRODUCT ORDER*');
    expect(msg).toContain('April 3, 2026');
    expect(msg).toContain('John');
  });

  test('should omit staff name if empty', () => {
    const state = createEmptyState();
    const { msg } = buildWhatsAppMessage(state, SECTIONS, 'April 3, 2026', '');
    expect(msg).toContain('April 3, 2026');
    // With no staff, the line after the date should be a section header, not a staff name
    expect(msg).not.toMatch(/April 3, 2026\n[A-Za-z]+\n\*/);
  });

  test('should report zero grandOrder when no orders', () => {
    const state = createEmptyState();
    const { grandOrder } = buildWhatsAppMessage(state, SECTIONS, 'April 3, 2026', '');
    expect(grandOrder).toBe(0);
  });

  test('should include order totals in message', () => {
    const state = createEmptyState();
    getInv(state, 0, 0).order = 3;
    setPrice(state, 0, 0, 76.22);
    const { msg, grandOrder, orderValue } = buildWhatsAppMessage(state, SECTIONS, 'April 3, 2026', '');
    expect(grandOrder).toBe(3);
    expect(orderValue).toBeCloseTo(228.66, 2);
    expect(msg).toContain('TOTAL TO ORDER: 3 units');
    expect(msg).toContain('ORDER VALUE:');
  });

  test('should truncate long item names to 22 chars', () => {
    const state = createEmptyState();
    getInv(state, 0, 1).have = 1; // 9" DOUBLE FUDGE BROWNIE (POLAR PIZZA) — long name
    const { msg } = buildWhatsAppMessage(state, SECTIONS, 'date', '');
    // The name has 38 chars, should be truncated to 21 + "…"
    expect(msg).toContain('…');
  });

  test('should skip disabled items', () => {
    const state = createEmptyState();
    // DECORATING VANILLA is disabled (section 5, item 16)
    getInv(state, 5, 16).order = 5;
    const { msg } = buildWhatsAppMessage(state, SECTIONS, 'date', '');
    expect(msg).not.toContain('DECORATING VANILLA');
  });

  test('should not include ORDER VALUE line when value is 0', () => {
    const state = createEmptyState();
    const { msg } = buildWhatsAppMessage(state, SECTIONS, 'date', '');
    expect(msg).not.toContain('ORDER VALUE:');
  });
});

// ═══════════════════════════════════════
// CUSTOM ITEM MANAGEMENT
// ═══════════════════════════════════════
describe('addCustomItem', () => {
  test('should add item to section with uppercase name', () => {
    const state = createEmptyState();
    addCustomItem(state, 0, 'test brownie', 'CASE');
    expect(state.customItems[0]).toEqual([{ name: 'TEST BROWNIE', unit: 'CASE' }]);
  });

  test('should append multiple custom items', () => {
    const state = createEmptyState();
    addCustomItem(state, 0, 'item one', 'TUB');
    addCustomItem(state, 0, 'item two', 'CASE');
    expect(state.customItems[0]).toHaveLength(2);
  });

  test('should add to different sections independently', () => {
    const state = createEmptyState();
    addCustomItem(state, 0, 'bakery item', 'CASE');
    addCustomItem(state, 1, 'beverage item', 'CASE');
    expect(state.customItems[0]).toHaveLength(1);
    expect(state.customItems[1]).toHaveLength(1);
  });
});

describe('removeCustomItem', () => {
  test('should remove custom item from section', () => {
    const state = createEmptyState();
    addCustomItem(state, 0, 'item a', 'TUB');
    addCustomItem(state, 0, 'item b', 'CASE');
    removeCustomItem(state, SECTIONS, 0, 0);
    expect(state.customItems[0]).toHaveLength(1);
    expect(state.customItems[0][0].name).toBe('ITEM B');
  });

  test('should shift inventory data down after removal', () => {
    const state = createEmptyState();
    addCustomItem(state, 0, 'item a', 'TUB');
    addCustomItem(state, 0, 'item b', 'CASE');
    const baseCount = SECTIONS[0].items.length;
    // Set inventory for second custom item
    getInv(state, 0, baseCount + 1).order = 10;

    removeCustomItem(state, SECTIONS, 0, 0);

    // The second custom item's data should now be at baseCount
    expect(getInv(state, 0, baseCount).order).toBe(10);
  });

  test('should shift price data down after removal', () => {
    const state = createEmptyState();
    addCustomItem(state, 0, 'item a', 'TUB');
    addCustomItem(state, 0, 'item b', 'CASE');
    const baseCount = SECTIONS[0].items.length;
    setPrice(state, 0, baseCount + 1, 50.00);

    removeCustomItem(state, SECTIONS, 0, 0);
    expect(getPrice(state, 0, baseCount)).toBe(50.00);
  });

  test('should handle removing last custom item', () => {
    const state = createEmptyState();
    addCustomItem(state, 0, 'only item', 'TUB');
    removeCustomItem(state, SECTIONS, 0, 0);
    expect(state.customItems[0]).toHaveLength(0);
  });
});

// ═══════════════════════════════════════
// DATE FORMATTING
// ═══════════════════════════════════════
describe('formatDateForDisplay', () => {
  test('should format valid date string', () => {
    const result = formatDateForDisplay('2026-04-03');
    expect(result).toContain('2026');
    expect(result).toContain('April');
    expect(result).toContain('3');
  });

  test('should return "Date not set" for empty input', () => {
    expect(formatDateForDisplay('')).toBe('Date not set');
    expect(formatDateForDisplay(null)).toBe('Date not set');
    expect(formatDateForDisplay(undefined)).toBe('Date not set');
  });
});

describe('formatDateForFilename', () => {
  test('should return date value when present', () => {
    expect(formatDateForFilename('2026-04-03')).toBe('2026-04-03');
  });

  test('should return "draft" for falsy input', () => {
    expect(formatDateForFilename('')).toBe('draft');
    expect(formatDateForFilename(null)).toBe('draft');
    expect(formatDateForFilename(undefined)).toBe('draft');
  });
});

// ═══════════════════════════════════════
// EDGE CASES & INTEGRATION
// ═══════════════════════════════════════
describe('integration: full workflow', () => {
  test('load state → apply defaults → set inventory → calculate totals', () => {
    const state = createEmptyState();
    applyDefaultPrices(state, SECTIONS);

    // Simulate ordering 2 BROWNIEs (section 0, item 0 — price 76.22)
    getInv(state, 0, 0).order = 2;
    // Simulate ordering 1 MINT CHOCOLATE CHIP (section 5, item 1 — price 60.99)
    getInv(state, 5, 1).order = 1;

    const { totalOrder, orderValue } = calculateTotals(state, SECTIONS);
    expect(totalOrder).toBe(3);
    expect(orderValue).toBeCloseTo(76.22 * 2 + 60.99, 2);
  });

  test('add custom item → set inventory → calculate → remove → recalculate', () => {
    const state = createEmptyState();
    applyDefaultPrices(state, SECTIONS);

    addCustomItem(state, 0, 'special cake', 'CASE');
    const customIdx = SECTIONS[0].items.length;
    setPrice(state, 0, customIdx, 100.00);
    getInv(state, 0, customIdx).order = 3;

    let totals = calculateTotals(state, SECTIONS);
    expect(totals.totalOrder).toBe(3);
    expect(totals.orderValue).toBeCloseTo(300.00, 2);

    removeCustomItem(state, SECTIONS, 0, 0);
    totals = calculateTotals(state, SECTIONS);
    expect(totals.totalOrder).toBe(0);
    expect(totals.orderValue).toBe(0);
  });
});
