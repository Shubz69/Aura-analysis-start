const db = require('../../db');
const { requireFreeDashboardAccess } = require('../../utils/auth');
const { calcChecklistPercent, calcTradeGrade } = require('../../../src/utils/auraAnalysisCalculations');

async function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Missing trade id' });

  if (req.method === 'GET') {
    return requireFreeDashboardAccess(req, res, db, async (user) => {
      try {
        const rows = await db.query('SELECT * FROM aura_analysis_trades WHERE id = ? AND user_id = ?', [id, user.id]);
        if (!rows || rows.length === 0) return res.status(404).json({ error: 'Trade not found' });
        const checklist = await db.query('SELECT * FROM aura_analysis_trade_checklist_items WHERE trade_id = ? ORDER BY id', [id]);
        return res.status(200).json({ trade: rows[0], checklist_items: checklist });
      } catch (err) {
        console.error('aura-analysis/trades/[id] GET', err);
        return res.status(500).json({ error: 'Server error' });
      }
    });
  }

  if (req.method === 'PUT') {
    return requireFreeDashboardAccess(req, res, db, async (user) => {
      try {
        const existing = await db.query('SELECT id FROM aura_analysis_trades WHERE id = ? AND user_id = ?', [id, user.id]);
        if (!existing || existing.length === 0) return res.status(404).json({ error: 'Trade not found' });
        const b = req.body || {};
        const checklistScore = Number(b.checklist_score) ?? 0;
        const checklistTotal = Number(b.checklist_total) ?? 0;
        const checklistPercent = calcChecklistPercent(checklistScore, checklistTotal);
        const tradeGrade = calcTradeGrade(checklistPercent);
        await db.query(
          `UPDATE aura_analysis_trades SET
            pair=?, asset_id=?, asset_class=?, direction=?, session=?,
            account_balance=?, risk_percent=?, risk_amount=?, entry_price=?, stop_loss=?, take_profit=?,
            stop_loss_pips=?, take_profit_pips=?, rr=?, position_size=?, potential_profit=?, potential_loss=?,
            result=?, pnl=?, r_multiple=?, checklist_score=?, checklist_total=?, checklist_percent=?, trade_grade=?, notes=?
          WHERE id = ? AND user_id = ?`,
          [
            b.pair, b.asset_id, b.asset_class, b.direction, b.session,
            b.account_balance, b.risk_percent, b.risk_amount, b.entry_price, b.stop_loss, b.take_profit,
            b.stop_loss_pips, b.take_profit_pips, b.rr, b.position_size, b.potential_profit, b.potential_loss,
            b.result, b.pnl, b.r_multiple, checklistScore, checklistTotal, checklistPercent, tradeGrade, b.notes,
            id, user.id,
          ]
        );
        const row = await db.query('SELECT * FROM aura_analysis_trades WHERE id = ?', [id]);
        return res.status(200).json(row[0]);
      } catch (err) {
        console.error('aura-analysis/trades/[id] PUT', err);
        return res.status(500).json({ error: 'Server error' });
      }
    });
  }

  if (req.method === 'DELETE') {
    return requireFreeDashboardAccess(req, res, db, async (user) => {
      try {
        const r = await db.query('DELETE FROM aura_analysis_trades WHERE id = ? AND user_id = ?', [id, user.id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Trade not found' });
        return res.status(200).json({ ok: true });
      } catch (err) {
        console.error('aura-analysis/trades/[id] DELETE', err);
        return res.status(500).json({ error: 'Server error' });
      }
    });
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}

module.exports = handler;
