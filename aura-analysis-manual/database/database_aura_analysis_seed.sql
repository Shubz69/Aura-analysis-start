-- Aura Analysis — Seed data (run AFTER database_aura_analysis.sql)
-- 1) Assets: Forex majors, crosses, metals, oil/energy, indices, crypto
-- 2) Default checklist template and items
-- 3) Demo trades (optional: set @USER_ID to a valid user id)

-- ========== ASSETS ==========
INSERT IGNORE INTO aura_analysis_assets (symbol, display_name, asset_class, quote_type, pip_multiplier, is_active) VALUES
-- Forex majors
('EURUSD', 'EUR/USD', 'forex', 'USD', 10000, 1),
('GBPUSD', 'GBP/USD', 'forex', 'USD', 10000, 1),
('USDJPY', 'USD/JPY', 'forex', 'JPY', 100, 1),
('USDCHF', 'USD/CHF', 'forex', 'CHF', 10000, 1),
('USDCAD', 'USD/CAD', 'forex', 'CAD', 10000, 1),
('AUDUSD', 'AUD/USD', 'forex', 'USD', 10000, 1),
('NZDUSD', 'NZD/USD', 'forex', 'USD', 10000, 1),
-- Forex crosses
('EURGBP', 'EUR/GBP', 'forex', 'GBP', 10000, 1),
('EURJPY', 'EUR/JPY', 'forex', 'JPY', 100, 1),
('EURCHF', 'EUR/CHF', 'forex', 'CHF', 10000, 1),
('EURAUD', 'EUR/AUD', 'forex', 'AUD', 10000, 1),
('EURCAD', 'EUR/CAD', 'forex', 'CAD', 10000, 1),
('EURNZD', 'EUR/NZD', 'forex', 'NZD', 10000, 1),
('GBPJPY', 'GBP/JPY', 'forex', 'JPY', 100, 1),
('GBPCHF', 'GBP/CHF', 'forex', 'CHF', 10000, 1),
('GBPAUD', 'GBP/AUD', 'forex', 'AUD', 10000, 1),
('GBPCAD', 'GBP/CAD', 'forex', 'CAD', 10000, 1),
('GBPNZD', 'GBP/NZD', 'forex', 'NZD', 10000, 1),
('AUDJPY', 'AUD/JPY', 'forex', 'JPY', 100, 1),
('AUDCHF', 'AUD/CHF', 'forex', 'CHF', 10000, 1),
('AUDCAD', 'AUD/CAD', 'forex', 'CAD', 10000, 1),
('AUDNZD', 'AUD/NZD', 'forex', 'NZD', 10000, 1),
('NZDJPY', 'NZD/JPY', 'forex', 'JPY', 100, 1),
('NZDCHF', 'NZD/CHF', 'forex', 'CHF', 10000, 1),
('NZDCAD', 'NZD/CAD', 'forex', 'CAD', 10000, 1),
('CADJPY', 'CAD/JPY', 'forex', 'JPY', 100, 1),
('CADCHF', 'CAD/CHF', 'forex', 'CHF', 10000, 1),
('CHFJPY', 'CHF/JPY', 'forex', 'JPY', 100, 1),
-- Metals
('XAUUSD', 'Gold/USD', 'metals', 'USD', 10, 1),
('XAUEUR', 'Gold/EUR', 'metals', 'EUR', 10, 1),
('XAUGBP', 'Gold/GBP', 'metals', 'GBP', 10, 1),
('XAUAUD', 'Gold/AUD', 'metals', 'AUD', 10, 1),
('XAGUSD', 'Silver/USD', 'metals', 'USD', 100, 1),
-- Oil / energy
('XTIUSD', 'WTI Crude', 'energy', 'USD', 100, 1),
('XBRUSD', 'Brent Crude', 'energy', 'USD', 100, 1),
('NATGAS', 'Natural Gas', 'energy', 'USD', 100, 1),
-- Indices
('US30', 'Dow 30', 'indices', 'USD', 1, 1),
('NAS100', 'Nasdaq 100', 'indices', 'USD', 1, 1),
('SPX500', 'S&P 500', 'indices', 'USD', 1, 1),
('GER40', 'DAX', 'indices', 'EUR', 1, 1),
('UK100', 'FTSE 100', 'indices', 'GBP', 1, 1),
('FRA40', 'CAC 40', 'indices', 'EUR', 1, 1),
('EU50', 'Euro Stoxx 50', 'indices', 'EUR', 1, 1),
('JP225', 'Nikkei 225', 'indices', 'JPY', 1, 1),
('HK50', 'Hang Seng', 'indices', 'HKD', 1, 1),
('AUS200', 'ASX 200', 'indices', 'AUD', 1, 1),
-- Crypto
('BTCUSD', 'Bitcoin/USD', 'crypto', 'USD', 1, 1),
('ETHUSD', 'Ethereum/USD', 'crypto', 'USD', 1, 1),
('SOLUSD', 'Solana/USD', 'crypto', 'USD', 1, 1);

