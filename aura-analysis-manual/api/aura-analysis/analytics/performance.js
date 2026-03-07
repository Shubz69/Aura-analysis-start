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
      let equity = 0;
      const equityCurve = [];
      resolved.forEach((t) => {
        equity += Number(t.pnl) || 0;
        equityCurve.push({ date: t.created_at, equity, pnl: Number(t.pnl) || 0 });
      });
      let peak = 0;
      let maxDrawdown = 0;
      equityCurve.forEach(({ equity: e }) => {
        if (e > peak) peak = e;
        const dd = peak - e;
        if (dd > maxDrawdown) maxDrawdown = dd;
      });
      let winStreak = 0;
      let maxWinStreak = 0;
      let lossStreak = 0;
      let maxLossStreak = 0;
      resolved.forEach((t) => {
        if (t.result === 'win') {
          winStreak += 1;
          lossStreak = 0;
          if (winStreak > maxWinStreak) maxWinStreak = winStreak;
        } else if (t.result === 'loss') {
          lossStreak += 1;
          winStreak = 0;
          if (lossStreak > maxLossStreak) maxLossStreak = lossStreak;
        }
      });
      const wins = resolved.filter((t) => t.result === 'win');
      const losses = resolved.filter((t) => t.result === 'loss');
      const winPct = resolved.length ? wins.length / resolved.length : 0;
      const avgWin = wins.length ? wins.reduce((s, t) => s + (Number(t.pnl) || 0), 0) / wins.length : 0;
      const avgLoss = losses.length ? losses.reduce((s, t) => s + (Number(t.pnl) || 0), 0) / losses.length : 0;
      const expectancy = winPct * avgWin + (1 - winPct) * avgLoss;

      const byPair = {};
      const bySession = {};
      const byWeekday = {};
      const longShort = { long: { pnl: 0, count: 0 }, short: { pnl: 0, count: 0 } };
      const byAssetClass = {};
      const gradeCount = { 'A+': 0, A: 0, B: 0, C: 0 };
      resolved.forEach((t) => {
        const pnl = Number(t.pnl) || 0;
        const pair = t.pair || 'Unknown';
        const session = t.session || 'Unknown';
        const day = t.created_at ? new Date(t.created_at).getDay() : 0;
        const dir = (t.direction || '').toLowerCase() === 'sell' ? 'short' : 'long';
        const ac = t.asset_class || 'forex';
        byPair[pair] = (byPair[pair] || { pnl: 0, count: 0, rSum: 0 });
        byPair[pair].pnl += pnl;
        byPair[pair].count += 1;
        byPair[pair].rSum += Number(t.r_multiple) || 0;
        bySession[session] = (bySession[session] || { pnl: 0, count: 0 });
        bySession[session].pnl += pnl;
        bySession[session].count += 1;
        byWeekday[day] = (byWeekday[day] || { pnl: 0, count: 0 });
        byWeekday[day].pnl += pnl;
        byWeekday[day].count += 1;
        longShort[dir].pnl += pnl;
        longShort[dir].count += 1;
        byAssetClass[ac] = (byAssetClass[ac] || { pnl: 0, count: 0 });
        byAssetClass[ac].pnl += pnl;
        byAssetClass[ac].count += 1;
        const g = t.trade_grade || 'C';
        if (gradeCount[g] != null) gradeCount[g] += 1;
        else gradeCount[g] = 1;
      });
      const pairPerformance = Object.entries(byPair).map(([pair, d]) => ({
        pair,
        pnl: d.pnl,
        count: d.count,
        avgR: d.count ? d.rSum / d.count : 0,
      }));
      const sessionPerformance = Object.entries(bySession).map(([session, d]) => ({ session, ...d }));
      const weekdayPerformance = Object.entries(byWeekday).map(([day, d]) => ({ day: Number(day), ...d }));
      const consistencyScore = calcConsistencyScore(trades);

      return res.status(200).json({
        equityCurve,
        maxDrawdown,
        maxWinStreak,
        maxLossStreak,
        expectancy,
        winRate: resolved.length ? (wins.length / resolved.length) * 100 : 0,
        pairPerformance,
        sessionPerformance,
        weekdayPerformance,
        longShort,
        assetClassPerformance: byAssetClass,
        gradeDistribution: gradeCount,
        consistencyScore,
      });
    } catch (err) {
      console.error('aura-analysis/analytics/performance', err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
};
