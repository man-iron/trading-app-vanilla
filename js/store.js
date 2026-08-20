/* ==========================================================================
 * store.js — a tiny observable store, class-based.
 *
 * One instance holds the whole UI state; modules subscribe and re-render
 * when it changes. Think "Redux by hand, 40 lines".
 * ========================================================================== */

/**
 * @constructor-style ES class kept deliberately old-school: no private
 * fields, no getters — just a state bag, subscribe(), and setState().
 */
class Store {
  constructor(initialState) {
    this.state = initialState || {};
    this.listeners = [];
  }

  /** Register a listener; returns an unsubscribe function. */
  subscribe(listener) {
    this.listeners.push(listener);
    var self = this;
    return function unsubscribe() {
      self.listeners = self.listeners.filter(function (l) { return l !== listener; });
    };
  }

  /** Shallow-merge a patch, then notify every listener with (state, patch). */
  setState(patch) {
    var next = {};
    var key;
    for (key in this.state) next[key] = this.state[key];
    for (key in patch) next[key] = patch[key];
    this.state = next; // new object on purpose — reference equality works
    for (var i = 0; i < this.listeners.length; i += 1) {
      this.listeners[i](this.state, patch);
    }
  }
}

export { Store };
