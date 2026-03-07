const db = require('../../db');
const { requireFreeDashboardAccess } = require('../../utils/auth');
const { calcConsistencyScore } = require('../../../src/utils/auraAnalysisCalculations');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  requireFreeDashboardAccess(req, res, db, async (user) => {
    try {
      const trades = await db.query(
        'SELECT * FROM aura_analysis_trades WHERE user_id = ? ORDER BY created_at ASC',
        [user.id]
      );
      const resolved = trades.filter((t) => t.result && t.result !== 'open');
      const wins = resolved.filter((t) => t.result === 'win');
      const losses = resolved.filter((t) => t.result === 'loss');
      const totalPnL = resolved.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
      const grossProfit = wins.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
      const grossLoss = Math.abs(losses.reduce((s, t) => s + (Number(t.pnl) || 0), 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 999 : 0);
      const byPair = {};
      resolved.forEach((t) => {
        const p = t.pair || 'Unknown';
        if (!byPair[p]) byPair[p] = { pnl: 0, count: 0 };
        byPair[p].pnl += Number(t.pnl) || 0;
        byPair[p].count += 1;
      });
      const pairs = Object.entries(byPair).map(([pair, d]) => ({ pair, ...d }));
      const bestPair = pairs.length ? pairs.sort((a, b) => b.pnl - a.pnl)[0]?.pair : null;
      const worstPair = pairs.length ? pairs.sort((a, b) => a.pnl - b.pnl)[0]?.pair : null;
      const avgR = resolved.length
        ? resolved.reduce((s, t) => s + (Number(t.r_multiple) || 0), 0) / resolved.length
        : 0;
      const winRate = resolved.length ? (wins.length / resolved.length) * 100 : 0;
      const consistencyScore = calcConsistencyScore(trades);
      const checklistPcts = resolved.map((t) => t.checklist_percent ?? 0).filter((p) => p > 0);
      const avgChecklist = checklistPcts.length
        ? checklistPcts.reduce((a, b) => a + b, 0) / checklistPcts.length
        : 0;

      let equity = 0;
      const equityCurve = resolved.map((t) => {
        equity += Number(t.pnl) || 0;
        return { date: t.created_at, equity, pnl: Number(t.pnl) || 0 };
      });

      return res.status(200).json({
        totalTrades: trades.length,
        resolvedTrades: resolved.length,
        winRate,
        averageR: avgR,
        totalPnL,
        profitFactor,
        bestPair,
        worstPair,
        consistencyScore,
        averageChecklistPercent: avgChecklist,
        equityCurve,
        recentTrades: trades.slice(-10).reverse(),
      });
    } catch (err) {
      console.error('aura-analysis/analytics/overview', err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
};
