const db = require('../../db');
const { requireFreeDashboardAccess } = require('../../utils/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  requireFreeDashboardAccess(req, res, db, async () => {
    try {
      const rows = await db.query(
        'SELECT id, symbol, display_name, asset_class, quote_type, pip_multiplier, pip_value_hint, contract_size_hint, is_active FROM aura_analysis_assets WHERE is_active = 1 ORDER BY symbol'
      );
      return res.status(200).json(rows);
    } catch (err) {
      console.error('aura-analysis/assets', err);
      return res.status(500).json({ error: 'Server error' });
    }
  });
};
