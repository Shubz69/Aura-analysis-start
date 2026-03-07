const db = require('../../db');
const { requireAdminAccess } = require('../../utils/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  requireAdminAccess(req, res, db, async () => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const trades = await db.query(
        'SELECT t.*, u.username, u.email FROM aura_analysis_trades t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC LIMIT ? OFFSET ?',
        [Number(limit), Number(offset)]
      );
      return res.status(200).json(trades);
    } catch (err) {
      console.error('aura-analysis/admin/trades', err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
};
