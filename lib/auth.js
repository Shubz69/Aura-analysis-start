/**
 * Auth helpers – existing Aura FX pattern. JWT + users table.
 * Allow: user, admin, super_admin. Block: premium, elite, a7fx. shubzfx@gmail.com → super_admin.
 */
const jwt = require("jsonwebtoken");

const SUPER_ADMIN_OVERRIDE_EMAIL = "shubzfx@gmail.com";
const ALLOWED_ROLES = ["user", "admin", "super_admin"];
const BLOCKED_ROLES = ["premium", "elite", "a7fx"];
const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SIGNING_KEY;

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET || "your-jwt-secret", { algorithms: ["HS256"] });
    if (!decoded || !(decoded.id || decoded.userId || decoded.sub)) return null;
    return { ...decoded, id: decoded.id || decoded.userId || decoded.sub };
  } catch {
    return null;
  }
}

async function getCurrentUserFromToken(req, db) {
  const authHeader =
    req.headers.authorization || (req.cookies?.token ? `Bearer ${req.cookies.token}` : null);
  const decoded = verifyToken(authHeader);
  if (!decoded || !decoded.id) return null;
  try {
    const rows = await db.query(
      "SELECT id, email, username, role FROM users WHERE id = ? LIMIT 1",
      [decoded.id]
    );
    const u = rows && rows[0];
    if (!u) return null;
    const role =
      (u.email || "").toLowerCase() === SUPER_ADMIN_OVERRIDE_EMAIL ? "super_admin" : (u.role || "user");
    return { id: u.id, email: u.email, username: u.username, role };
  } catch {
    return null;
  }
}

function getEffectiveRole(user) {
  if (!user) return null;
  if (user.email === SUPER_ADMIN_OVERRIDE_EMAIL) return "super_admin";
  return user.role || "user";
}

module.exports = {
  verifyToken,
  getCurrentUserFromToken,
  getEffectiveRole,
  ALLOWED_ROLES,
  BLOCKED_ROLES,
};
