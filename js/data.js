/* ==========================================================================
 * data.js — static mock data module.
 *
 * Every js/ file is a native ES module: it runs once, top-level declarations
 * stay private to the file, and only what is `export`ed is visible elsewhere.
 * The browser resolves the whole graph from js/app.js — no bundler, and no
 * reliance on script order.
 * ========================================================================== */

var USER = {
  name: 'Vinnie "Two Screens" Marchetti',
  role: 'Head of Flow Trading',
  desk: 'Global Macro - Desk 7 (a.k.a. The Pit)'
};

/* 3-level menu: groups may contain groups; reports are leaves.
 * transport: 'live' rows tick via the fake feed; 'eod' rows are static. */
var MENU = [
  { id: 'markets', label: 'Markets', type: 'group', children: [
    { id: 'fx', label: 'FX', type: 'group', children: [
      { id: 'fx-spot', label: 'FX Spot', type: 'report', transport: 'live' },
      { id: 'fx-forwards', label: 'FX Forwards', type: 'report', transport: 'eod' }
    ] },
    { id: 'rates', label: 'Rates', type: 'group', children: [
      { id: 'govt-bonds', label: 'Govt Bonds', type: 'report', transport: 'live' },
      { id: 'irs-curve', label: 'IRS Curve', type: 'report', transport: 'eod' }
    ] }
  ] },
  { id: 'derivatives', label: 'Derivatives', type: 'group', children: [
    { id: 'swaps', label: 'Swaps', type: 'report', transport: 'eod' },
    { id: 'commodities', label: 'Commodities', type: 'group', children: [
      { id: 'energy', label: 'Energy', type: 'report', transport: 'live' },
      { id: 'metals', label: 'Metals', type: 'report', transport: 'eod' }
    ] }
  ] },
  { id: 'equities', label: 'Equities', type: 'group', children: [
    { id: 'stocks', label: 'Stocks', type: 'report', transport: 'live' },
    { id: 'etfs', label: 'ETFs', type: 'report', transport: 'eod' }
  ] }
];

/* Column types drive alignment, formatting, sorting and filtering:
 * 'string' | 'price' | 'number' | 'pct' */
function col(key, label, type) { return { key: key, label: label, type: type }; }

var CHANGE_COLS = [col('chg', 'Chg', 'number'), col('chgPct', 'Chg %', 'pct')];

function rows(fields, data) {
  var out = [];
  for (var i = 0; i < data.length; i += 1) {
    var row = { id: 'r' + i };
    for (var f = 0; f < fields.length; f += 1) row[fields[f]] = data[i][f];
    out.push(row);
  }
  return out;
}

