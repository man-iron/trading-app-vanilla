/* ==========================================================================
 * app.js — bootstrap: wires store + menu + table + feed + status bar.
 *
 * The single entry module: index.html loads only this file, and the browser
 * resolves the rest of the graph from the imports below. No framework, no
 * bundler, no build step — just native ES modules.
 * ========================================================================== */

import * as data from './data.js';
import * as helpers from './helpers.js';
import { Store } from './store.js';
import { TreeMenu } from './menu.js';
import { StatusBar } from './statusbar.js';
import { ReportTable } from './table.js';
import { LiveFeed } from './feed.js';

var store = new Store({
  expandedIds: [],
  selectedReportId: null,
  paused: false
});

/* ---- static chrome ---- */

document.getElementById('header-desk').textContent = data.USER.desk;
document.getElementById('header-user').textContent =
  data.USER.name + ' · ' + data.USER.role;

/* ---- components ---- */

new TreeMenu(document.getElementById('tree-menu'), store, data.MENU);
new StatusBar(document.getElementById('status-bar'), store, data.USER, data.MENU);
var table = new ReportTable(document.getElementById('report-table'));
var feed = new LiveFeed(function (tick) { table.applyTicks(tick.updates); });

/* ---- report panel elements ---- */

var panelEl = document.getElementById('report-panel');
var welcomeEl = document.getElementById('welcome');
var titleEl = document.getElementById('report-title');
var asofEl = document.getElementById('report-asof');
var statusEl = document.getElementById('report-status');
var pauseEl = document.getElementById('report-pause');

pauseEl.addEventListener('click', function () {
  store.setState({ paused: !store.state.paused });
});

/* ---- reactions ---- */

store.subscribe(function (state, patch) {
  if ('selectedReportId' in patch) openReport(state.selectedReportId);
  if ('paused' in patch) renderStatus();
});

function openReport(reportId) {
  var node = helpers.findNode(data.MENU, reportId);
  var report = data.REPORTS[reportId];
  if (!node || !report) return;

  panelEl.hidden = false;
  welcomeEl.hidden = true;
  titleEl.textContent = node.label;
  asofEl.textContent = 'as of ' + helpers.formatClock(new Date());

  table.setReport(report.columns, report.rows);

  if (node.transport === 'live') {
    // reset pause, hand the working copy to the fake feed
    if (store.state.paused) store.setState({ paused: false });
    feed.start(report.columns, report.rows);
  } else {
    feed.stop();
  }
  renderStatus();
}

function renderStatus() {
  var node = helpers.findNode(data.MENU, store.state.selectedReportId);
  if (!node) return;

  if (node.transport === 'live') {
    var paused = store.state.paused;
    feed.setPaused(paused);
    statusEl.className = 'report__status report__status--' + (paused ? 'paused' : 'live');
    statusEl.textContent = paused ? 'PAUSED' : 'LIVE';
    pauseEl.hidden = false;
    pauseEl.textContent = paused ? '▶ PLAY' : '❘❘ PAUSE';
  } else {
    statusEl.className = 'report__status report__status--eod';
    statusEl.textContent = 'EOD';
    pauseEl.hidden = true;
  }
}

/* ---- boot: preselect the flagship live report ---- */

store.setState({ expandedIds: ['markets', 'fx'], selectedReportId: 'fx-spot' });
