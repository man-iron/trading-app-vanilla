/* ==========================================================================
 * table.js — ReportTable component class.
 *
 * Owns its LOCAL state (sort + per-column filters) exactly like the
 * presentational component in the big app; the store only tells it which
 * report to show. Live ticks come in via applyTicks() and flash the cells.
 * ========================================================================== */
(function (NS) {
  'use strict';

  var helpers = NS.helpers;
  var NUMERIC = { price: true, number: true, pct: true };

  class ReportTable {
    /** @param {HTMLElement} el mount point */
    constructor(el) {
      this.el = el;
      this.columns = [];
      this.rows = [];
      this.sortKey = null;
      this.sortDirection = 'asc';
      this.filters = {};
      this.handleHeaderClick = this.handleHeaderClick.bind(this);
      this.handleFilterInput = this.handleFilterInput.bind(this);
      this.el.addEventListener('click', this.handleHeaderClick);
      this.el.addEventListener('input', this.handleFilterInput);
    }

    /** Swap in a whole new report; resets local sort/filter state. */
    setReport(columns, rows) {
      this.columns = columns;
      this.rows = rows.map(function (r) { var c = {}; for (var k in r) c[k] = r[k]; return c; });
      this.sortKey = null;
      this.sortDirection = 'asc';
      this.filters = {};
      this.render();
    }

    /** Merge live tick changes into rows, re-render, flash changed cells. */
    applyTicks(updates) {
      var changedCells = {}; // rowId -> { colKey: true }
      for (var u = 0; u < updates.length; u += 1) {
        var update = updates[u];
        for (var r = 0; r < this.rows.length; r += 1) {
          if (this.rows[r].id !== update.id) continue;
          changedCells[update.id] = changedCells[update.id] || {};
          for (var key in update.changes) {
            this.rows[r][key] = update.changes[key];
            changedCells[update.id][key] = true;
          }
        }
      }
      this.render(changedCells);
    }

    handleHeaderClick(event) {
      var th = event.target.closest('th[data-key]');
      if (!th || event.target.closest('.grid__filter-cell')) return;
      var key = th.getAttribute('data-key');
      if (this.sortKey === key) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortKey = key;
        this.sortDirection = 'asc';
      }
      this.render();
    }

    handleFilterInput(event) {
      var input = event.target.closest('.grid__filter');
      if (!input) return;
      this.filters[input.getAttribute('data-key')] = input.value;
      this.render(null, /* keepFocus */ input.getAttribute('data-key'));
    }

    /** Filter -> sort -> paint. Optionally flashes cells / restores focus. */
    render(flashCells, focusKey) {
      var visible = helpers.filterRows(this.rows, this.filters, this.columns);
      visible = helpers.sortRows(visible, this.sortKey, this.sortDirection, this.columns);

      var table = document.createElement('table');
      table.className = 'grid';
      table.appendChild(this.renderHead());
      table.appendChild(this.renderBody(visible, flashCells));
      this.el.innerHTML = '';
      this.el.appendChild(table);

      var footer = document.createElement('div');
      footer.className = 'grid__footer';
      footer.textContent = visible.length + ' of ' + this.rows.length + ' rows';
      this.el.appendChild(footer);

      // typing in a filter re-renders the table — put the caret back
      if (focusKey) {
        var input = this.el.querySelector('.grid__filter[data-key="' + focusKey + '"]');
        if (input) {
          var end = input.value.length;
          input.focus();
          input.setSelectionRange(end, end);
        }
      }
    }

    renderHead() {
      var thead = document.createElement('thead');

      var labelRow = document.createElement('tr');
      for (var c = 0; c < this.columns.length; c += 1) {
        var column = this.columns[c];
        var th = document.createElement('th');
        th.setAttribute('data-key', column.key);
        if (NUMERIC[column.type]) th.className = 'num';
        th.textContent = column.label;
        if (this.sortKey === column.key) {
          var arrow = document.createElement('span');
          arrow.className = 'grid__arrow';
          arrow.textContent = this.sortDirection === 'asc' ? '▲' : '▼';
          th.appendChild(arrow);
        }
        labelRow.appendChild(th);
      }
      thead.appendChild(labelRow);

      var filterRow = document.createElement('tr');
      for (var f = 0; f < this.columns.length; f += 1) {
        var cell = document.createElement('th');
        cell.className = 'grid__filter-cell';
        var input = document.createElement('input');
        input.className = 'grid__filter';
        input.setAttribute('data-key', this.columns[f].key);
        input.setAttribute('placeholder', 'Filter');
        input.setAttribute('aria-label', 'Filter ' + this.columns[f].label);
        input.value = this.filters[this.columns[f].key] || '';
        cell.appendChild(input);
        filterRow.appendChild(cell);
      }
      thead.appendChild(filterRow);
      return thead;
    }

    renderBody(visibleRows, flashCells) {
      var tbody = document.createElement('tbody');
      for (var r = 0; r < visibleRows.length; r += 1) {
        var row = visibleRows[r];
        var tr = document.createElement('tr');
        for (var c = 0; c < this.columns.length; c += 1) {
          var column = this.columns[c];
          var td = document.createElement('td');
          var classes = [];
          if (NUMERIC[column.type]) classes.push('num');
          if (column.type === 'pct') {
            var n = Number(row[column.key]);
            if (n > 0) classes.push('up');
            if (n < 0) classes.push('down');
          }
          if (flashCells && flashCells[row.id] && flashCells[row.id][column.key]) {
            classes.push('flash');
          }
          td.className = classes.join(' ');
          td.textContent = helpers.formatCell(row[column.key], column.type);
          tr.appendChild(td);
        }
        tbody.appendChild(tr);
      }
      return tbody;
    }
  }

  NS.ReportTable = ReportTable;
}(window.RetroTerminal = window.RetroTerminal || {}));
