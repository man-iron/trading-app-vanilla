/* ==========================================================================
 * statusbar.js — StatusBar class: user // desk // role, selected report,
 * and a ticking clock (classic setInterval-in-the-component pattern).
 * ========================================================================== */

import * as helpers from './helpers.js';

class StatusBar {
  /**
   * @param {HTMLElement} el mount point (the <footer>)
   * @param {Store} store
   * @param {Object} user
   * @param {Array} menu  used to resolve the selected report's label
   */
  constructor(el, store, user, menu) {
    this.el = el;
    this.user = user;
    this.menu = menu;
    this.store = store;
    this.clockEl = null;

    var self = this;
    store.subscribe(function (state, patch) {
      if ('selectedReportId' in patch) self.render();
    });
    this.render();

    // the retro clock: one interval, updates a single text node
    this.intervalId = setInterval(function () {
      if (self.clockEl) self.clockEl.textContent = helpers.formatClock(new Date());
    }, 1000);
  }

  destroy() { clearInterval(this.intervalId); }

  render() {
    var selectedId = this.store.state.selectedReportId;
    var node = selectedId ? helpers.findNode(this.menu, selectedId) : null;

    var bar = document.createElement('div');
    bar.className = 'statusbar';

    var userSection = document.createElement('div');
    userSection.className = 'statusbar__section';
    userSection.innerHTML =
      '<span class="statusbar__name"></span><span class="statusbar__sep">//</span>' +
      '<span></span><span class="statusbar__sep">//</span><span></span>';
    var slots = userSection.querySelectorAll('span');
    slots[0].textContent = this.user.name;
    slots[2].textContent = this.user.desk;
    slots[4].textContent = this.user.role;
    bar.appendChild(userSection);

    var reportSection = document.createElement('div');
    reportSection.className = 'statusbar__section';
    var label = document.createElement('span');
    label.className = 'statusbar__label';
    label.textContent = 'RPT';
    reportSection.appendChild(label);
    var value = document.createElement('span');
    value.className = node ? 'statusbar__report' : 'statusbar__placeholder';
    value.textContent = node ? node.label.toUpperCase() : 'NO REPORT';
    reportSection.appendChild(value);
    bar.appendChild(reportSection);

    var clockSection = document.createElement('div');
    clockSection.className = 'statusbar__section';
    this.clockEl = document.createElement('time');
    this.clockEl.className = 'statusbar__clock';
    this.clockEl.textContent = helpers.formatClock(new Date());
    clockSection.appendChild(this.clockEl);
    bar.appendChild(clockSection);

    this.el.innerHTML = '';
    this.el.appendChild(bar);
  }
}

export { StatusBar };
