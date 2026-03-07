const db = require('../../db');
const { requireFreeDashboardAccess, requireAdminAccess } = require('../../utils/auth');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return requireFreeDashboardAccess(req, res, db, async () => {
      try {
        const templates = await db.query(
          'SELECT * FROM aura_analysis_checklist_templates WHERE is_active = 1 ORDER BY id'
        );
        const withItems = [];
        for (const t of templates) {
          const items = await db.query(
            'SELECT * FROM aura_analysis_checklist_template_items WHERE template_id = ? ORDER BY sort_order, id',
            [t.id]
          );
          withItems.push({ ...t, items });
        }
        return res.status(200).json(withItems);
      } catch (err) {
        console.error('aura-analysis/checklists GET', err);
        return res.status(500).json({ error: 'Server error' });
      }
    });
  }
  if (req.method === 'POST') {
    return requireAdminAccess(req, res, db, async () => {
      try {
        const b = req.body || {};
        const result = await db.query(
          'INSERT INTO aura_analysis_checklist_templates (name, description, is_default, is_active) VALUES (?, ?, ?, ?)',
          [b.name || 'New Template', b.description || null, b.is_default ? 1 : 0, 1]
        );
        const insertId = result && result.insertId != null ? result.insertId : null;
        const rows = insertId != null ? await db.query('SELECT * FROM aura_analysis_checklist_templates WHERE id = ?', [insertId]) : [];
        return res.status(201).json(rows[0] || { id: insertId, name: b.name || 'New Template' });
      } catch (err) {
        console.error('aura-analysis/checklists POST', err);
        return res.status(500).json({ error: 'Server error' });
      }
    });
  }
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
