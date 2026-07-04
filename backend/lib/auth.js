/**
 * 认证中间件
 * 使用简单的 JWT 方案（不依赖 jsonwebtoken 库，用 crypto 实现）
 */

const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'lsjy-default-secret-change-me';
const JWT_EXPIRE = parseInt(process.env.JWT_EXPIRE) || 604800; // 7 天

/**
 * 生成 Token
 * @param {object} payload - 用户信息
 * @returns {string} token
 */
function signToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + JWT_EXPIRE;
  const body = Buffer.from(JSON.stringify({ ...payload, exp, iat: Math.floor(Date.now() / 1000) })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * 验证 Token
 * @param {string} token
 * @returns {object|null} payload 或 null
 */
function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Express 中间件：要求登录
 */
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录，请先登录' });
  }
  const token = auth.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
  req.user = payload;
  next();
}

/**
 * Express 中间件：要求管理员权限
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: '权限不足，需要管理员权限' });
    }
    next();
  });
}

module.exports = { signToken, verifyToken, requireAuth, requireAdmin };
