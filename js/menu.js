/* ==========================================================================
 * menu.js — TreeMenu component class.
 *
 * Renders the flattened menu (see helpers.flattenMenu — loops, no recursion)
 * into a <ul>, and dispatches expand/select through the store.
 * ========================================================================== */

import * as helpers from './helpers.js';

class TreeMenu {
  /**
   * @param {HTMLElement} el    mount point (the <nav>)
   * @param {Store} store       shared store
   * @param {Array} menu        3-level menu data
   */
  constructor(el, store, menu) {
    this.el = el;
    this.store = store;
    this.menu = menu;
    this.handleClick = this.handleClick.bind(this);

    // one delegated listener instead of one per row
    this.el.addEventListener('click', this.handleClick);
    var self = this;
    store.subscribe(function (state, patch) {
      // re-render only when something the menu shows has changed
      if ('expandedIds' in patch || 'selectedReportId' in patch) self.render();
    });
    this.render();
  }

  handleClick(event) {
    var rowEl = event.target.closest('[data-id]');
    if (!rowEl) return;
    var node = helpers.findNode(this.menu, rowEl.getAttribute('data-id'));
    if (!node) return;

    if (node.type === 'group') {
      var expanded = this.store.state.expandedIds.slice();
      var at = expanded.indexOf(node.id);
      if (at === -1) expanded.push(node.id); else expanded.splice(at, 1);
      this.store.setState({ expandedIds: expanded });
    } else {
      this.store.setState({ selectedReportId: node.id });
    }
  }

  render() {
    var state = this.store.state;
    var rows = helpers.flattenMenu(this.menu, state.expandedIds);
    var list = document.createElement('ul');
    list.className = 'menu';

    for (var i = 0; i < rows.length; i += 1) {
      var entry = rows[i];
      var node = entry.node;
      var isGroup = node.type === 'group';

      var button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('data-id', node.id);
      button.style.setProperty('--depth', String(entry.depth));
      button.className = 'menu__row'
        + (isGroup ? ' menu__row--group' : '')
        + (node.id === state.selectedReportId ? ' menu__row--selected' : '');
      if (isGroup) button.setAttribute('aria-expanded', String(entry.isExpanded));

      var twisty = document.createElement('span');
      twisty.className = 'menu__twisty';
      twisty.textContent = isGroup ? (entry.isExpanded ? '▾' : '▸') : '';
      button.appendChild(twisty);

      var label = document.createElement('span');
      label.className = 'menu__label';
      label.textContent = node.label;
      button.appendChild(label);

      if (!isGroup) {
        var badge = document.createElement('span');
        badge.className = 'menu__badge' + (node.transport === 'live' ? ' menu__badge--live' : '');
        badge.textContent = node.transport === 'live' ? 'LIVE' : 'EOD';
        button.appendChild(badge);
      }

      var item = document.createElement('li');
      item.appendChild(button);
      list.appendChild(item);
    }

    this.el.innerHTML = '';
    this.el.appendChild(list);
  }
}

export { TreeMenu };