-- ========== DEFAULT CHECKLIST TEMPLATE ==========
INSERT IGNORE INTO aura_analysis_checklist_templates (id, name, description, is_default, is_active) VALUES
(1, 'Default Trade Checklist', 'Standard pre-trade checklist for manual trading.', 1, 1);

INSERT IGNORE INTO aura_analysis_checklist_template_items (template_id, label, sort_order, is_required) VALUES
(1, 'Trend aligned', 1, 1),
(1, 'Liquidity sweep confirmed', 2, 1),
(1, 'Session valid', 3, 1),
(1, 'Structure confirmed', 4, 1),
(1, 'Risk under max allowed', 5, 1),
(1, 'Confluence present', 6, 1),
(1, 'HTF bias aligned', 7, 1);

-- ========== DEMO TRADES (development only) ==========
-- Replace @USER_ID with a real user id from your users table (e.g. 1).
SET @USER_ID = 1;

INSERT INTO aura_analysis_trades (
  user_id, pair, asset_class, direction, session, account_balance, risk_percent, risk_amount,
  entry_price, stop_loss, take_profit, stop_loss_pips, take_profit_pips, rr, position_size,
  potential_profit, potential_loss, result, pnl, r_multiple, checklist_score, checklist_total, checklist_percent, trade_grade, notes
) VALUES
(@USER_ID, 'EURUSD', 'forex', 'buy', 'London', 10000, 1, 100, 1.0850, 1.0830, 1.0900, 20, 50, 2.5, 0.5, 250, 100, 'win', 225.50, 2.26, 7, 7, 100, 'A+', 'Demo trade 1'),
(@USER_ID, 'GBPJPY', 'forex', 'sell', 'New York', 10000, 0.5, 50, 191.20, 191.60, 190.50, 40, 70, 1.75, 0.12, 87.50, 50, 'win', 80, 1.6, 6, 7, 86, 'A', 'Demo trade 2'),
(@USER_ID, 'XAUUSD', 'metals', 'buy', 'London', 15000, 1, 150, 2650, 2640, 2670, 100, 200, 2, 0.15, 300, 150, 'loss', -150, -1, 5, 7, 71, 'B', 'Demo trade 3'),
(@USER_ID, 'NAS100', 'indices', 'buy', 'New York', 20000, 1, 200, 20500, 20400, 20800, 100, 300, 3, 0.02, 600, 200, 'win', 580, 2.9, 7, 7, 100, 'A+', 'Demo trade 4'),
(@USER_ID, 'BTCUSD', 'crypto', 'sell', 'New York', 25000, 0.5, 125, 97500, 97800, 96900, 300, 600, 2, 0.001, 600, 125, 'win', 580, 4.64, 6, 7, 86, 'A', 'Demo trade 5'),
(@USER_ID, 'EURUSD', 'forex', 'sell', 'Asian', 10000, 1, 100, 1.0920, 1.0940, 1.0870, 20, 50, 2.5, 0.5, 250, 100, 'loss', -95, -0.95, 4, 7, 57, 'C', 'Demo trade 6'),
(@USER_ID, 'GBPUSD', 'forex', 'buy', 'London/NY Overlap', 12000, 0.75, 90, 1.2680, 1.2655, 1.2730, 25, 50, 2, 0.36, 180, 90, 'win', 172, 1.91, 7, 7, 100, 'A+', 'Demo trade 7'),
(@USER_ID, 'US30', 'indices', 'buy', 'New York', 20000, 1, 200, 39000, 38800, 39400, 200, 400, 2, 0.01, 400, 200, 'win', 380, 1.9, 7, 7, 100, 'A+', 'Demo trade 8');
