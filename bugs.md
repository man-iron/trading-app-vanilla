# Planted Bugs — Symptoms

Three visual bugs, all CSS-only. The JavaScript is correct in every case.
Run the app by opening `index.html` in Chrome.

## Bug 1 — Status dot is always green

Open an EOD report (e.g. **FX Forwards**). The status in the report
header (top-right) reads `EOD`, but the dot next to it is **green and
pulsing**, as if the report were live. Same when you pause a live
report: the text flips to `PAUSED` (correctly), the dot stays green.

The sidebar badge for the same report shows the correct state, so the
two indicators contradict each other on screen.

## Bug 2 — Rows show through the sticky header while scrolling

Open **Stocks** (Equities), make the window short enough that the table
scrolls, and scroll down. The column header row (SYMBOL, NAME, …) stays
pinned at the top as designed — but the data rows are **visible through
it**, text ghosting over text.

Only visible while the table is actually scrolled; looks perfect at the
top.

## Bug 3 — "NO REPORT LOADED" never goes away

Load any report. The table renders, but the *"NO REPORT LOADED /
Select a report from the navigator"* empty state **stays on screen**
below it, wasting half the panel.

Inspect the element: the `hidden` attribute IS set on `#welcome`. The
JS toggle logic is doing its job.

---

# Round 2 — JavaScript bugs

## Bug 4 — App does not boot at all

Open the app: the navigator is empty, header is blank, nothing works.
Console shows `ReferenceError: data is not defined` in `app.js`.

## Bug 5 — LIVE reports never update (silent)

(Visible only after Bug 4 is fixed.) Open FX Spot. The dot says LIVE,
the PAUSE button works, but prices never tick. **No console errors at
all.** The feed dies silently after its first scheduled tick.

## Bug 6 — Typing into a numeric filter breaks it

Type a plain number (e.g. `1`) into the filter under Bid/Ask/Last.
Nothing filters, and the console shows
`TypeError: value.toLowerCase is not a function`. Operator syntax like
`>1` still works. String-column filters still work.

## Bug 7 — Sorting numeric columns gives nonsense order

Sort Volume, Chg, or any price column: the order is wrong (e.g. 148.32
sorts before 88.62). Some columns *appear* to sort correctly (a column
whose key happens to be `price`), which makes it look intermittent.

## Bug 8 — Expand/collapse in the navigator is dead

Clicking MARKETS, RATES, DERIVATIVES, EQUITIES does nothing — no error,
no render. Selecting a report leaf still works fine. The expanded state
in the store IS being updated correctly if you log it.

## Task 9 — LIVE/EOD filter toggle (unfinished feature)

`index.html` contains a three-button toolbar (`● LIVE / EOD / ALL`)
meant to filter the navigator tree by transport. It is invisible in the
app, and no JS is wired to it. Find it, make it show, implement the
filtering.
