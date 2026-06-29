import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';
import { JWT_SECRET } from '../config';

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * JWT 认证中间件
 * 从 Authorization: Bearer <token> 中提取并解析 JWT
 * 注意：后端网关可能已验证，这里主要解析 payload 获取 userId
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: '缺少认证令牌，请在请求头中提供 Authorization: Bearer <token>',
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    // 尝试完整验证（如果有 JWT_SECRET）
    if (JWT_SECRET && JWT_SECRET !== 'luosheng-default-secret') {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      req.user = decoded;
    } else {
      // 仅解析 payload（网关已验证的场景）
      const payload = decodePayload(token);
      if (!payload) {
        throw new Error('Invalid token payload');
      }
      req.user = payload;
    }
    next();
  } catch (err) {
    // token 无效但尝试解析 payload 作为降级方案
    const payload = decodePayload(token);
    if (payload) {
      req.user = payload;
      next();
    } else {
      res.status(401).json({
        error: 'Unauthorized',
        message: '认证令牌无效或已过期',
      });
    }
  }
}

/**
 * 手动解码 JWT payload（不验证签名）
 */
function decodePayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
    return JSON.parse(payload) as JwtPayload;
  } catch {
    return null;
  }
}
