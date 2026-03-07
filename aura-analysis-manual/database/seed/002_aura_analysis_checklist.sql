-- Default checklist template and items

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
