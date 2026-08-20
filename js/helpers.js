/* ==========================================================================
 * helpers.js — pure functions shared by the UI modules:
 * menu flattening (loops, no recursion), sorting, filtering, formatting.
 * ========================================================================== */
(function (NS) {
  'use strict';

  /**
   * Flatten the 3-level menu into visible render rows.
   *
   * Deliberately NON-recursive: two explicit nested for-loops walk the two
   * group levels, and level-3 report leaves are emitted inside the level-2
   * iteration. Same constraint as the big app.
   *
   * @returns {Array<{node:Object, depth:number, isExpanded:boolean}>}
   */
  function flattenMenu(menu, expandedIds) {
    var rows = [];
    for (var i = 0; i < menu.length; i += 1) {
      var level1 = menu[i];
      var level1Expanded = expandedIds.indexOf(level1.id) !== -1;
      rows.push({ node: level1, depth: 0, isExpanded: level1Expanded });
      if (level1.type !== 'group' || !level1Expanded) continue;

      var level1Children = level1.children || [];
      for (var j = 0; j < level1Children.length; j += 1) {
        var level2 = level1Children[j];
        var level2Expanded = expandedIds.indexOf(level2.id) !== -1;
        rows.push({ node: level2, depth: 1, isExpanded: level2Expanded });
        if (level2.type !== 'group' || !level2Expanded) continue;

        // Level 3: always report leaves — emitted right here, no recursion.
        var level2Children = level2.children || [];
        for (var k = 0; k < level2Children.length; k += 1) {
          rows.push({ node: level2Children[k], depth: 2, isExpanded: false });
        }
      }
    }
    return rows;
  }

  /** Find a node by id with the same bounded 3-level loops. Returns null. */
  function findNode(menu, id) {
    for (var i = 0; i < menu.length; i += 1) {
      if (menu[i].id === id) return menu[i];
      var kids = menu[i].children || [];
      for (var j = 0; j < kids.length; j += 1) {
        if (kids[j].id === id) return kids[j];
        var grandkids = kids[j].children || [];
        for (var k = 0; k < grandkids.length; k += 1) {
          if (grandkids[k].id === id) return grandkids[k];
        }
      }
    }
    return null;
  }

  var NUMERIC_TYPES = { price: true, number: true, pct: true };

  /** Stable, type-aware sort. direction: 'asc' | 'desc'. */
  function sortRows(rows, columnKey, direction, columns) {
    if (!columnKey) return rows.slice();
    var type = 'string';
    for (var c = 0; c < columns.length; c += 1) {
      if (columns[c].key === columnKey) { type = columns[c].type; break; }
    }
    var numeric = NUMERIC_TYPES[type] === true;
    var sign = direction === 'desc' ? -1 : 1;

    // decorate with the original index to keep the sort stable everywhere
    var decorated = rows.map(function (row, index) { return { row: row, index: index }; });
    decorated.sort(function (a, b) {
      var av = a.row[columnKey];
      var bv = b.row[columnKey];
      var cmp;
      if (numeric) {
        cmp = Number(av) - Number(bv);
        if (isNaN(cmp)) cmp = 0;
      } else {
        cmp = String(av == null ? '' : av).localeCompare(String(bv == null ? '' : bv));
      }
      return cmp !== 0 ? sign * cmp : a.index - b.index;
    });
    return decorated.map(function (d) { return d.row; });
  }

  /**
   * Per-column filters, ANDed. Strings: case-insensitive substring.
   * Numeric columns additionally understand >x <x >=x <=x =x prefixes,
   * falling back to substring when the expression is malformed.
   */
  function filterRows(rows, filters, columns) {
    var active = [];
    for (var c = 0; c < columns.length; c += 1) {
      var key = columns[c].key;
      var text = (filters[key] || '').trim();
      if (text) active.push({ key: key, text: text, numeric: NUMERIC_TYPES[columns[c].type] === true });
    }
    if (!active.length) return rows.slice();

    return rows.filter(function (row) {
      for (var f = 0; f < active.length; f += 1) {
        if (!matches(row[active[f].key], active[f])) return false;
      }
      return true;
    });
  }

  function matches(value, filter) {
    if (filter.numeric) {
      var m = /^(>=|<=|>|<|=)\s*(-?\d+(?:\.\d+)?)$/.exec(filter.text);
      if (m) {
        var operand = Number(m[2]);
        var num = Number(value);
        if (isNaN(num)) return false;
        switch (m[1]) {
          case '>':  return num > operand;
          case '<':  return num < operand;
          case '>=': return num >= operand;
          case '<=': return num <= operand;
          default:   return num === operand;
        }
      }
      // malformed or plain text -> substring on the raw value
    }
    return String(value == null ? '' : value).toLowerCase()
      .indexOf(filter.text.toLowerCase()) !== -1;
  }

  /** Format one cell for display, by column type. */
  function formatCell(value, type) {
    if (value === null || value === undefined) return '';
    switch (type) {
      case 'price':
        return Number(value).toLocaleString('en-US', {
          minimumFractionDigits: 2, maximumFractionDigits: 4
        });
      case 'pct': {
        var n = Number(value);
        return (n > 0 ? '+' : '') + n.toFixed(2) + '%';
      }
      case 'number':
        return Number(value).toLocaleString('en-US');
      default:
        return String(value);
    }
  }

  /** HH:MM:SS local clock string. */
  function formatClock(date) {
    function pad(n) { return String(n).length < 2 ? '0' + n : String(n); }
    return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
  }

  NS.helpers = {
    flattenMenu: flattenMenu,
    findNode: findNode,
    sortRows: sortRows,
    filterRows: filterRows,
    formatCell: formatCell,
    formatClock: formatClock
  };
}(window.RetroTerminal = window.RetroTerminal || {}));
