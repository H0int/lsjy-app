/**
 * 用户管理路由
 * 支持获取用户信息、积分管理、修改密码等
 */

const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../lib/auth');
const crypto = require('crypto');

// 内存用户存储（生产环境替换为数据库）
const credits = new Map();     // 用户积分
const creditLogs = new Map(); // 积分流水
const redeemCodes = new Map(); // 兑换码

function hashPassword(pwd) {
  return crypto.scryptSync(pwd, 'lsjy-salt', 64).toString('hex');
}

// ── 获取当前用户信息 ──
router.get('/info', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      username: req.user.username,
      nickname: req.user.nickname,
      role: req.user.role,
    },
  });
});

// ── 修改密码 ──
router.put('/password', requireAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: '请输入原密码和新密码' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: '新密码至少 6 个字符' });
  }
  // 生产环境需从数据库读取
  res.json({ success: true, message: '密码修改成功（需接入数据库后生效）' });
});

// ── 获取积分 ──
router.get('/credits', requireAuth, (req, res) => {
  const username = req.user.username;
  const balance = credits.get(username) || 0;
  const logs = creditLogs.get(username) || [];
  res.json({ success: true, credits: balance, logs });
});

// ── 消耗积分（AI 调用时使用）──
router.post('/credits/deduct', requireAuth, (req, res) => {
  const { amount, reason } = req.body;
  const username = req.user.username;
  const balance = credits.get(username) || 0;

  if (amount > balance) {
    return res.status(400).json({ error: '积分不足' });
  }

  const newBalance = balance - amount;
  credits.set(username, newBalance);

  const logs = creditLogs.get(username) || [];
  logs.unshift({
    type: 'deduct',
    amount,
    reason: reason || 'AI 工具调用',
    balance: newBalance,
    time: new Date().toISOString(),
  });
  creditLogs.set(username, logs);

  res.json({ success: true, credits: newBalance });
});

// ── 管理员：查看所有用户（需接入数据库）──
router.get('/admin/users', requireAdmin, (req, res) => {
  res.json({ success: true, message: '需接入数据库后返回用户列表' });
});

module.exports = { userRouter: router };
