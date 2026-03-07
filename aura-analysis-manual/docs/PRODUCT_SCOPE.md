# Aura Analysis FREE — Product Scope

## Manual-only dashboard for free members

**Aura Analysis FREE** is a **manual-only** dashboard. Free users enter all trades themselves. There is no automated trade import, no broker or platform connection, and no account syncing in this product.

---

## In scope (free manual version)

The free version **only** supports:

- **Manual trade calculator** — User enters pair, direction, entry, SL, TP, balance, risk %; app computes position size, R, potential P/L.
- **Manual trade journal entry** — User creates, edits, and deletes trades in the journal. All data is entered by the user.
- **Manual checklist completion** — User completes checklist items when logging a trade; no automatic pull from external systems.
- **Manual analytics** — Analytics (equity curve, win rate, PnL, drawdown, pair/session performance, grades) are computed **only** from trades the user has manually saved in this dashboard.
- **Manual performance tracking** — All performance metrics are derived from manually logged trades.
- **Leaderboard** — Based **only** on manually logged trades from users of this free dashboard. No imported or synced data.

All trade data in Aura Analysis FREE comes from **manual entry** in this app. No external trade sources.

---

## Out of scope (do not add to this free dashboard)

The following are **not** part of Aura Analysis FREE and must **not** be added to this codebase:

- **MT5 integration** — No MetaTrader 5 connection or trade import.
- **Broker API integration** — No broker APIs for automatic trade or account data.
- **TradingView account sync** — No TradingView account linking or sync.
- **VPS trade sync** — No VPS-based trade synchronization.
- **Automatic trade import** — No automatic import of trades from any platform or file.
- **Account connection flow** — No UI or API for connecting external trading accounts, MT5, brokers, or VPS.

**MT5, broker APIs, automated account syncing, and automatic trade import are reserved for a future PAID AI version only**, not this free manual dashboard.

---

## Implementation guarantee

The current implementation is **fully manual**:

- Trades are created only via the **Trade Calculator** “Save as trade” or via **Journal** add/edit (user-entered data).
- The **API** only accepts explicitly sent trade payloads (POST/PUT); there are no endpoints that fetch from MT5, brokers, TradingView, or VPS.
- **Analytics and leaderboard** use only data from the `aura_analysis_trades` table, which is populated solely by manual entry in this app.

No code in this repo implements or stubs MT5, broker API, TradingView sync, VPS sync, automatic import, or account connection flows.
