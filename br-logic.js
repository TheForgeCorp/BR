// ═══════════════════════════════════════
// Extracted business logic from br-inventory.html
// This module contains pure/testable functions
// ═══════════════════════════════════════

const SECTIONS = [
  {
    name: "BAKERY",
    items: [
      { name: "BROWNIE", unit: "CASE" },
      { name: '9" DOUBLE FUDGE BROWNIE (POLAR PIZZA)', unit: "CASE" },
      { name: '9" CHOCOLATE CHIP COOKIE (POLAR PIZZA)', unit: "CASE" },
    ]
  },
  {
    name: "BEVERAGES",
    items: [
      { name: "STRAWBERRY SMOOTHIE BASE", unit: "CASE" },
      { name: '10 LB. MANGO, IQF, DICED 3/8"', unit: "CASE" },
      { name: '10 LB. STRAWBERRIES, IQF, DICED 3/8"', unit: "CASE" },
      { name: "MANGO SMOOTHIE BASE", unit: "CASE" },
      { name: "CAPPUCCINO BLAST BASE", unit: "CASE" },
    ]
  },
  {
    name: "FLAVOUR OF THE MONTH",
    items: [
      { name: "FLAVOUR OF THE MONTH – THIS MONTH", unit: "TUB" },
      { name: "FLAVOUR OF THE MONTH – NEXT MONTH", unit: "TUB" },
    ]
  },
  {
    name: "CAKE LAYERS",
    items: [
      { name: "SHEET CAKE CHOCOLATE", unit: "CASE" },
      { name: "ROLL CAKE CHOCOLATE", unit: "CASE" },
      { name: "SHEET CAKE WHITE", unit: "CASE" },
    ]
  },
  {
    name: "NO SUGAR ADDED",
    items: [
      { name: "CARAMEL TURTLE NSA DOM", unit: "TUB" },
      { name: "PINEAPPLE COCONUT", unit: "TUB" },
    ]
  },
  {
    name: "PERMANENTS",
    items: [
      { name: "JAMOCA ALMOND FUDGE", unit: "TUB" },
      { name: "MINT CHOCOLATE CHIP", unit: "TUB" },
      { name: "COTTON CANDY", unit: "TUB" },
      { name: "CHOCOLATE CHIP", unit: "TUB" },
      { name: "CHOCOLATE CHIP COOKIE DOUGH", unit: "TUB" },
      { name: "PRALINES N' CREAM", unit: "TUB" },
      { name: "COOKIES N' CREAM", unit: "TUB" },
      { name: "MANGO TANGO", unit: "TUB" },
      { name: "PEANUT BUTTER N' CHOCOLATE", unit: "TUB" },
      { name: "PISTACHIO ALMOND", unit: "TUB" },
      { name: "CHOCOLATE MOUSSE ROYALE", unit: "TUB" },
      { name: "CHOCOLATE", unit: "TUB" },
      { name: "RUM N' RAISIN", unit: "TUB" },
      { name: "ICING ON THE CAKE", unit: "TUB" },
      { name: "GOLD MEDAL RIBBON", unit: "TUB" },
      { name: "STRAWBERRY CHEESECAKE", unit: "TUB" },
      { name: "DECORATING VANILLA", unit: "TUB", disabled: true },
      { name: "ROCKY ROAD", unit: "TUB" },
      { name: "VERY BERRY STRAWBERRY", unit: "TUB" },
      { name: "NON-DAIRY COOKIES N' CREAM", unit: "TUB" },
      { name: "WORLD CLASS CHOCOLATE", unit: "TUB" },
      { name: "VANILLA", unit: "TUB" },
      { name: "CHERRIES JUBILEE", unit: "TUB" },
    ]
  },
  {
    name: "PRE-PACKS",
    items: [
      { name: "PRALINES N' CREAM", unit: "CASE" },
      { name: "MANGO TANGO", unit: "CASE" },
      { name: "WORLD CLASS CHOCOLATE", unit: "CASE" },
      { name: "COTTON CANDY", unit: "CASE" },
      { name: "PEANUT BUTTER N' CHOCOLATE", unit: "CASE" },
      { name: "RAINBOW SHERBERT", unit: "CASE" },
      { name: "COOKIES N' CREAM", unit: "CASE" },
      { name: "GOLD MEDAL RIBBON", unit: "CASE" },
      { name: "JAMOCA ALMOND FUDGE", unit: "CASE" },
      { name: "MINT CHOCOLATE CHIP", unit: "CASE" },
      { name: "CHOCOLATE MOUSE ROYALE", unit: "CASE" },
      { name: "VANILLA", unit: "CASE" },
    ]
  },
  {
    name: "ROTATORS",
    items: [
      { name: "MANGO MANIA DOMESTIC", unit: "TUB" },
      { name: "GERMAN CHOCOLATE CAKE", unit: "TUB" },
      { name: "NUTTY COCONUT", unit: "TUB" },
      { name: "BASEBALL NUT", unit: "TUB" },
      { name: "MAPLE WALNUT", unit: "TUB" },
      { name: "MADE WITH SNICKERS", unit: "TUB" },
      { name: "MOM'S MAKIN' COOKIES", unit: "TUB" },
      { name: "NON-DAIRY MINT CHOCOCHUNK", unit: "TUB" },
      { name: "APPLE CINNAMON FRITTER", unit: "TUB" },
      { name: "PEANUT BUTTER BLOSSOM", unit: "TUB" },
    ]
  },
  {
    name: "SHERBETS",
    items: [
      { name: "RAINBOW SHER FOR DOMESTIC", unit: "TUB" },
      { name: "WILD N RECKLESS DOM", unit: "TUB" },
    ]
  },
  {
    name: "ICE / SORBET",
    items: [
      { name: "CITRUS TWIST", unit: "TUB" },
    ]
  },
  {
    name: "TOPPINGS",
    items: [
      { name: "REESE PEANUT BUTTER CUP (GROUND)", unit: "CASE" },
      { name: "ON TOP TOPPING", unit: "CASE" },
      { name: "COOKIE DOUGH TOPPING", unit: "CASE" },
      { name: "RICH'S TOPPING (WHIP CREAM)", unit: "CASE" },
    ]
  },
  {
    name: "CAKE LAYERS (ROUND)",
    items: [
      { name: 'ROUND CAKE – WHITE – 8.5"', unit: "CASE" },
      { name: 'ROUND CAKE – CHOCOLATE – 8.5"', unit: "CASE" },
    ]
  },
  {
    name: "YOGURTS",
    items: [
      { name: "MAUI BROWNIE MADNESS", unit: "TUB" },
    ]
  },
];

