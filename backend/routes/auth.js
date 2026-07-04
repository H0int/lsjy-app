/**
 * 认证路由 - 登录/注册
 * 支持：用户名密码登录、短信验证码登录/注册
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { signToken } = require('../lib/auth');
const { verifyCode } = require('../lib/cache');

// 简单的用户存储（生产环境应使用数据库）
// 这里提供内存存储作为开发模式，后端部署后可接入 MySQL/PostgreSQL
const users = new Map();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'KF02V9';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'LKZ2005430';

// 密码加密（生产环境用 bcrypt）
function hashPassword(pwd) {
  return crypto.scryptSync(pwd, 'lsjy-salt', 64).toString('hex');
}

function verifyPassword(pwd, hash) {
  const input = crypto.scryptSync(pwd, 'lsjy-salt', 64).toString('hex');
  return input === hash;
}

// 初始化管理员账号
function initAdmin() {
  if (!users.has(ADMIN_USERNAME)) {
    users.set(ADMIN_USERNAME, {
      username: ADMIN_USERNAME,
      password: hashPassword(ADMIN_PASSWORD),
      nickname: '管理员',
      role: 'admin',
      created: new Date().toISOString(),
    });
    console.log(`[Auth] 管理员账号已初始化: ${ADMIN_USERNAME}`);
  }
}

initAdmin();

// ── 用户名密码登录 ──
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' });
    }

    const user = users.get(username);
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = signToken({
      username: user.username,
      nickname: user.nickname,
      role: user.role,
    });

    res.json({
      success: true,
      token,
      user: {
        username: user.username,
        nickname: user.nickname,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: '登录失败' });
  }
});

// ── 短信验证码登录 ──
router.post('/sms-login', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: '请输入手机号和验证码' });
    }

    const valid = await verifyCode(phone, code);
    if (!valid) {
      return res.status(400).json({ error: '验证码错误或已过期' });
    }

    // 自动注册或登录
    let user = users.get(phone);
    if (!user) {
      user = {
        username: phone,
        phone,
        nickname: `用户${phone.slice(-4)}`,
        role: 'user',
        created: new Date().toISOString(),
      };
      users.set(phone, user);
    }

    const token = signToken({
      username: user.username,
      nickname: user.nickname,
      role: user.role,
    });

    res.json({
      success: true,
      token,
      user: {
        username: user.username,
        nickname: user.nickname,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: '登录失败' });
  }
});

// ── 短信验证码注册 ──
router.post('/sms-register', async (req, res) => {
  try {
    const { phone, code, nickname } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: '请输入手机号和验证码' });
    }

    if (users.has(phone)) {
      return res.status(409).json({ error: '该手机号已注册' });
    }

    const valid = await verifyCode(phone, code);
    if (!valid) {
      return res.status(400).json({ error: '验证码错误或已过期' });
    }

    const user = {
      username: phone,
      phone,
      nickname: nickname || `用户${phone.slice(-4)}`,
      role: 'user',
      created: new Date().toISOString(),
    };
    users.set(phone, user);

    const token = signToken({
      username: user.username,
      nickname: user.nickname,
      role: user.role,
    });

    res.json({
      success: true,
      token,
      user: {
        username: user.username,
        nickname: user.nickname,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: '注册失败' });
  }
});

// ── 用户名密码注册 ──
router.post('/register', (req, res) => {
  try {
    const { username, password, nickname } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少 6 个字符' });
    }
    if (users.has(username)) {
      return res.status(409).json({ error: '用户名已存在' });
    }

    const user = {
      username,
      password: hashPassword(password),
      nickname: nickname || username,
      role: 'user',
      created: new Date().toISOString(),
    };
    users.set(username, user);

    const token = signToken({
      username: user.username,
      nickname: user.nickname,
      role: user.role,
    });

    res.json({
      success: true,
      token,
      user: {
        username: user.username,
        nickname: user.nickname,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: '注册失败' });
  }
});

module.exports = { authRouter: router };
