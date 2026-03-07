-- Aura Analysis Free Manual Dashboard — MySQL migration
-- Run once on your MySQL DB (e.g. Railway, MySQL Workbench).
-- Requires existing table: users(id INT PK)
-- Tables use prefix: aura_analysis_

-- 1) Assets registry
CREATE TABLE IF NOT EXISTS aura_analysis_assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  asset_class VARCHAR(50) NOT NULL,
  quote_type VARCHAR(50) NOT NULL,
  pip_multiplier DECIMAL(12,4) NOT NULL,
  pip_value_hint DECIMAL(12,4) DEFAULT NULL,
  contract_size_hint DECIMAL(12,4) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_aa_assets_symbol (symbol),
  INDEX idx_aa_assets_asset_class (asset_class)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) Trades
CREATE TABLE IF NOT EXISTS aura_analysis_trades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  pair VARCHAR(50) NOT NULL,
  asset_id INT DEFAULT NULL,
  asset_class VARCHAR(50) NOT NULL,
  direction ENUM('buy','sell') NOT NULL,
  session VARCHAR(50) DEFAULT NULL,
  account_balance DECIMAL(15,2) NOT NULL,
  risk_percent DECIMAL(8,4) NOT NULL,
  risk_amount DECIMAL(15,2) NOT NULL,
  entry_price DECIMAL(20,8) NOT NULL,
  stop_loss DECIMAL(20,8) NOT NULL,
  take_profit DECIMAL(20,8) NOT NULL,
  stop_loss_pips DECIMAL(20,4) NOT NULL,
  take_profit_pips DECIMAL(20,4) NOT NULL,
  rr DECIMAL(12,4) NOT NULL,
  position_size DECIMAL(20,8) NOT NULL,
  potential_profit DECIMAL(15,2) NOT NULL,
  potential_loss DECIMAL(15,2) NOT NULL,
  result ENUM('win','loss','breakeven','open') DEFAULT 'open',
  pnl DECIMAL(15,2) DEFAULT 0,
  r_multiple DECIMAL(12,4) DEFAULT 0,
  checklist_score INT DEFAULT 0,
  checklist_total INT DEFAULT 0,
  checklist_percent DECIMAL(8,2) DEFAULT 0,
  trade_grade VARCHAR(10) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_aa_trades_user_id (user_id),
  INDEX idx_aa_trades_pair (pair),
  INDEX idx_aa_trades_asset_class (asset_class),
  INDEX idx_aa_trades_result (result),
  INDEX idx_aa_trades_session (session),
  INDEX idx_aa_trades_created_at (created_at),
  INDEX idx_aa_trades_user_created (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES aura_analysis_assets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) Checklist templates
CREATE TABLE IF NOT EXISTS aura_analysis_checklist_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  is_default TINYINT(1) DEFAULT 1,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_aa_tpl_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) Checklist template items
CREATE TABLE IF NOT EXISTS aura_analysis_checklist_template_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  label VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  is_required TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_aa_tpl_items_template (template_id),
  FOREIGN KEY (template_id) REFERENCES aura_analysis_checklist_templates(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) Trade checklist items (snapshot per trade)
CREATE TABLE IF NOT EXISTS aura_analysis_trade_checklist_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trade_id INT NOT NULL,
  checklist_item_label VARCHAR(255) NOT NULL,
  passed TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_aa_tci_trade (trade_id),
  FOREIGN KEY (trade_id) REFERENCES aura_analysis_trades(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6) Settings (key-value)
CREATE TABLE IF NOT EXISTS aura_analysis_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_aa_settings_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