var REPORTS = {
  'fx-spot': {
    columns: [col('pair', 'Pair', 'string'), col('bid', 'Bid', 'price'),
              col('ask', 'Ask', 'price'), col('mid', 'Mid', 'price')].concat(CHANGE_COLS),
    rows: rows(['pair', 'bid', 'ask', 'mid', 'chg', 'chgPct'], [
      ['EUR/USD', 1.0841, 1.0843, 1.0842, -0.0074, -0.68],
      ['GBP/USD', 1.2716, 1.2720, 1.2718,  0.0100,  0.79],
      ['USD/JPY', 148.32, 148.34, 148.33, -1.1400, -0.77],
      ['USD/CHF', 0.8801, 0.8803, 0.8802, -0.0055, -0.62],
      ['AUD/USD', 0.6612, 0.6614, 0.6613, -0.0052, -0.78],
      ['NZD/USD', 0.6021, 0.6023, 0.6022, -0.0054, -0.89],
      ['USD/CAD', 1.3641, 1.3643, 1.3642,  0.0068,  0.50],
      ['EUR/GBP', 0.8524, 0.8526, 0.8525,  0.0075,  0.88],
      ['EUR/JPY', 160.80, 160.82, 160.81, -0.6600, -0.41],
      ['GBP/JPY', 188.62, 188.64, 188.63, -0.6800, -0.36],
      ['USD/SEK', 10.481, 10.483, 10.482, -0.0580, -0.55],
      ['USD/MXN', 17.081, 17.083, 17.082,  0.0650,  0.38]
    ])
  },
  'fx-forwards': {
    columns: [col('pair', 'Pair', 'string'), col('tenor', 'Tenor', 'string'),
              col('points', 'Points', 'number'), col('fwdRate', 'Fwd Rate', 'price')],
    rows: rows(['pair', 'tenor', 'points', 'fwdRate'], [
      ['EUR/USD', '1M', 11.8, 1.0854], ['EUR/USD', '3M', 34.2, 1.0876],
      ['EUR/USD', '6M', 66.5, 1.0909], ['GBP/USD', '1M', -6.4, 1.2712],
      ['GBP/USD', '3M', -18.9, 1.2699], ['USD/JPY', '1M', -58.2, 147.74],
      ['USD/JPY', '3M', -171.4, 146.62], ['USD/CHF', '1M', -22.1, 0.8780],
      ['AUD/USD', '3M', 8.8, 0.6622], ['USD/CAD', '3M', -12.5, 1.3630]
    ])
  },
  'govt-bonds': {
    columns: [col('instrument', 'Instrument', 'string'), col('coupon', 'Coupon', 'pct'),
              col('price', 'Price', 'price'), col('yield', 'Yield', 'pct')].concat(CHANGE_COLS),
    rows: rows(['instrument', 'coupon', 'price', 'yield', 'chg', 'chgPct'], [
      ['UST 2Y',  4.25,  99.84, 4.33,  0.05,  0.05],
      ['UST 5Y',  4.00, 100.22, 3.95, -0.11, -0.11],
      ['UST 10Y', 3.88,  99.61, 3.93,  0.14,  0.14],
      ['UST 30Y', 4.13, 100.94, 4.07, -0.22, -0.22],
      ['Bund 10Y', 2.30, 99.12, 2.40,  0.08,  0.08],
      ['OAT 10Y',  2.75, 98.44, 2.94, -0.06, -0.06],
      ['BTP 10Y',  3.85, 99.05, 3.97,  0.19,  0.19],
      ['Gilt 10Y', 4.00, 98.71, 4.16, -0.09, -0.09],
      ['JGB 10Y',  0.80, 99.90, 0.81,  0.01,  0.01]
    ])
  },
  'irs-curve': {
    columns: [col('instrument', 'Instrument', 'string'), col('ccy', 'Ccy', 'string'),
              col('tenor', 'Tenor', 'string'), col('rate', 'Rate', 'pct')],
    rows: rows(['instrument', 'ccy', 'tenor', 'rate'], [
      ['USD IRS 1Y', 'USD', '1Y', 4.05], ['USD IRS 2Y', 'USD', '2Y', 3.82],
      ['USD IRS 5Y', 'USD', '5Y', 3.60], ['USD IRS 10Y', 'USD', '10Y', 3.68],
      ['EUR IRS 2Y', 'EUR', '2Y', 2.28], ['EUR IRS 5Y', 'EUR', '5Y', 2.39],
      ['EUR IRS 10Y', 'EUR', '10Y', 2.58], ['GBP IRS 5Y', 'GBP', '5Y', 3.76],
      ['GBP IRS 10Y', 'GBP', '10Y', 3.83], ['JPY IRS 10Y', 'JPY', '10Y', 1.01]
    ])
  },
  swaps: {
    columns: [col('instrument', 'Instrument', 'string'), col('ccy', 'Ccy', 'string'),
              col('tenor', 'Tenor', 'string'), col('bid', 'Bid', 'pct'),
              col('ask', 'Ask', 'pct'), col('mid', 'Mid', 'pct')],
    rows: rows(['instrument', 'ccy', 'tenor', 'bid', 'ask', 'mid'], [
      ['USD SOFR OIS 1Y', 'USD', '1Y', 4.10, 4.14, 4.12],
      ['USD SOFR OIS 2Y', 'USD', '2Y', 3.84, 3.88, 3.86],
      ['USD SOFR OIS 5Y', 'USD', '5Y', 3.62, 3.66, 3.64],
      ['USD SOFR OIS 10Y', 'USD', '10Y', 3.69, 3.73, 3.71],
      ['EUR ESTR OIS 2Y', 'EUR', '2Y', 2.29, 2.33, 2.31],
      ['EUR ESTR OIS 10Y', 'EUR', '10Y', 2.59, 2.63, 2.61],
      ['GBP SONIA OIS 5Y', 'GBP', '5Y', 3.76, 3.80, 3.78],
      ['JPY TONA OIS 10Y', 'JPY', '10Y', 1.00, 1.04, 1.02]
    ])
  },
  energy: {
    columns: [col('instrument', 'Instrument', 'string'), col('unit', 'Unit', 'string'),
              col('price', 'Last', 'price')].concat(CHANGE_COLS),
    rows: rows(['instrument', 'unit', 'price', 'chg', 'chgPct'], [
      ['WTI Crude', 'USD/bbl', 78.42,  0.63,  0.81],
      ['Brent Crude', 'USD/bbl', 82.15, -0.44, -0.53],
      ['Henry Hub Gas', 'USD/MMBtu', 2.18, 0.04, 1.87],
      ['TTF Gas', 'EUR/MWh', 34.62, -0.85, -2.40],
      ['Gasoline RBOB', 'USD/gal', 2.41, 0.02, 0.84],
      ['Heating Oil', 'USD/gal', 2.87, -0.03, -1.04],
      ['EUA Carbon', 'EUR/t', 66.20, 0.55, 0.84]
    ])
  },
  metals: {
    columns: [col('instrument', 'Instrument', 'string'), col('unit', 'Unit', 'string'),
              col('price', 'Last', 'price')].concat(CHANGE_COLS),
    rows: rows(['instrument', 'unit', 'price', 'chg', 'chgPct'], [
      ['Gold', 'USD/oz', 2412.30, 8.20, 0.34],
      ['Silver', 'USD/oz', 28.94, -0.22, -0.75],
      ['Platinum', 'USD/oz', 968.50, 4.10, 0.43],
      ['Copper', 'USD/t', 9284.00, -56.00, -0.60],
      ['Aluminium', 'USD/t', 2312.50, 12.00, 0.52],
      ['Zinc', 'USD/t', 2716.00, -18.50, -0.68]
    ])
  },
  stocks: {
    columns: [col('symbol', 'Symbol', 'string'), col('name', 'Name', 'string'),
              col('price', 'Last', 'price')].concat(CHANGE_COLS)
              .concat([col('volume', 'Volume', 'number')]),
    rows: rows(['symbol', 'name', 'price', 'chg', 'chgPct', 'volume'], [
      ['AAPL', 'Apple Inc.', 228.12, 1.84, 0.81, 48212300],
      ['MSFT', 'Microsoft Corp.', 447.63, -2.11, -0.47, 21908400],
      ['NVDA', 'NVIDIA Corp.', 128.44, 3.02, 2.41, 301244800],
      ['AMZN', 'Amazon.com Inc.', 186.29, 0.94, 0.51, 39012100],
      ['GOOGL', 'Alphabet Inc.', 178.85, -1.22, -0.68, 25467900],
      ['META', 'Meta Platforms', 511.72, 4.86, 0.96, 12984200],
      ['TSLA', 'Tesla Inc.', 246.38, -5.14, -2.04, 88123400],
      ['JPM', 'JPMorgan Chase', 208.44, 0.77, 0.37, 8452100],
      ['GS', 'Goldman Sachs', 512.63, 2.35, 0.46, 1984200],
      ['XOM', 'Exxon Mobil', 114.28, -0.41, -0.36, 14208800]
    ])
  },
  etfs: {
    columns: [col('symbol', 'Symbol', 'string'), col('name', 'Name', 'string'),
              col('price', 'Last', 'price')].concat(CHANGE_COLS)
              .concat([col('aum', 'AUM ($B)', 'number')]),
    rows: rows(['symbol', 'name', 'price', 'chg', 'chgPct', 'aum'], [
      ['SPY', 'SPDR S&P 500', 561.24, 2.14, 0.38, 512.4],
      ['QQQ', 'Invesco QQQ', 484.16, 3.61, 0.75, 284.7],
      ['IWM', 'iShares Russell 2000', 218.35, -1.02, -0.46, 68.2],
      ['GLD', 'SPDR Gold Shares', 224.36, 0.84, 0.38, 64.9],
      ['TLT', 'iShares 20+ Yr Treasury', 93.45, -0.31, -0.33, 48.3],
      ['XLE', 'Energy Select SPDR', 92.34, -0.52, -0.56, 36.4],
      ['XLK', 'Technology Select SPDR', 231.56, 1.87, 0.81, 58.9]
    ])
  }
};

export { USER, MENU, REPORTS };