const DEFAULT_PRICES = {
  '_TUB_DEFAULT': 60.99,
  '_PREPACK_DEFAULT': 34.21,
  '9" DOUBLE FUDGE BROWNIE (POLAR PIZZA)': 78.01,
  '9" CHOCOLATE CHIP COOKIE (POLAR PIZZA)': 82.99,
  'STRAWBERRY SMOOTHIE BASE': 52.73,
  "RICH'S TOPPING (WHIP CREAM)": 78.80,
  'BROWNIE': 76.22,
  'MANGO SMOOTHIE BASE': 49.77,
  'CAPPUCCINO BLAST BASE': 66.91,
  'SHEET CAKE CHOCOLATE': 73.34,
  'ROLL CAKE CHOCOLATE': 58.24,
  'SHEET CAKE WHITE': 68.87,
  'REESE PEANUT BUTTER CUP (GROUND)': 67.63,
  'ON TOP TOPPING': 56.39,
  'ROUND CAKE – WHITE – 8.5"': 48.89,
  'ROUND CAKE – CHOCOLATE – 8.5"': 57.76,
  '10 LB. MANGO, IQF, DICED 3/8"': 35.39,
  '10 LB. STRAWBERRIES, IQF, DICED 3/8"': 37.36,
};

const LS_KEYS = {
  inventory:   'br_inventory',
  prices:      'br_prices',
  customItems: 'br_custom_items',
  staffDate:   'br_staff_date',
};

// ── State management (pure logic) ──

function createEmptyState() {
  return { inventory: {}, prices: {}, customItems: {} };
}

function loadStateFromStorage(storage) {
  try {
    return {
      inventory:   JSON.parse(storage.getItem(LS_KEYS.inventory))   || {},
      prices:      JSON.parse(storage.getItem(LS_KEYS.prices))      || {},
      customItems: JSON.parse(storage.getItem(LS_KEYS.customItems)) || {},
    };
  } catch(e) {
    return createEmptyState();
  }
}

function getInv(state, si, ii) {
  if (!state.inventory[si]) state.inventory[si] = {};
  if (!state.inventory[si][ii]) state.inventory[si][ii] = { have: 0, order: 0 };
  return state.inventory[si][ii];
}

function getPrice(state, si, ii) {
  if (!state.prices[si]) state.prices[si] = {};
  return state.prices[si][ii] || 0;
}

function setPrice(state, si, ii, val) {
  if (!state.prices[si]) state.prices[si] = {};
  state.prices[si][ii] = val;
}

function getCustomItems(state, si) {
  if (!state.customItems[si]) state.customItems[si] = [];
  return state.customItems[si];
}

