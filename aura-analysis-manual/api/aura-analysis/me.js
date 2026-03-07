const db = require('../db');
const { getCurrentUserFromToken, getEffectiveRole, BLOCKED_ROLES } = require('../utils/auth');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, errorCode: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' });
  }
  try {
    const user = await getCurrentUserFromToken(req, db);
    if (!user) {
      return res.status(401).json({ success: false, errorCode: 'UNAUTHORIZED', message: 'Authentication required', allowed: false });
    }
    const effectiveRole = getEffectiveRole(user);
    const allowed = !BLOCKED_ROLES.includes(user.role) && ['user', 'admin', 'super_admin'].includes(effectiveRole);
    return res.status(200).json({
      success: true,
      user: { id: user.id, email: user.email, username: user.username, role: user.role, effectiveRole },
      allowed,
      message: allowed ? null : 'Access denied. This dashboard is for manual (free) users only.',
    });
  } catch (err) {
    console.error('aura-analysis/me', err);
    return res.status(500).json({ success: false, errorCode: 'SERVER_ERROR', message: 'Server error' });
  }
};
