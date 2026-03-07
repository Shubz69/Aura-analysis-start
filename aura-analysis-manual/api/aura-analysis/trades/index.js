const db = require('../../db');
const { requireFreeDashboardAccess } = require('../../utils/auth');
const {
  calcChecklistPercent,
  calcTradeGrade,
} = require('../../../src/utils/auraAnalysisCalculations');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return requireFreeDashboardAccess(req, res, db, async (user) => {
      try {
        const { pair, result, session, direction, from, to, limit = 50, offset = 0 } = req.query;
        let sql = 'SELECT * FROM aura_analysis_trades WHERE user_id = ?';
        const params = [user.id];
        if (pair) { sql += ' AND pair = ?'; params.push(pair); }
        if (result) { sql += ' AND result = ?'; params.push(result); }
        if (session) { sql += ' AND session = ?'; params.push(session); }
        if (direction) { sql += ' AND direction = ?'; params.push(direction); }
        if (from) { sql += ' AND created_at >= ?'; params.push(from); }
        if (to) { sql += ' AND created_at <= ?'; params.push(to); }
        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), Number(offset));
        const rows = await db.query(sql, params);
        return res.status(200).json(rows);
      } catch (err) {
        console.error('aura-analysis/trades GET', err);
        return res.status(500).json({ error: 'Server error' });
      }
    });
  }
  if (req.method === 'POST') {
    return requireFreeDashboardAccess(req, res, db, async (user) => {
      try {
        const b = req.body || {};
        const checklistScore = Number(b.checklist_score) || 0;
        const checklistTotal = Number(b.checklist_total) || 0;
        const checklistPercent = calcChecklistPercent(checklistScore, checklistTotal);
        const tradeGrade = calcTradeGrade(checklistPercent);
        const result = await db.query(
          `INSERT INTO aura_analysis_trades (
            user_id, pair, asset_id, asset_class, direction, session,
            account_balance, risk_percent, risk_amount, entry_price, stop_loss, take_profit,
            stop_loss_pips, take_profit_pips, rr, position_size, potential_profit, potential_loss,
            result, pnl, r_multiple, checklist_score, checklist_total, checklist_percent, trade_grade, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.id,
            b.pair || '',
            b.asset_id || null,
            b.asset_class || 'forex',
            b.direction || 'buy',
            b.session || null,
            Number(b.account_balance) || 0,
            Number(b.risk_percent) || 0,
            Number(b.risk_amount) || 0,
            Number(b.entry_price) || 0,
            Number(b.stop_loss) || 0,
            Number(b.take_profit) || 0,
            Number(b.stop_loss_pips) || 0,
            Number(b.take_profit_pips) || 0,
            Number(b.rr) || 0,
            Number(b.position_size) || 0,
            Number(b.potential_profit) || 0,
            Number(b.potential_loss) || 0,
            b.result || 'open',
            Number(b.pnl) || 0,
            Number(b.r_multiple) || 0,
            checklistScore,
            checklistTotal,
            checklistPercent,
            tradeGrade,
            b.notes || null,
          ]
        );
        const id = result.insertId;
        const rows = await db.query('SELECT * FROM aura_analysis_trades WHERE id = ?', [id]);
        return res.status(201).json(rows[0]);
      } catch (err) {
        console.error('aura-analysis/trades POST', err);
        return res.status(500).json({ error: 'Server error' });
      }
    });
  }
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
