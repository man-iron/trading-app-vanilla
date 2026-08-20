/* ==========================================================================
 * feed.js — LiveFeed class: a fake WebSocket.
 *
 * Every 900-1500ms it drifts 1-4 random rows of the active LIVE report and
 * hands the changes to a callback, shaped like a WS tick message:
 *   { updates: [{ id, changes: { colKey: newValue } }] }
 * Pause buffers nothing here — the table simply stops being told (same
 * "client decides" idea as the big app, minus the buffering).
 * ========================================================================== */
(function (NS) {
  'use strict';

  var PRICE_KEYS = { bid: true, ask: true, mid: true, price: true, rate: true, yield: true };

  class LiveFeed {
    /** @param {function} onTick callback receiving { updates } */
    constructor(onTick) {
      this.onTick = onTick;
      this.rows = null;      // working copy of the active report's rows
      this.columns = null;
      this.timer = null;
      this.paused = false;
      this.tick = this.tick.bind(this);
    }

    /** Start ticking a report (stops any previous one). */
    start(columns, rows) {
      this.stop();
      this.columns = columns;
      this.rows = rows.map(function (r) { var c = {}; for (var k in r) c[k] = r[k]; return c; });
      this.paused = false;
      this.schedule();
    }

    stop() {
      if (this.timer) { clearTimeout(this.timer); this.timer = null; }
      this.rows = null;
    }

    setPaused(paused) { this.paused = paused; }

    schedule() {
      var delay = 900 + Math.floor(Math.random() * 600);
      this.timer = setTimeout(this.tick, delay);
    }

    tick() {
      if (!this.rows) return;
      if (!this.paused) {
        var updates = [];
        var count = 1 + Math.floor(Math.random() * 4);
        for (var u = 0; u < count; u += 1) {
          var row = this.rows[Math.floor(Math.random() * this.rows.length)];
          var changes = this.driftRow(row);
          if (changes) updates.push({ id: row.id, changes: changes });
        }
        if (updates.length) this.onTick({ updates: updates });
      }
      this.schedule();
    }

    /** Drift price-like fields ±0.15% and keep chg/chgPct plausible. */
    driftRow(row) {
      var changes = null;
      for (var key in row) {
        if (!PRICE_KEYS[key] || typeof row[key] !== 'number') continue;
        var factor = 1 + (Math.random() - 0.5) * 0.003;
        var decimals = row[key] < 10 ? 4 : 2;
        var next = Number((row[key] * factor).toFixed(decimals));
        if (next !== row[key]) {
          changes = changes || {};
          var delta = next - row[key];
          row[key] = next;
          changes[key] = next;
          if (typeof row.chg === 'number') {
            row.chg = Number((row.chg + delta).toFixed(decimals));
            changes.chg = row.chg;
          }
          if (typeof row.chgPct === 'number') {
            row.chgPct = Number((row.chgPct + (factor - 1) * 100).toFixed(2));
            changes.chgPct = row.chgPct;
          }
        }
      }
      return changes;
    }
  }

  NS.LiveFeed = LiveFeed;
}(window.RetroTerminal = window.RetroTerminal || {}));
