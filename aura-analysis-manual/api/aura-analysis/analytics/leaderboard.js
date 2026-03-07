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
      const { sortBy = 'totalPnL', limit = 50 } = req.query;
      const users = await db.query(
        'SELECT u.id, u.username, u.email, u.role FROM users u WHERE u.role IN (?, ?, ?)',
        ['user', 'admin', 'super_admin']
      );
      const leaderboard = [];
      for (const u of users) {
        const trades = await db.query('SELECT * FROM aura_analysis_trades WHERE user_id = ?', [u.id]);
        const resolved = trades.filter((t) => t.result && t.result !== 'open');
        const wins = resolved.filter((t) => t.result === 'win');
        const losses = resolved.filter((t) => t.result === 'loss');
        const totalPnL = resolved.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
        const grossProfit = wins.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
        const grossLoss = Math.abs(losses.reduce((s, t) => s + (Number(t.pnl) || 0), 0));
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 999 : 0);
        const avgR = resolved.length
          ? resolved.reduce((s, t) => s + (Number(t.r_multiple) || 0), 0) / resolved.length
          : 0;
        const winRate = resolved.length ? (wins.length / resolved.length) * 100 : 0;
        const byPair = {};
        resolved.forEach((t) => {
          const p = t.pair || 'Unknown';
          if (!byPair[p]) byPair[p] = 0;
          byPair[p] += Number(t.pnl) || 0;
        });
        const pairs = Object.entries(byPair).sort((a, b) => b[1] - a[1]);
        const bestPair = pairs.length ? pairs[0][0] : null;
        const consistencyScore = calcConsistencyScore(trades);
        leaderboard.push({
          userId: u.id,
          username: u.username || u.email || 'User',
          totalTrades: resolved.length,
          winRate,
          averageR: avgR,
          totalPnL,
          profitFactor,
          consistencyScore,
          bestPair,
        });
      }
      const validSort = ['totalPnL', 'winRate', 'averageR', 'totalTrades', 'profitFactor', 'consistencyScore'].includes(sortBy)
        ? sortBy
        : 'totalPnL';
      leaderboard.sort((a, b) => (validSort === 'winRate' || validSort === 'averageR' || validSort === 'profitFactor' || validSort === 'consistencyScore')
        ? (b[validSort] || 0) - (a[validSort] || 0)
        : (b[validSort] || 0) - (a[validSort] || 0)
      );
      const limited = leaderboard.slice(0, Number(limit) || 50).map((row, i) => ({ rank: i + 1, ...row }));
      return res.status(200).json(limited);
    } catch (err) {
      console.error('aura-analysis/analytics/leaderboard', err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
};
