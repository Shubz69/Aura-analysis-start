const db = require('../../db');
const { requireAdminAccess } = require('../../utils/auth');
const { calcConsistencyScore } = require('../../../src/utils/auraAnalysisCalculations');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  requireAdminAccess(req, res, db, async () => {
    try {
      const userCount = await db.query(
        'SELECT COUNT(*) AS c FROM users WHERE role IN (?, ?, ?)',
        ['user', 'admin', 'super_admin']
      );
      const totalUsers = userCount[0]?.c ?? 0;
      const tradeCount = await db.query('SELECT COUNT(*) AS c FROM aura_analysis_trades');
      const totalTrades = tradeCount[0]?.c ?? 0;
      const trades = await db.query('SELECT * FROM aura_analysis_trades ORDER BY created_at DESC LIMIT 500');
      const resolved = trades.filter((t) => t.result && t.result !== 'open');
      const wins = resolved.filter((t) => t.result === 'win');
      const communityWinRate = resolved.length ? (wins.length / resolved.length) * 100 : 0;
      const communityAvgR = resolved.length
        ? resolved.reduce((s, t) => s + (Number(t.r_multiple) || 0), 0) / resolved.length
        : 0;
      const userIds = [...new Set(trades.map((t) => t.user_id))];
      let consistencySum = 0;
      let consistencyCount = 0;
      for (const uid of userIds) {
        const userTrades = trades.filter((t) => t.user_id === uid);
        consistencySum += calcConsistencyScore(userTrades);
        consistencyCount += 1;
      }
      const communityConsistency = consistencyCount ? consistencySum / consistencyCount : 0;
      const recentTrades = trades.slice(0, 20);
      return res.status(200).json({
        totalDashboardUsers: totalUsers,
        totalDashboardTrades: totalTrades,
        communityWinRate,
        communityAverageR: communityAvgR,
        communityConsistencyAverage: communityConsistency,
        recentTrades,
      });
    } catch (err) {
      console.error('aura-analysis/admin/overview', err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
};
