-- Optional: demo trades for local/dev. Run AFTER migrations and 001_assets, 002_checklist.
-- Replace @USER_ID with a real user id from your users table (e.g. 1).
-- Only insert if you have at least one user with role in ('user','admin','super_admin').

SET @USER_ID = 1;

INSERT INTO aura_analysis_trades (
  user_id, pair, asset_class, direction, session, account_balance, risk_percent, risk_amount,
  entry_price, stop_loss, take_profit, stop_loss_pips, take_profit_pips, rr, position_size,
  potential_profit, potential_loss, result, pnl, r_multiple, checklist_score, checklist_total, checklist_percent, trade_grade, notes
) VALUES
(@USER_ID, 'EURUSD', 'forex', 'buy', 'London', 10000, 1, 100, 1.0850, 1.0830, 1.0900, 20, 50, 2.5, 0.5, 250, 100, 'win', 225.50, 2.26, 7, 7, 100, 'A+', 'Demo trade 1'),
(@USER_ID, 'GBPJPY', 'forex', 'sell', 'New York', 10000, 0.5, 50, 191.20, 191.60, 190.50, 40, 70, 1.75, 0.12, 87.50, 50, 'win', 80, 1.6, 6, 7, 86, 'A', 'Demo trade 2'),
(@USER_ID, 'XAUUSD', 'metals', 'buy', 'London', 15000, 1, 150, 2650, 2640, 2670, 100, 200, 2, 0.15, 300, 150, 'loss', -150, -1, 5, 7, 71, 'B', 'Demo trade 3'),
(@USER_ID, 'US30', 'indices', 'buy', 'New York', 20000, 1, 200, 39000, 38800, 39400, 200, 400, 2, 0.01, 400, 200, 'win', 380, 1.9, 7, 7, 100, 'A+', 'Demo trade 4');