function applyDefaultPrices(state, sections) {
  let changed = false;
  sections.forEach((section, si) => {
    if (!state.prices[si]) state.prices[si] = {};
    section.items.forEach((item, ii) => {
      if (state.prices[si][ii] !== undefined && state.prices[si][ii] !== null) return;
      if (DEFAULT_PRICES[item.name] !== undefined) {
        state.prices[si][ii] = DEFAULT_PRICES[item.name];
        changed = true;
      } else if (section.name === 'PRE-PACKS') {
        state.prices[si][ii] = DEFAULT_PRICES['_PREPACK_DEFAULT'];
        changed = true;
      } else if (item.unit === 'TUB') {
        state.prices[si][ii] = DEFAULT_PRICES['_TUB_DEFAULT'];
        changed = true;
      }
    });
  });
  return changed;
}

// ── Calculations ──

function calculateTotals(state, sections) {
  let totalOrder = 0;
  let orderValue = 0;
  sections.forEach((section, si) => {
    const allItems = [...section.items, ...getCustomItems(state, si)];
    allItems.forEach((_, ii) => {
      const ord = getInv(state, si, ii).order || 0;
      totalOrder += ord;
      orderValue += getPrice(state, si, ii) * ord;
    });
  });
  return { totalOrder, orderValue };
}

function calculateLineTotal(price, orderQty) {
  return price * orderQty;
}

// ── Input parsing ──

function parseInventoryValue(val) {
  return Math.max(0, parseInt(val) || 0);
}

function parsePriceValue(val) {
  return Math.max(0, parseFloat(val) || 0);
}

// ── Text formatting (for WhatsApp export) ──

function padR(s, n) {
  s = String(s);
  return s.length >= n ? s.slice(0, n) : s + ' '.repeat(n - s.length);
}

function padL(s, n) {
  s = String(s);
  return s.length >= n ? s.slice(0, n) : ' '.repeat(n - s.length) + s;
}

function formatCurrency(v) {
  return '$' + v.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildWhatsAppMessage(state, sections, dateStr, staffVal) {
  let msg = `*BASKIN-ROBBINS PRODUCT ORDER*\n`;
  msg += `${dateStr}\n`;
  if (staffVal) msg += `${staffVal}\n`;

  let grandOrder = 0;

  sections.forEach((section, si) => {
    const allItems = [...section.items, ...getCustomItems(state, si)];
    const rows = [];

    allItems.forEach((item, ii) => {
      if (item.disabled) return;
      const inv = getInv(state, si, ii);
      const have = inv.have || 0;
      const order = inv.order || 0;
      grandOrder += order;
      const name = item.name.length > 22 ? item.name.slice(0, 21) + '…' : item.name;
      rows.push({ name, have, order });
    });

    if (rows.length > 0) {
      msg += `\n*${section.name}*\n`;
      msg += '```\n';
      msg += padR('Item', 22) + padL('H', 4) + padL('O', 4) + '\n';
      msg += '─'.repeat(30) + '\n';
      rows.forEach(r => {
        msg += padR(r.name, 22) + padL(r.have, 4) + padL(r.order, 4) + '\n';
      });
      msg += '```\n';
    }
  });

  let orderValue = 0;
  sections.forEach((section, si) => {
    [...section.items, ...getCustomItems(state, si)].forEach((item, ii) => {
      if (item.disabled) return;
      orderValue += getPrice(state, si, ii) * (getInv(state, si, ii).order || 0);
    });
  });

  msg += `\n*────────────────────*\n`;
  msg += `*TOTAL TO ORDER: ${grandOrder} units*\n`;
  if (orderValue > 0) msg += `\n*ORDER VALUE: ${formatCurrency(orderValue)}*\n`;

  return { msg, grandOrder, orderValue };
}

// ── Custom item management ──

function addCustomItem(state, si, name, unit) {
  const customs = getCustomItems(state, si);
  customs.push({ name: name.toUpperCase(), unit });
}

function removeCustomItem(state, sections, si, customIdx) {
  const customs = getCustomItems(state, si);
  const baseCount = sections[si].items.length;
  const globalIdx = baseCount + customIdx;

  customs.splice(customIdx, 1);

  const invSection = state.inventory[si] || {};
  const priceSection = state.prices[si] || {};

  for (let i = globalIdx; ; i++) {
    if (invSection[i + 1] !== undefined) {
      invSection[i] = invSection[i + 1];
    } else {
      delete invSection[i];
      break;
    }
  }
  for (let i = globalIdx; ; i++) {
    if (priceSection[i + 1] !== undefined) {
      priceSection[i] = priceSection[i + 1];
    } else {
      delete priceSection[i];
      break;
    }
  }
}

// ── Date formatting ──

function formatDateForDisplay(dateVal) {
  if (!dateVal) return 'Date not set';
  return new Date(dateVal + 'T00:00:00').toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function formatDateForFilename(dateVal) {
  return dateVal || 'draft';
}

module.exports = {
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
};
