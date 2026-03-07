/**
 * Auth helpers for Aura Analysis (free manual dashboard).
 * Aligned with Aura-FX: use verifyToken(authHeader) then DB user fetch.
 * When merging into Aura-FX, require('../utils/auth').verifyToken and use executeQuery from db.
 */
const jwt = require('jsonwebtoken');

const SUPER_ADMIN_OVERRIDE_EMAIL = 'shubzfx@gmail.com';
const ALLOWED_ROLES = ['user', 'admin', 'super_admin'];
const BLOCKED_ROLES = ['premium', 'elite', 'a7fx'];
const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SIGNING_KEY;

/**
 * Verify JWT from Authorization header. Same interface as Aura-FX api/utils/auth.js.
 * Returns decoded payload with id or null.
 */
function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET || 'your-jwt-secret', { algorithms: ['HS256'] });
    if (!decoded || !(decoded.id || decoded.userId || decoded.sub)) return null;
    return { ...decoded, id: decoded.id || decoded.userId || decoded.sub };
  } catch {
    return null;
  }
}

/**
 * Get current user from JWT (Authorization or cookie) and users table.
 * Returns { id, email, username, role } or null. shubzfx@gmail.com → super_admin.
 */
async function getCurrentUserFromToken(req, db) {
  const authHeader = req.headers.authorization || (req.cookies?.token ? `Bearer ${req.cookies.token}` : null);
  const decoded = verifyToken(authHeader);
  if (!decoded || !decoded.id) return null;
  try {
    const rows = await db.query(
      'SELECT id, email, username, role FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );
    const u = rows && rows[0];
    if (!u) return null;
    const role = (u.email || '').toLowerCase() === SUPER_ADMIN_OVERRIDE_EMAIL ? 'super_admin' : (u.role || 'user');
    return { id: u.id, email: u.email, username: u.username, role };
  } catch {
    return null;
  }
}

/**
 * Require auth: returns user or sends 401.
 */
async function requireAuth(req, res, db) {
  const user = await getCurrentUserFromToken(req, db);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  return user;
}

/**
 * Check if user has access to the free manual dashboard.
 * Allowed: user, admin, super_admin. Blocked: premium, elite, a7fx.
 */
function requireFreeDashboardAccess(req, res, db, callback) {
  requireAuth(req, res, db).then((user) => {
    if (!user) return;
    if (BLOCKED_ROLES.includes(user.role)) {
      res.status(403).json({ error: 'Access denied. This dashboard is for manual (free) users only.' });
      return;
    }
    const effectiveRole = getEffectiveRole(user);
    if (!ALLOWED_ROLES.includes(effectiveRole)) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }
    callback(user);
  });
}

/**
 * Require admin or super_admin.
 */
function requireAdminAccess(req, res, db, callback) {
  requireAuth(req, res, db).then((user) => {
    if (!user) return;
    const effectiveRole = isSuperAdminOverride(user) ? 'super_admin' : user.role;
    if (effectiveRole !== 'admin' && effectiveRole !== 'super_admin') {
      res.status(403).json({ error: 'Admin access required.' });
      return;
    }
    callback(user);
  });
}

function isSuperAdminOverride(user) {
  return user && user.email === SUPER_ADMIN_OVERRIDE_EMAIL;
}

/**
 * Get effective role (super_admin override applied).
 */
function getEffectiveRole(user) {
  if (!user) return null;
  if (user.email === SUPER_ADMIN_OVERRIDE_EMAIL) return 'super_admin';
  return user.role || 'user';
}

module.exports = {
  verifyToken,
  getCurrentUserFromToken,
  requireAuth,
  requireFreeDashboardAccess,
  requireAdminAccess,
  isSuperAdminOverride,
  getEffectiveRole,
  ALLOWED_ROLES,
  BLOCKED_ROLES,
};
