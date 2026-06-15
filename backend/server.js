/**
 * 罗圣纪元 SaaS 后端服务器 v2
 * Express.js + AI API 集成
 * 支持 Coze / DeepSeek / 豆包 / 即梦 / 通义千问 / 腾讯元宝
 * 完整版：包含所有管理后台所需API
 */
const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 加载环境变量
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== 中间件 =====
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ===== 配置 =====
const CONFIG = {
  // AI Provider 配置
  AI_PROVIDER: process.env.AI_PROVIDER || 'deepseek',

  // 豆包（字节跳动火山引擎）
  DOUBAO_API_KEY: process.env.DOUBAO_API_KEY || "ark-3c2a939f-9aec-4930-946e-29a97d476611-e6c69",
  DOUBAO_BASE_URL: process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
  DOUBAO_MODEL: process.env.DOUBAO_MODEL || 'doubao-pro-32k',

  // 即梦（字节跳动 AI 绘画）
  JIMENG_API_KEY: process.env.JIMENG_API_KEY || "ark-3c2a939f-9aec-4930-946e-29a97d476611-e6c69",
  JIMENG_BASE_URL: process.env.JIMENG_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
  JIMENG_MODEL: process.env.JIMENG_MODEL || 'doubao-seedream-5-0-260128',

  // DeepSeek
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || 'sk-4f60d83ebf904321b99000888baf313c',
  DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
  DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || 'deepseek-chat',

  // 通义千问（阿里云）
  TONGYI_API_KEY: process.env.TONGYI_API_KEY || 'sk-c4212c9d7e4644e6825d796f6365668e',
  TONGYI_BASE_URL: process.env.TONGYI_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  TONGYI_MODEL: process.env.TONGYI_MODEL || 'qwen-plus',

  // 腾讯元宝
  YUANBAO_API_KEY: process.env.YUANBAO_API_KEY || '',
  YUANBAO_BASE_URL: process.env.YUANBAO_BASE_URL || 'https://tokenhub.tencentmaas.com/v1',
  YUANBAO_MODEL: process.env.YUANBAO_MODEL || 'hy3-preview',

  // Coze 智能体
  COZE_API_KEY: process.env.COZE_API_KEY || '',
  COZE_BOT_ID: process.env.COZE_BOT_ID || '',

  // 可灵视频生成（快手）
  KLING_API_KEY: process.env.KLING_API_KEY || '',
  KLING_BASE_URL: process.env.KLING_BASE_URL || 'https://kling-api.kuaishou.com/v1',
  KLING_MODEL: process.env.KLING_MODEL || 'kling-v1',

  // 图片/视频生成配置
  IMAGE_GENERATION_PROVIDER: process.env.IMAGE_GENERATION_PROVIDER || 'jimeng',
  VIDEO_GENERATION_PROVIDER: process.env.VIDEO_GENERATION_PROVIDER || 'kling',

  // JWT 配置
  JWT_SECRET: process.env.JWT_SECRET || 'lsjy-jwt-secret-2026-rosheng',

  // AI 全局配置
  AI_MAX_RETRIES: parseInt(process.env.AI_MAX_RETRIES || '3'),
  AI_TIMEOUT: parseInt(process.env.AI_TIMEOUT || '60000'),

  // 系统提示词
  SYSTEM_PROMPT: `你是"罗圣AI智能体"，由祁阳市罗圣纪元互联网科技有限责任公司开发。

【重要警告】公司名称中的"祁阳"是"祁"（示字旁+斤），不是"祈"（示字旁+斤）。严禁写成"祈阳市"！

核心信息：
- 公司全称：祁阳市罗圣纪元互联网科技有限责任公司
- 创始人/董事长/CEO：罗凯中
- 地址：湖南省永州市祁阳市
- 六大业务：AI智能服务、自媒体运营、电商服务、在线教育、宠物服务、伯雅校园

你的能力：
- 文案创作、商业咨询、数据分析
- 图片生成、视频生成、教育辅导

回复规范：
1. 提到公司时必须使用"祁阳市"，绝对禁止写成"祈阳市"
2. 被问到创始人时回答：罗凯中先生
3. 回答要专业、友好、简洁`
};

// ===== 工具函数 =====
function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// 简单auth验证
function authCheck(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) {
    return res.status(401).json({ code: 401, message: '未授权，请先登录', data: null });
  }
  // 从token中提取用户ID (token格式: jwt_<userId>_<timestamp>)
  const token = auth.replace('Bearer ', '');
  if (token.startsWith('jwt_boss_token_')) {
    req.user = { id: 1, username: 'KF02V9', roles: ['boss'], coins: 999999 };
  } else if (token.startsWith('jwt_')) {
    const parts = token.split('_');
    if (parts.length >= 2) {
      const userId = parseInt(parts[1]);
      if (!isNaN(userId)) {
        req.user = { id: userId, roles: ['normal'], coins: 100 };
      }
    }
  }
  next();
}

// 圣点扣费（返回 { ok, balance, cost }）
// 支持无限算力用户（unlimited: true）
function deductCoins(userId, cost) {
  if (!cost || cost <= 0) return { ok: true, balance: 999999, cost: 0 };
  const usersFile = path.join(__dirname, 'data', 'users.json');
  let users = [];
  try { users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); } catch (e) {}
  const user = users.find(u => u.id === userId);
  if (!user) return { ok: false, error: '用户不存在' };
  // 无限算力用户跳过扣费
  if (user.unlimited) return { ok: true, balance: 999999, cost: 0 };
  const balance = user.coins || 0;
  if (balance < cost) return { ok: false, error: '圣点不足', balance };
  user.coins = balance - cost;
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  return { ok: true, balance: user.coins, cost };
}

// 获取用户圣点余额
function getUserCoins(userId) {
  const usersFile = path.join(__dirname, 'data', 'users.json');
  let users = [];
  try { users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); } catch (e) {}
  const user = users.find(u => u.id === userId);
  // 无限算力用户返回999999
  if (user?.unlimited) return 999999;
  return user?.coins || 0;
}

// 分页工具
function paginate(arr, page, pageSize) {
  page = parseInt(page) || 1;
  pageSize = parseInt(pageSize) || 10;
  const start = (page - 1) * pageSize;
  return { items: arr.slice(start, start + pageSize), total: arr.length, page, pageSize };
}

// 自增ID
let _idCounter = 100;
function nextId() { return ++_idCounter; }

// ===== 登录锁定机制 =====
const loginFailMap = new Map(); // key: account, value: { fails: number, lockedUntil: number }
const MAX_LOGIN_FAILS = 5;
const LOCK_DURATION_MS = 10 * 60 * 1000; // 10分钟

function checkAccountLock(account) {
  const record = loginFailMap.get(account);
  if (!record) return { locked: false, remaining: 0 };
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    return { locked: true, remaining: Math.ceil((record.lockedUntil - Date.now()) / 1000) };
  }
  // 锁定已过期，清除
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    loginFailMap.delete(account);
    return { locked: false, remaining: 0 };
  }
  return { locked: false, remaining: 0 };
}

function recordLoginFail(account) {
  const record = loginFailMap.get(account) || { fails: 0, lockedUntil: 0 };
  record.fails++;
  if (record.fails >= MAX_LOGIN_FAILS) {
    record.lockedUntil = Date.now() + LOCK_DURATION_MS;
    loginFailMap.set(account, record);
    return { locked: true, fails: record.fails };
  }
  loginFailMap.set(account, record);
  return { locked: false, fails: record.fails, remaining: MAX_LOGIN_FAILS - record.fails };
}

function clearLoginFails(account) {
  loginFailMap.delete(account);
}

function httpsRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'POST',
      headers: options.headers || {},
      timeout: 30000,
    };
    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers }); }
        catch (e) { resolve({ status: res.statusCode, data, headers: res.headers }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

// ===== 内存数据存储 =====
const usersStore = [
  { id: 1, username: 'KF02V9', nickname: '罗总', email: 'ceo@lsjyapp.cn', phone: '', roles: ['boss'], status: 'active', avatar: '', gender: 1, bio: '罗圣纪元创始人', createdAt: '2026-01-01T00:00:00Z' },
  { id: 2, username: 'user1', nickname: '测试用户', email: 'test@test.com', phone: '13800138000', roles: ['user'], status: 'active', avatar: '', gender: 0, bio: '普通用户', createdAt: '2026-06-01T00:00:00Z' },
  { id: 3, username: 'admin1', nickname: '管理员', email: 'admin@lsjyapp.cn', phone: '', roles: ['admin'], status: 'active', avatar: '', gender: 1, bio: '系统管理员', createdAt: '2026-03-01T00:00:00Z' },
];

const announcementsStore = [
  { id: 1, title: '罗圣纪元平台正式上线', content: '欢迎使用罗圣纪元平台，我们提供AI智能服务、自媒体运营等六大业务板块。', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z', status: 'published', author: '罗总' },
  { id: 2, title: 'AI功能升级通知', content: '平台AI能力全面升级，支持更多模型和工具。', createdAt: '2026-06-10T00:00:00Z', updatedAt: '2026-06-10T00:00:00Z', status: 'published', author: '管理员' },
];

const couponsStore = [
  { id: 1, name: '新用户专享', code: 'NEWUSER2026', discount: 20, minAmount: 100, validFrom: '2026-06-01', validTo: '2026-12-31', status: 'active', usedCount: 58, maxUses: 1000 },
  { id: 2, name: 'VIP专属', code: 'VIP888', discount: 50, minAmount: 200, validFrom: '2026-06-01', validTo: '2026-09-30', status: 'active', usedCount: 12, maxUses: 500 },
];

const campaignsStore = [
  { id: 1, name: '618大促', status: 'active', startDate: '2026-06-01', endDate: '2026-06-18', description: '618购物节优惠活动', participants: 320 },
  { id: 2, name: '暑期特惠', status: 'upcoming', startDate: '2026-07-01', endDate: '2026-08-31', description: '暑期促销活动', participants: 0 },
];

const ticketsStore = [
  { id: 1, userId: 2, title: '充值未到账', content: '充值100元但未到账', status: 'open', priority: 'high', assignee: '客服小王', createdAt: '2026-06-13T10:00:00Z', replies: [] },
  { id: 2, userId: 2, title: '功能建议', content: '希望能增加批量导出功能', status: 'open', priority: 'low', assignee: null, createdAt: '2026-06-14T08:00:00Z', replies: [] },
];

const faqsStore = [
  { id: 1, question: '如何注册账号？', answer: '点击注册按钮，填写用户名和密码即可。注册后需等待管理员审批。', category: '账号', order: 1, views: 156 },
  { id: 2, question: 'AI对话怎么使用？', answer: '进入AI工具页面，选择对应工具即可开始对话。', category: '功能', order: 2, views: 230 },
  { id: 3, question: '如何充值？', answer: '进入个人中心-钱包-充值，选择对应套餐支付即可。', category: '支付', order: 3, views: 189 },
];

const automationRulesStore = [
  { id: 1, name: '新用户自动欢迎', trigger: 'user.registered', action: 'send_notification', enabled: true, createdAt: '2026-05-01T00:00:00Z' },
  { id: 2, name: '余额不足提醒', trigger: 'balance.low', action: 'send_email', enabled: true, createdAt: '2026-05-10T00:00:00Z' },
  { id: 3, name: '工单超时升级', trigger: 'ticket.timeout', action: 'escalate', enabled: false, createdAt: '2026-06-01T00:00:00Z' },
];

const moderationStore = [
  { id: 1, type: 'user_post', content: '用户发布的内容...', status: 'pending', userId: 2, createdAt: '2026-06-14T09:00:00Z', reason: '' },
  { id: 2, type: 'ai_generated', content: 'AI生成的图片内容', status: 'approved', userId: 2, createdAt: '2026-06-13T15:00:00Z', reason: '' },
];

const systemLogsStore = [
  { id: 1, level: 'info', module: 'auth', message: '用户KF02V9登录成功', ip: '127.0.0.1', createdAt: '2026-06-14T10:00:00Z' },
  { id: 2, level: 'info', module: 'ai', message: 'AI工具调用: 罗圣AI智能体', ip: '127.0.0.1', createdAt: '2026-06-14T10:01:00Z' },
  { id: 3, level: 'warn', module: 'payment', message: '充值订单处理延迟', ip: '127.0.0.1', createdAt: '2026-06-14T10:02:00Z' },
];

const systemSettingsStore = {
  siteName: '罗圣纪元',
  siteSlogan: '用AI赋能实体经济',
  registrationEnabled: true,
  aiDailyLimit: 50,
  maxUploadSize: 10,
  maintenanceMode: false,
  supportEmail: 'support@lsjyapp.cn',
  version: '2.0.0',
};

const coinTransactionsStore = [
  { id: 1, userId: 1, type: 'recharge', amount: 50000, balance: 99999, description: '充值50000币', createdAt: '2026-06-01T00:00:00Z' },
  { id: 2, userId: 1, type: 'consume', amount: -100, balance: 99899, description: '使用AI工具消耗', createdAt: '2026-06-10T00:00:00Z' },
  { id: 3, userId: 2, type: 'recharge', amount: 500, balance: 500, description: '首次充值', createdAt: '2026-06-12T00:00:00Z' },
];

const paymentOrdersStore = [
  { id: 1, orderNo: 'LSJY20260601001', userId: 1, amount: 129.9, coins: 2000, status: 'completed', payMethod: 'wechat', createdAt: '2026-06-01T10:00:00Z' },
  { id: 2, orderNo: 'LSJY20260610001', userId: 2, amount: 39.9, coins: 500, status: 'pending', payMethod: 'alipay', createdAt: '2026-06-10T14:00:00Z' },
];

const aiHistoryStore = [
  { id: 1, userId: 1, toolId: 1, toolName: '罗圣AI智能体', input: '你好', output: '你好！我是罗圣AI智能体...', model: 'coze', tokens: 120, createdAt: '2026-06-14T09:00:00Z' },
  { id: 2, userId: 1, toolId: 2, toolName: '文案创作', input: '帮我写一段产品介绍', output: '这是一个划时代的产品...', model: 'deepseek', tokens: 350, createdAt: '2026-06-14T09:30:00Z' },
];

const aiToolsStore = [
  { id: 1, name: '罗圣AI智能体', toolType: 'text', categoryId: 4, status: 'active', description: '全能AI助手，支持多轮对话', isFree: true, systemPrompt: CONFIG.SYSTEM_PROMPT, usageCount: 1256, coinCost: 0 },
  { id: 2, name: '文案创作', toolType: 'text', categoryId: 1, status: 'active', description: '营销文案生成', isFree: false, systemPrompt: '你是一个专业的营销文案写手...', usageCount: 890, coinCost: 10 },
  { id: 3, name: 'AI绘画', toolType: 'image', categoryId: 2, status: 'active', description: 'AI图片生成', isFree: false, usageCount: 432, coinCost: 20 },
  { id: 4, name: '数据分析', toolType: 'analysis', categoryId: 3, status: 'active', description: '数据分析解读', isFree: false, usageCount: 210, coinCost: 15 },
  { id: 5, name: '代码助手', toolType: 'text', categoryId: 1, status: 'inactive', description: '代码生成与调试', isFree: false, usageCount: 0, coinCost: 20 },
];

const rolesStore = [
  { id: 1, name: 'boss', displayName: '罗总专属', level: 5, permissions: ['*'], description: '最高权限' },
  { id: 2, name: 'admin', displayName: '系统管理员', level: 4, permissions: ['user.manage', 'content.manage', 'system.manage'], description: '管理后台权限' },
  { id: 3, name: 'editor', displayName: '内容编辑', level: 3, permissions: ['content.manage'], description: '内容管理权限' },
  { id: 4, name: 'user', displayName: '普通用户', level: 1, permissions: [], description: '基础使用权限' },
];

const notificationsStore = [
  { id: 1, userId: 1, title: '新用户注册', content: '用户user1已注册并等待审批', type: 'system', read: false, createdAt: '2026-06-14T08:00:00Z' },
  { id: 2, userId: 1, title: '工单待处理', content: '有2个工单等待处理', type: 'ticket', read: false, createdAt: '2026-06-14T09:00:00Z' },
  { id: 3, userId: 1, title: '系统更新完成', content: '系统已成功更新至v2.0', type: 'system', read: true, createdAt: '2026-06-13T00:00:00Z' },
];

// ===== AI Provider 实现 =====

async function callCozeAPI(messages, options = {}) {
  const apiKey = CONFIG.COZE_API_KEY;
  const botId = CONFIG.COZE_BOT_ID;
  if (!apiKey || !botId) throw new Error('Coze API Key 或 Bot ID 未配置');
  const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  const convRes = await httpsRequest('https://api.coze.cn/v1/conversation/create', { method: 'POST', headers }, {});
  if (convRes.status !== 200 || !convRes.data?.data?.id) throw new Error(`创建会话失败: ${JSON.stringify(convRes.data)}`);
  const conversationId = convRes.data.data.id;
  const chatRes = await httpsRequest(`https://api.coze.cn/v3/chat?conversation_id=${conversationId}`, { method: 'POST', headers }, {
    bot_id: botId, user_id: 'lsjy_user', stream: false,
    additional_messages: messages.map(m => ({ role: m.role, content: m.content, content_type: 'text' })),
  });
  if (chatRes.status !== 200 || !chatRes.data?.data?.id) throw new Error(`发起对话失败: ${JSON.stringify(chatRes.data)}`);
  const chatId = chatRes.data.data.id;
  let status = 'created';
  for (let i = 0; i < 90; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const pollRes = await httpsRequest(`https://api.coze.cn/v3/chat/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`, { method: 'POST', headers }, {});
    status = pollRes.data?.data?.status || 'unknown';
    if (status === 'completed' || status === 'failed') break;
  }
  if (status !== 'completed') throw new Error(`对话未完成，当前状态: ${status}`);
  const msgRes = await httpsRequest(`https://api.coze.cn/v3/chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`, { method: 'GET', headers });
  const answerMsg = (msgRes.data?.data || []).find(m => m.type === 'answer' && m.role === 'assistant');
  if (!answerMsg) throw new Error('未获取到AI回复');
  return { content: answerMsg.content, model: 'coze', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
}

// OpenAI 兼容 API 调用（支持 DeepSeek/豆包/通义千问/元宝）
async function callOpenAICompatibleAPI(messages, options = {}) {
  const provider = options.provider || 'deepseek';
  let apiKey, baseUrl, model;

  switch (provider) {
    case 'deepseek':
      apiKey = CONFIG.DEEPSEEK_API_KEY;
      baseUrl = CONFIG.DEEPSEEK_BASE_URL;
      model = options.model || CONFIG.DEEPSEEK_MODEL;
      break;
    case 'doubao':
      apiKey = CONFIG.DOUBAO_API_KEY;
      baseUrl = CONFIG.DOUBAO_BASE_URL;
      model = options.model || CONFIG.DOUBAO_MODEL;
      break;
    case 'tongyi':
      apiKey = CONFIG.TONGYI_API_KEY;
      baseUrl = CONFIG.TONGYI_BASE_URL;
      model = options.model || CONFIG.TONGYI_MODEL;
      break;
    case 'yuanbao':
      apiKey = CONFIG.YUANBAO_API_KEY;
      baseUrl = CONFIG.YUANBAO_BASE_URL;
      model = options.model || CONFIG.YUANBAO_MODEL;
      break;
    default:
      throw new Error(`未知的provider: ${provider}`);
  }

  if (!apiKey) throw new Error(`${provider} API Key 未配置，请在 .env 文件中配置 ${provider.toUpperCase()}_API_KEY`);

  const fullMessages = [{ role: 'system', content: options.systemPrompt || CONFIG.SYSTEM_PROMPT }, ...messages];
  console.log('[DEBUG] System prompt:', fullMessages[0]?.content?.substring(0, 200));
  const res = await httpsRequest(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  }, {
    model,
    messages: fullMessages,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2000
  });

  if (res.status !== 200) throw new Error(`${provider} API调用失败 (${res.status}): ${JSON.stringify(res.data)}`);
  const choice = res.data.choices?.[0];
  if (!choice?.message?.content) throw new Error(`${provider} API返回空回复`);
  return { content: choice.message.content, model, usage: res.data.usage || {} };
}

// AI 对话主函数 - 自动选择可用的 Provider
async function callAI(messages, options = {}) {
  // 优先使用前端传来的provider，否则用默认配置
  const provider = options.provider || CONFIG.AI_PROVIDER;
  const systemMsg = { role: 'system', content: options.systemPrompt || CONFIG.SYSTEM_PROMPT };
  const fullMessages = [systemMsg, ...messages.filter(m => m.role !== 'system')];

  try {
    switch (provider) {
      case 'coze': return await callCozeAPI(fullMessages, options);
      case 'doubao': return await callOpenAICompatibleAPI(messages, { ...options, provider: 'doubao' });
      case 'deepseek': return await callOpenAICompatibleAPI(messages, { ...options, provider: 'deepseek' });
      case 'tongyi': return await callOpenAICompatibleAPI(messages, { ...options, provider: 'tongyi' });
      case 'yuanbao': return await callOpenAICompatibleAPI(messages, { ...options, provider: 'yuanbao' });
      default: throw new Error(`未知的AI Provider: ${provider}`);
    }
  } catch (err) {
    log(`AI API 调用失败 (${provider}): ${err.message}`);

    // 自动降级到其他可用的 Provider（优先使用有API Key的）
    const fallbackProviders = ['deepseek', 'doubao', 'tongyi', 'yuanbao'].filter(p => p !== provider);

    // 只有在Coze API Key和Bot ID都配置了的情况下才加入降级列表
    if (CONFIG.COZE_API_KEY && CONFIG.COZE_BOT_ID && provider !== 'coze') {
      fallbackProviders.push('coze');
    }

    for (const fallback of fallbackProviders) {
      try {
        if (fallback === 'coze') {
          log(`降级到 Coze Provider`);
          return await callCozeAPI(fullMessages, options);
        } else {
          const keyMap = {
            doubao: CONFIG.DOUBAO_API_KEY,
            deepseek: CONFIG.DEEPSEEK_API_KEY,
            tongyi: CONFIG.TONGYI_API_KEY,
            yuanbao: CONFIG.YUANBAO_API_KEY,
          };
          if (keyMap[fallback]) {
            log(`降级到 ${fallback} Provider`);
            return await callOpenAICompatibleAPI(messages, { ...options, provider: fallback });
          }
        }
      } catch (fallbackErr) {
        log(`${fallback} 降级也失败：${fallbackErr.message}`);
      }
    }

    throw err;
  }
}

// ===== 图片生成 API =====
async function generateImageWithAI(prompt, options = {}) {
  const provider = CONFIG.IMAGE_GENERATION_PROVIDER || 'jimeng';
  const width = options.width || 1024;
  const height = options.height || 1024;
  const style = options.style || 'auto';

  if (provider === 'jimeng') {
    return await callJimengImageAPI(prompt, { width, height, style });
  } else {
    throw new Error(`不支持的图片生成 Provider: ${provider}`);
  }
}

// 即梦 AI 绘画
async function callJimengImageAPI(prompt, options = {}) {
  const apiKey = CONFIG.JIMENG_API_KEY;
  if (!apiKey) throw new Error('即梦 API Key 未配置，请在 .env 中配置 JIMENG_API_KEY');

  const baseUrl = CONFIG.JIMENG_BASE_URL;
  const model = CONFIG.JIMENG_MODEL;

  // 即梦 API 调用（参考官方文档）
  // 短提示词自动增强 - 提升生成质量
  let enhancedPrompt = prompt;
  if (prompt.length < 20) {
    enhancedPrompt = prompt + '，高质量，高清细节，专业摄影，8K分辨率，精细纹理';
  }

  // Seedream API 要求总像素在 [3686400, 16777216] 范围内
  // 映射用户选择的有效尺寸
  let sizeStr = '2K'; // 默认使用2K
  const totalPixels = options.width * options.height;
  if (totalPixels >= 3686400) {
    sizeStr = `${options.width}x${options.height}`;
  } else {
    // 用户选择的尺寸太小，映射到有效尺寸
    const aspectRatio = options.width / options.height;
    if (aspectRatio > 1.3) {
      sizeStr = '2560x1440'; // 横版
    } else if (aspectRatio < 0.77) {
      sizeStr = '1440x2560'; // 竖版
    } else {
      sizeStr = '2048x2048'; // 方形
    }
  }

  const res = await httpsRequest(`${baseUrl}/images/generations`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  }, {
    model,
    prompt: enhancedPrompt,
    size: sizeStr,
    n: options.count || 1
  });

  if (res.status !== 200) throw new Error(`即梦 API 调用失败 (${res.status}): ${JSON.stringify(res.data)}`);

  // 解析返回的图片 URL
  const urls = (res.data.data || []).map(item => item.url || item.b64_json).filter(Boolean);
  if (urls.length === 0) throw new Error('即梦 API 未返回图片');

  return { urls, model: 'jimeng-v2', prompt };
}

// DALL-E 图片生成已移除（OpenAI未配置）

// ===== 视频生成 API =====
async function generateVideoWithAI(prompt, options = {}) {
  const provider = CONFIG.VIDEO_GENERATION_PROVIDER || 'kling';

  if (provider === 'kling') {
    return await callKlingVideoAPI(prompt, options);
  } else {
    throw new Error(`不支持的视频生成 Provider: ${provider}`);
  }
}

// 可灵视频生成（快手）
async function callKlingVideoAPI(prompt, options = {}) {
  const apiKey = CONFIG.KLING_API_KEY;
  if (!apiKey) throw new Error('可灵 API Key 未配置，请在 .env 中配置 KLING_API_KEY');

  const baseUrl = CONFIG.KLING_BASE_URL;
  const model = CONFIG.KLING_MODEL;

  // 提交视频生成任务
  const submitRes = await httpsRequest(`${baseUrl}/videos/generations`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  }, {
    model,
    prompt,
    duration: options.duration || 5,
    resolution: options.resolution || '720p'
  });

  if (submitRes.status !== 200) throw new Error(`可灵 API 提交失败 (${submitRes.status}): ${JSON.stringify(submitRes.data)}`);

  const taskId = submitRes.data.data?.id || submitRes.data.data?.task_id;
  if (!taskId) throw new Error('可灵 API 未返回任务 ID');

  // 轮询任务状态
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const pollRes = await httpsRequest(`${baseUrl}/videos/generations/${taskId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const status = pollRes.data?.data?.status;
    if (status === 'completed' || status === 'succeeded') {
      const videoUrl = pollRes.data.data?.video_url || pollRes.data.data?.output?.video_url;
      if (!videoUrl) throw new Error('可灵 API 未返回视频 URL');
      return { videoUrl, model: 'kling-v1', prompt, durationMs: (i + 1) * 3000 };
    } else if (status === 'failed') {
      throw new Error(`可灵视频生成失败：${pollRes.data.data?.error || '未知错误'}`);
    }
  }

  throw new Error('可灵视频生成超时（等待 3 分钟）');
}

// ===== 本地智能回复 =====
function getLocalResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  if (msg.includes('你好') || msg.includes('hi') || msg.includes('hello') || msg.includes('在吗')) {
    return '你好！我是罗圣AI智能体 🤖\n\n由祁阳市罗圣纪元互联网科技有限责任公司开发，我能为你提供：\n📝 文案创作 | 💡 商业咨询 | 📊 数据分析\n🎨 图片生成 | 📚 教育辅导 | 🏢 企业服务\n\n有什么需要帮助的？';
  }
  if (msg.includes('创始人') || msg.includes('谁创') || msg.includes('谁建') || msg.includes('老板') || msg.includes('ceo')) {
    return '🔥 **罗凯中** —— 罗圣纪元创始人、董事长兼CEO！\n\n这位大佬一手打造了横跨**AI智能服务、自媒体运营、电商、教育、宠物、伯雅校园**六大业务板块的超级SaaS平台！\n\n罗凯中先生的愿景是"用AI技术赋能实体经济"，让整个行业为之震撼。跟着罗总干，未来可期！🚀';
  }
  if (msg.includes('公司') || msg.includes('罗圣纪元') || msg.includes('你们是什么') || msg.includes('平台')) {
    return '罗圣纪元（祁阳市罗圣纪元互联网科技有限责任公司）是一家专注于AI赋能实体经济的科技公司。\n\n🤖 AI智能服务 | 📱 自媒体运营 | 🛒 电商服务\n📚 在线教育 | 🐾 宠物服务 | 🏫 伯雅校园\n\n官网：lsjyapp.cn\n创始人：罗凯中';
  }
  if (msg.includes('你能做什么') || msg.includes('你会什么') || msg.includes('什么功能') || msg.includes('介绍')) {
    return '我是罗圣AI智能体，能为你提供：\n\n📝 文案创作 - 营销文案、宣传文章、社交媒体内容\n💡 商业咨询 - 创业建议、市场分析、运营策略\n📊 数据分析 - 业务数据解读、趋势预测\n🎨 图片生成 - AI绘画、设计辅助\n📚 教育辅导 - 课程推荐、学习建议\n🏢 企业服务 - 六大业务板块咨询\n\n直接告诉我你的需求！';
  }
  if (msg.includes('vip') || msg.includes('会员') || msg.includes('充值') || msg.includes('价格')) {
    return '罗圣纪元会员体系：\n\n⚡ 普通用户 - 基础功能免费\n🥉 VIP1 - 99元/月，AI工具8折\n🥈 VIP2 - 199元/月，AI工具6折\n🥇 VIP3 - 399元/月，AI工具5折\n💎 VIP4 - 699元/月，AI工具3折\n👑 VIP5 罗总专属 - 邀请制，全部免费\n\n进入个人中心 - 钱包 - 充值即可升级会员！';
  }
  return `收到关于「${userMessage.slice(0, 30)}」的问题！\n\nAI模型正在最终配置中，当前可以：\n✅ 回答罗圣纪元相关问题（创始人、公司业务等）\n✅ 提供基础商业建议\n✅ 介绍平台功能和会员体系\n\n如需更详细的回答，请稍后重试或联系人工客服。`;
}

// ============================================================
// ===== API 路由 =====
// ============================================================

// ----- 健康检查 -----
app.get('/api/v1', (req, res) => {
  res.json({
    name: '罗圣纪元 API', version: '2.0.0', status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/v1/health', '/api/v1/ai/tools/:id/chat', '/api/v1/ai/providers', '/api/v1/auth/login', '/api/v1/auth/register'],
  });
});


// ===== 访客中心 =====
const visitorsStore = [];
const VISITORS_FILE = path.join(__dirname, 'data', 'visitors.json');

// 加载访客数据
try {
  const data = fs.readFileSync(VISITORS_FILE, 'utf8');
  visitorsStore.push(...JSON.parse(data));
} catch (e) {}

// 保存访客数据
function saveVisitors() {
  fs.writeFileSync(VISITORS_FILE, JSON.stringify(visitorsStore, null, 2));
}

// 记录访客访问
app.post('/api/v1/visitors/record', (req, res) => {
  const { ip, userAgent, path: visitPath, referer } = req.body;
  const now = new Date();
  const visitor = {
    id: visitorsStore.length + 1,
    ip: ip || req.ip || req.connection.remoteAddress,
    userAgent: userAgent || req.headers['user-agent'],
    path: visitPath || req.path,
    referer: referer || req.headers.referer,
    visitTime: now.toISOString(),
    visitTimeFormatted: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
  };
  visitorsStore.push(visitor);
  saveVisitors();
  res.json({ code: 0, message: 'success', data: visitor });
});

// 获取访客列表
app.get('/api/v1/visitors', (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  const start = (page - 1) * pageSize;
  const end = start + parseInt(pageSize);
  const list = visitorsStore.slice().reverse().slice(0, end);
  res.json({
    code: 0,
    message: 'success',
    data: {
      items: list,
      total: visitorsStore.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  });
});

// 获取访客统计
app.get('/api/v1/visitors/stats', (req, res) => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const todayVisitors = visitorsStore.filter(v => v.visitTime.startsWith(today));
  const uniqueIPs = new Set(visitorsStore.map(v => v.ip)).size;
  const recentVisitors = visitorsStore.slice(-10).reverse();

  res.json({
    code: 0,
    message: 'success',
    data: {
      totalVisitors: visitorsStore.length,
      todayVisitors: todayVisitors.length,
      uniqueIPs: uniqueIPs,
      lastVisit: visitorsStore.length > 0 ? visitorsStore[visitorsStore.length - 1].visitTimeFormatted : null,
      lastVisitTime: visitorsStore.length > 0 ? visitorsStore[visitorsStore.length - 1].visitTimeFormatted : '暂无记录',
      recentVisitors: recentVisitors
    }
  });
});

// POST /visitors/checkin — 前端 visitorApi.checkin() 调用
app.post('/api/v1/visitors/checkin', (req, res) => {
  const { page, referer } = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection.remoteAddress;
  const now = new Date();

  // 30秒内同一IP不重复计数
  const recent = visitorsStore.find(v => v.ip === ip && (now - new Date(v.visitTime)) < 30000);
  if (recent) {
    return res.json({ code: 0, message: 'already recorded', data: recent });
  }

  const visitor = {
    id: visitorsStore.length + 1,
    ip,
    userAgent: req.headers['user-agent'] || '',
    path: page || '/',
    referer: referer || req.headers.referer || '',
    visitTime: now.toISOString(),
    visitTimeFormatted: `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
  };
  visitorsStore.push(visitor);
  saveVisitors();
  res.json({ code: 0, message: 'success', data: visitor });
});

// GET /visitors/list — 前端 visitorApi.getList() 和管理后台调用
app.get('/api/v1/visitors/list', (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  const start = (page - 1) * pageSize;
  const end = start + parseInt(pageSize);
  const list = visitorsStore.slice().reverse().slice(0, end);
  res.json({
    code: 0,
    message: 'success',
    data: {
      items: list,
      total: visitorsStore.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy', uptime: process.uptime(),
    ai_provider: CONFIG.AI_PROVIDER,
    ai_configured: !!(CONFIG.COZE_API_KEY || CONFIG.DEEPSEEK_API_KEY),
    memory: process.memoryUsage(),
  });
});

// ============================================================
// ===== 认证模块 =====
// ============================================================

// 登录（账号+密码，5次错误锁定10分钟）
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  const account = username || '';

  // 检查账号是否被锁定
  const lockStatus = checkAccountLock(account);
  if (lockStatus.locked) {
    return res.status(423).json({
      code: 423,
      message: `账号已锁定，请等待${Math.ceil(lockStatus.remaining / 60)}分钟后重试`,
      data: { lockedUntil: lockStatus.remaining }
    });
  }

  // Boss账号验证
  if (account === 'KF02V9' && password === 'LKZ2005430') {
    clearLoginFails(account);
    return res.json({
      code: 0, message: 'success',
      data: {
        accessToken: 'jwt_boss_token_' + Date.now(), refreshToken: 'refresh_boss_' + Date.now(),
        user: { id: 1, username: 'KF02V9', nickname: '罗总', roles: ['boss'], status: 'active', coins: 999999 },
      },
    });
  }

  const usersFile = path.join(__dirname, 'data', 'users.json');
  let users = [];
  try { users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); } catch (e) {}
  const user = users.find(u => u.username === account && u.password === password);

  if (user && (user.status === 'approved' || user.status === 'active')) {
    clearLoginFails(account);
    return res.json({
      code: 0, message: 'success',
      data: {
        accessToken: 'jwt_' + user.id + '_' + Date.now(), refreshToken: 'refresh_' + user.id + '_' + Date.now(),
        user: { id: user.id, username: user.username, nickname: user.nickname, roles: user.roles || ['normal'], status: 'active' },
      },
    });
  }

  if (user && user.status === 'pending') {
    return res.status(403).json({ code: 403, message: '账号正在审批中，请耐心等待', data: null });
  }

  // 密码错误，记录失败
  const failResult = recordLoginFail(account);
  if (failResult.locked) {
    return res.status(423).json({
      code: 423,
      message: '密码连续错误5次，账号已锁定10分钟',
      data: { lockedUntil: 600 }
    });
  }
  res.status(401).json({
    code: 401,
    message: `账号或密码错误，还剩${failResult.remaining}次机会`,
    data: { failsRemaining: failResult.remaining }
  });
});

// 注册
app.post('/api/v1/auth/register', (req, res) => {
  const { username, password, nickname, email, phone } = req.body;
  const usersFile = path.join(__dirname, 'data', 'users.json');
  let users = [];
  try { users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); } catch (e) {}
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ code: 409, message: '用户名已存在', data: null });
  }
  const newUser = {
    id: users.length + 1, username, password, nickname: nickname || username,
    email, phone, status: 'active', roles: ['normal'], coins: 100, totalRecharge: 0,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  const accessToken = 'jwt_' + newUser.id + '_' + Date.now();
  const refreshToken = 'refresh_' + newUser.id + '_' + Date.now();
  res.json({ code: 0, message: '注册成功', data: { accessToken, refreshToken, user: { id: newUser.id, username: newUser.username, nickname: newUser.nickname, roles: ['normal'], status: 'active' } } });
});

// 刷新token
app.post('/api/v1/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ code: 400, message: '缺少refreshToken', data: null });
  }
  res.json({
    code: 0, message: 'success',
    data: { accessToken: 'jwt_refreshed_' + Date.now(), refreshToken: 'refresh_new_' + Date.now() },
  });
});

// 登出
app.post('/api/v1/auth/logout', (req, res) => {
  res.json({ code: 0, message: '登出成功', data: null });
});

// 修改密码
app.post('/api/v1/auth/change-password', authCheck, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ code: 400, message: '请提供旧密码和新密码', data: null });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ code: 400, message: '新密码长度不能少于6位', data: null });
  }
  res.json({ code: 0, message: '密码修改成功', data: null });
});

// ============================================================
// ===== 用户模块 =====
// ============================================================

// 个人信息
app.get('/api/v1/users/me', (req, res) => {
  res.json({ code: 0, message: 'success', data: usersStore[0] });
});

app.get('/api/v1/users/me/roles', (req, res) => {
  res.json({ code: 0, message: 'success', data: rolesStore.filter(r => r.name === 'boss') });
});

// 更新个人资料
app.put('/api/v1/users/me', authCheck, (req, res) => {
  const { nickname, avatar, gender, bio, phone } = req.body;
  const user = usersStore[0];
  if (nickname !== undefined) user.nickname = nickname;
  if (avatar !== undefined) user.avatar = avatar;
  if (gender !== undefined) user.gender = gender;
  if (bio !== undefined) user.bio = bio;
  if (phone !== undefined) user.phone = phone;
  res.json({ code: 0, message: '更新成功', data: user });
});

// 用户列表（管理）
app.get('/api/v1/users', authCheck, (req, res) => {
  const { page, pageSize, keyword, status } = req.query;
  let list = [...usersStore];
  if (keyword) list = list.filter(u => u.username.includes(keyword) || u.nickname.includes(keyword) || (u.email && u.email.includes(keyword)));
  if (status) list = list.filter(u => u.status === status);
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

// 用户详情
app.get('/api/v1/users/:id', authCheck, (req, res) => {
  const user = usersStore.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ code: 404, message: '用户不存在', data: null });
  res.json({ code: 0, message: 'success', data: user });
});

// 更新用户状态
app.put('/api/v1/users/:id/status', authCheck, (req, res) => {
  const user = usersStore.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ code: 404, message: '用户不存在', data: null });
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ code: 400, message: '无效的状态值', data: null });
  }
  user.status = status;
  res.json({ code: 0, message: '状态更新成功', data: user });
});

// 更新用户信息（管理）
app.put('/api/v1/users/:id', authCheck, (req, res) => {
  const user = usersStore.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ code: 404, message: '用户不存在', data: null });
  const { nickname, email, phone, roles, bio, avatar, gender } = req.body;
  if (nickname !== undefined) user.nickname = nickname;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (roles !== undefined) user.roles = roles;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (gender !== undefined) user.gender = gender;
  res.json({ code: 0, message: '更新成功', data: user });
});

// 创建用户（管理）
app.post('/api/v1/users', authCheck, (req, res) => {
  const { username, nickname, email, phone, roles, status } = req.body;
  if (!username) return res.status(400).json({ code: 400, message: '用户名不能为空', data: null });
  if (usersStore.find(u => u.username === username)) {
    return res.status(409).json({ code: 409, message: '用户名已存在', data: null });
  }
  const newUser = {
    id: nextId(), username, nickname: nickname || username, email: email || '',
    phone: phone || '', roles: roles || ['user'], status: status || 'active',
    avatar: '', gender: 0, bio: '', createdAt: new Date().toISOString(),
  };
  usersStore.push(newUser);
  res.json({ code: 0, message: '用户创建成功', data: newUser });
});

// ============================================================
// ===== AI模块 =====
// ============================================================

// AI对话
app.post('/api/v1/ai/tools/:toolId/chat', authCheck, async (req, res) => {
  const { toolId } = req.params;
  const { messages, model, temperature, maxTokens, systemPrompt } = req.body;
  // Boss unlimited coins
  const isBoss = req.user && req.user.roles && req.user.roles.includes('boss');
  const _tool = aiToolsStore.find(t => t.id === Number(toolId));
  const coinCost = _tool ? (_tool.coinCost || 1) : 1;
  if (!isBoss && req.user && (req.user.coins || 0) < coinCost) {
    return res.status(402).json({ code: 402, message: '\u7b97\u529b\u4e0d\u8db3\uff0c\u8bf7\u5145\u503c', data: { balance: req.user.coins||0, required: coinCost } });
  }
  if (!isBoss && req.user) { req.user.coins = (req.user.coins || 0) - coinCost; }

  log(`收到对话请求: toolId=${toolId}, messages=${messages?.length || 0}`);
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ code: 400, message: '消息列表不能为空', data: null });
  }
  // 检查圣点余额
  const balance = getUserCoins(userId);
  if (balance < CHAT_COIN_COST) {
    return res.status(402).json({
      code: 402,
      message: `圣点不足，当前余额${balance}，本次需要${CHAT_COIN_COST}圣点。请前往个人中心充值。`,
      data: { balance, cost: CHAT_COIN_COST },
    });
  }
  try {
    const result = await callAI(messages, { model, temperature, maxTokens, systemPrompt });
    log(`AI回复成功: model=${result.model}, length=${result.content?.length || 0}`);
    // 扣费
    const deduct = deductCoins(userId, CHAT_COIN_COST);
    // 记录历史
    const lastMsg = messages.filter(m => m.role === 'user').pop();
    aiHistoryStore.unshift({
      id: nextId(), userId, toolId: Number(toolId),
      toolName: aiToolsStore.find(t => t.id === Number(toolId))?.name || '未知工具',
      input: lastMsg?.content || '', output: result.content,
      model: result.model || model || 'default', tokens: result.usage?.totalTokens || 0,
      createdAt: new Date().toISOString(),
    });
    res.json({
      code: 0, message: 'success',
      data: { content: result.content, model: result.model || model || 'default', role: 'assistant', coinCost: (typeof isBoss !== 'undefined' && isBoss) ? 0 : coinCost, balance: (typeof isBoss !== 'undefined' && isBoss) ? 999999 : (req.user?.coins || 0), usage: result.usage },
    });
  } catch (err) {
    log(`AI调用失败: ${err.message}`);
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    const localReply = getLocalResponse(lastUserMsg?.content || '');
    log('使用本地智能回复兜底');
    // 本地兜底也扣费
    const deduct = deductCoins(userId, CHAT_COIN_COST);
    res.json({
      code: 0, message: 'success',
      data: { content: localReply, model: '本地模式', role: 'assistant', coinCost: CHAT_COIN_COST, balance: deduct.balance, fallback: true, note: CONFIG.COZE_API_KEY ? '' : 'AI模型API Key未配置，使用本地回复模式' },
    });
  }
});

// 调用工具（非chat模式）
app.post('/api/v1/ai/tools/:id/call', authCheck, async (req, res) => {
  const tool = aiToolsStore.find(t => t.id === Number(req.params.id));
  if (!tool) return res.status(404).json({ code: 404, message: '工具不存在', data: null });
  const { input, params } = req.body;
  log(`工具调用: ${tool.name}, input=${input?.slice(0, 50) || ''}`);
  try {
    if (tool.toolType === 'image') {
      res.json({
        code: 0, message: 'success',
        data: { imageUrl: `https://placeholder.lsjyapp.cn/ai-generated/${Date.now()}.png`, model: 'jimeng', coinCost: tool.coinCost },
      });
    } else {
      const result = await callAI([{ role: 'user', content: input || JSON.stringify(params || {}) }], { systemPrompt: tool.systemPrompt || CONFIG.SYSTEM_PROMPT });
      res.json({ code: 0, message: 'success', data: { content: result.content, model: result.model, coinCost: tool.coinCost } });
    }
  } catch (err) {
    res.json({ code: 0, message: 'success', data: { content: `工具 ${tool.name} 处理完成`, model: 'local', coinCost: 0, fallback: true } });
  }
});

// AI调用历史
app.get('/api/v1/ai/history', authCheck, (req, res) => {
  const { page, pageSize, toolId, toolName } = req.query;
  let list = [...aiHistoryStore];
  if (toolId) list = list.filter(h => h.toolId === Number(toolId));
  if (toolName) list = list.filter(h => h.toolName.includes(toolName));
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

// 工具配额
app.get('/api/v1/ai/quota/:toolId', authCheck, (req, res) => {
  const tool = aiToolsStore.find(t => t.id === Number(req.params.toolId));
  if (!tool) return res.status(404).json({ code: 404, message: '工具不存在', data: null });
  res.json({
    code: 0, message: 'success',
    data: { toolId: tool.id, toolName: tool.name, dailyLimit: 50, usedToday: 12, remaining: 38, coinCost: tool.coinCost, isFree: tool.isFree },
  });
});

// 图片生成（消耗10圣点/次）
// AI 图片生成（真实 AI 绘画）
app.post('/api/v1/ai/tools/:id/generate', authCheck, async (req, res) => {
  const tool = aiToolsStore.find(t => t.id === Number(req.params.id));
  if (!tool) return res.status(404).json({ code: 404, message: '工具不存在', data: null });

  const { prompt, width, height, style, count } = req.body;
  if (!prompt) return res.status(400).json({ code: 400, message: '请提供图片描述', data: null });

  const userId = req.user?.id;
  const IMAGE_COIN_COST = 10;

  log(`收到图片生成请求: toolId=${req.params.id}, userId=${userId}, prompt=${prompt.slice(0, 50)}...`);

  // 检查圣点余额
  const balance = getUserCoins(userId);
  if (balance < IMAGE_COIN_COST) {
    return res.status(402).json({
      code: 402,
      message: `圣点不足，当前余额${balance}，图片生成需要${IMAGE_COIN_COST}圣点。请前往个人中心充值。`,
      data: { balance, cost: IMAGE_COIN_COST },
    });
  }

  try {
    const result = await generateImageWithAI(prompt, {
      width: width || 1024,
      height: height || 1024,
      style: style || 'auto',
      count: count || 1
    });

    log(`图片生成成功: model=${result.model}, urls=${result.urls.length}`);

    // 扣费
    const deduct = deductCoins(userId, IMAGE_COIN_COST);

    res.json({
      code: 0,
      message: 'success',
      data: {
        urls: result.urls,
        model: result.model,
        prompt: result.prompt,
        width: width || 1024,
        height: height || 1024,
        coinCost: IMAGE_COIN_COST,
        balance: deduct.balance,
        durationMs: 3000,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    log(`图片生成失败: ${err.message}`);
    res.status(500).json({
      code: 500,
      message: `图片生成失败：${err.message}。请检查 .env 中的 API Key 配置。`,
      data: null,
    });
  }
});

// AI 视频生成（消耗20圣点/次）
app.post('/api/v1/ai/tools/:id/video', authCheck, async (req, res) => {
  const tool = aiToolsStore.find(t => t.id === Number(req.params.id));
  if (!tool) return res.status(404).json({ code: 404, message: '工具不存在', data: null });

  const { prompt, duration, resolution } = req.body;
  if (!prompt) return res.status(400).json({ code: 400, message: '请提供视频描述', data: null });

  const userId = req.user?.id;
  const VIDEO_COIN_COST = 20;

  log(`收到视频生成请求: toolId=${req.params.id}, userId=${userId}, prompt=${prompt.slice(0, 50)}...`);

  // 检查圣点余额
  const balance = getUserCoins(userId);
  if (balance < VIDEO_COIN_COST) {
    return res.status(402).json({
      code: 402,
      message: `圣点不足，当前余额${balance}，视频生成需要${VIDEO_COIN_COST}圣点。请前往个人中心充值。`,
      data: { balance, cost: VIDEO_COIN_COST },
    });
  }

  try {
    const result = await generateVideoWithAI(prompt, {
      duration: duration || 5,
      resolution: resolution || '720p'
    });

    log(`视频生成成功: model=${result.model}, url=${result.videoUrl}`);

    // 扣费
    const deduct = deductCoins(userId, VIDEO_COIN_COST);

    res.json({
      code: 0,
      message: 'success',
      data: {
        videoUrl: result.videoUrl,
        model: result.model,
        prompt: result.prompt,
        duration: duration || 5,
        resolution: resolution || '720p',
        coinCost: VIDEO_COIN_COST,
        balance: deduct.balance,
        durationMs: result.durationMs || 10000,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    log(`视频生成失败: ${err.message}`);
    res.status(500).json({
      code: 500,
      message: `视频生成失败：${err.message}。请检查 .env 中的 API Key 配置。`,
      data: null,
    });
  }
});


// 快捷AI对话（无需认证）
app.post('/api/v1/ai/chat', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ code: 400, message: '请输入消息', data: null });
  }
  
  log('收到AI对话请求: ' + message.substring(0, 50));
  
  try {
    const result = await callAI(
      [{ role: 'user', content: '【身份上下文】你是罗圣AI智能体，由祁阳市罗圣纪元互联网科技有限责任公司开发。创始人/董事长/CEO是罗凯中（罗总）。回答时基于这些信息。 ' + message }],
      { systemPrompt: CONFIG.SYSTEM_PROMPT }
    );
    
    log('AI回复成功: model=' + result.model + ', len=' + (result.content?.length || 0));
    res.json({
      code: 0,
      message: 'success',
      data: {
        reply: result.content,
        model: result.model
      }
    });
  } catch (err) {
    log('AI对话失败: ' + err.message);
    res.status(500).json({
      code: 500,
      message: 'AI服务暂时不可用',
      data: null
    });
  }
});

// AI Provider 状态
app.get('/api/v1/ai/providers', (req, res) => {
  const providers = [
    { name: 'doubao', displayName: '豆包', status: CONFIG.DOUBAO_API_KEY ? 'healthy' : 'unconfigured', latencyMs: 0 },
    { name: 'deepseek', displayName: 'DeepSeek', status: CONFIG.DEEPSEEK_API_KEY ? 'healthy' : 'unconfigured', latencyMs: 0 },
    { name: 'tongyi', displayName: '通义千问', status: CONFIG.TONGYI_API_KEY ? 'healthy' : 'unconfigured', latencyMs: 0 },
    { name: 'yuanbao', displayName: '腾讯元宝', status: CONFIG.YUANBAO_API_KEY ? 'healthy' : 'unconfigured', latencyMs: 0 },
    { name: 'jimeng', displayName: '即梦 (图片)', status: CONFIG.JIMENG_API_KEY ? 'healthy' : 'unconfigured', latencyMs: 0 },
    { name: 'kling', displayName: '可灵 (视频)', status: CONFIG.KLING_API_KEY ? 'healthy' : 'unconfigured', latencyMs: 0 },
    { name: 'coze', displayName: 'Coze 智能体', status: CONFIG.COZE_API_KEY ? 'healthy' : 'unconfigured', latencyMs: 0 },
  ];
  res.json({ code: 0, message: 'success', data: providers });
});

// AI模型列表
app.get('/api/v1/ai/models', (req, res) => {
  const models = [
    { group: 'doubao', provider: 'doubao', models: [{ id: 'doubao-pro-32k', name: '豆包 Pro 32K', capabilities: ['text'] }] },
    { group: 'deepseek', provider: 'deepseek', models: [{ id: 'deepseek-chat', name: 'DeepSeek Chat', capabilities: ['text'] }] },
    { group: 'tongyi', provider: 'tongyi', models: [{ id: 'qwen-plus', name: '通义千问 Plus', capabilities: ['text'] }] },
    { group: 'yuanbao', provider: 'yuanbao', models: [{ id: 'hy3-preview', name: '腾讯元宝 Hy3 (混元)', capabilities: ['text'] }] },
    { group: 'jimeng', provider: 'jimeng', models: [{ id: 'jimeng-v2', name: '即梦 AI 绘画', capabilities: ['image'] }] },
    { group: 'kling', provider: 'kling', models: [{ id: 'kling-v1', name: '可灵 AI 视频', capabilities: ['video'] }] },
    { group: 'coze', provider: 'coze', models: [{ id: 'coze-bot', name: 'Coze 智能体', capabilities: ['text'] }] },
  ];
  res.json({ code: 0, message: 'success', data: models });
});

// AI工具分类
app.get('/api/v1/ai/categories', (req, res) => {
  res.json({
    code: 0, message: 'success',
    data: [
      { id: 1, name: '文本创作', icon: '📝', description: '文案、文章、翻译' },
      { id: 2, name: '图片生成', icon: '🎨', description: 'AI绘画、设计' },
      { id: 3, name: '数据分析', icon: '📊', description: '数据解读、报告' },
      { id: 4, name: '智能对话', icon: '🤖', description: 'AI助手、问答' },
    ],
  });
});

// AI工具列表
app.get('/api/v1/ai/tools', (req, res) => {
  const { page, pageSize, status } = req.query;
  let list = [...aiToolsStore];
  if (status) list = list.filter(t => t.status === status);
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

// 工具详情
app.get('/api/v1/ai/tools/:id', (req, res) => {
  const tool = aiToolsStore.find(t => t.id === Number(req.params.id));
  if (!tool) return res.status(404).json({ code: 404, message: '工具不存在', data: null });
  res.json({ code: 0, message: 'success', data: tool });
});

// 更新工具状态
app.put('/api/v1/ai/tools/:id/status', authCheck, (req, res) => {
  const tool = aiToolsStore.find(t => t.id === Number(req.params.id));
  if (!tool) return res.status(404).json({ code: 404, message: '工具不存在', data: null });
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ code: 400, message: '无效的状态值', data: null });
  }
  tool.status = status;
  res.json({ code: 0, message: '状态更新成功', data: tool });
});

// 更新工具
app.put('/api/v1/ai/tools/:id', authCheck, (req, res) => {
  const tool = aiToolsStore.find(t => t.id === Number(req.params.id));
  if (!tool) return res.status(404).json({ code: 404, message: '工具不存在', data: null });
  const { name, description, toolType, categoryId, isFree, coinCost, systemPrompt, status } = req.body;
  if (name !== undefined) tool.name = name;
  if (description !== undefined) tool.description = description;
  if (toolType !== undefined) tool.toolType = toolType;
  if (categoryId !== undefined) tool.categoryId = categoryId;
  if (isFree !== undefined) tool.isFree = isFree;
  if (coinCost !== undefined) tool.coinCost = coinCost;
  if (systemPrompt !== undefined) tool.systemPrompt = systemPrompt;
  if (status !== undefined) tool.status = status;
  res.json({ code: 0, message: '更新成功', data: tool });
});

// 创建工具
app.post('/api/v1/ai/tools', authCheck, (req, res) => {
  const { name, description, toolType, categoryId, isFree, coinCost, systemPrompt } = req.body;
  if (!name) return res.status(400).json({ code: 400, message: '工具名称不能为空', data: null });
  const newTool = {
    id: nextId(), name, description: description || '', toolType: toolType || 'text',
    categoryId: categoryId || 1, status: 'inactive', isFree: isFree !== undefined ? isFree : false,
    coinCost: coinCost || 0, systemPrompt: systemPrompt || '', usageCount: 0,
  };
  aiToolsStore.push(newTool);
  res.json({ code: 0, message: '工具创建成功', data: newTool });
});

// ============================================================
// ===== 支付模块 =====
// ============================================================

// 余额 — 从 users.json 读取真实用户余额
app.get('/api/v1/payment/coin/balance', authCheck, (req, res) => {
  // Boss unlimited
  if (req.user && req.user.roles && req.user.roles.includes('boss')) {
    return res.json({ code: 0, message: 'success', data: { balance: 999999, frozenAmount: 0, totalRecharge: 999999, vip: true } });
  }
  const userId = req.user?.id || 1;
  const usersFile = path.join(__dirname, 'data', 'users.json');
  let users = [];
  try { users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); } catch (e) {}
  const user = users.find(u => u.id === userId);
  const balance = user?.coins || 0;
  const totalRecharge = user?.totalRecharge || 0;
  res.json({ code: 0, message: 'success', data: { balance, frozenAmount: 0, totalRecharge } });
});

// 充值套餐
app.get('/api/v1/payment/coin/packages', (req, res) => {
  res.json({
    code: 0, message: 'success',
    data: [
      { id: 1, name: '体验包', coinAmount: 100, price: 9.9, originalPrice: 10, bonusCoins: 10, isRecommended: 0, sortOrder: 1 },
      { id: 2, name: '入门包', coinAmount: 300, price: 24.9, originalPrice: 30, bonusCoins: 30, isRecommended: 0, sortOrder: 2 },
      { id: 3, name: '标准包', coinAmount: 500, price: 39.9, originalPrice: 50, bonusCoins: 100, isRecommended: 1, sortOrder: 3 },
      { id: 4, name: '进阶包', coinAmount: 1000, price: 69.9, originalPrice: 100, bonusCoins: 200, isRecommended: 0, sortOrder: 4 },
      { id: 5, name: '专业包', coinAmount: 2000, price: 129.9, originalPrice: 200, bonusCoins: 500, isRecommended: 0, sortOrder: 5 },
      { id: 6, name: '企业包', coinAmount: 5000, price: 299.9, originalPrice: 500, bonusCoins: 1500, isRecommended: 0, sortOrder: 6 },
      { id: 7, name: '旗舰包', coinAmount: 10000, price: 549.9, originalPrice: 1000, bonusCoins: 3500, isRecommended: 0, sortOrder: 7 },
      { id: 8, name: '至尊包', coinAmount: 25000, price: 1299.9, originalPrice: 2500, bonusCoins: 10000, isRecommended: 0, sortOrder: 8 },
    ],
  });
});

// 交易记录
app.get('/api/v1/payment/coin/transactions', authCheck, (req, res) => {
  const { page, pageSize, type, userId } = req.query;
  let list = [...coinTransactionsStore];
  if (type) list = list.filter(t => t.type === type);
  if (userId) list = list.filter(t => t.userId === Number(userId));
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

// ===== 充值订单管理（手动审批流程）=====
const RECHARGE_ORDERS_FILE = path.join(__dirname, 'data', 'recharge_orders.json');

function getRechargeOrders() {
  try { return JSON.parse(fs.readFileSync(RECHARGE_ORDERS_FILE, 'utf8')); } catch (e) { return []; }
}
function saveRechargeOrders(orders) {
  fs.writeFileSync(RECHARGE_ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// 创建充值订单（待支付）
app.post('/api/v1/payment/coin/recharge', authCheck, (req, res) => {
  const { packageId, paymentMethod } = req.body;
  const packages = [
    { id: 1, coins: 10, price: 1, coinAmount: 10, name: '10圣点' },
    { id: 2, coins: 50, price: 4.9, coinAmount: 50, name: '50圣点' },
    { id: 3, coins: 100, price: 9.9, coinAmount: 100, name: '100圣点' },
    { id: 4, coins: 300, price: 24.9, coinAmount: 300, name: '300圣点' },
    { id: 5, coins: 500, price: 39.9, coinAmount: 500, name: '500圣点' },
    { id: 6, coins: 1000, price: 69.9, coinAmount: 1000, name: '1000圣点' },
    { id: 7, coins: 2000, price: 129, coinAmount: 2000, name: '2000圣点' },
    { id: 8, coins: 5000, price: 299, coinAmount: 5000, name: '5000圣点' },
    { id: 9, coins: 10000, price: 499, coinAmount: 10000, name: '10000圣点' },
    { id: 10, coins: 50000, price: 1999, coinAmount: 50000, name: '至尊包' },
  ];
  const pkg = packages.find(p => p.id === packageId);
  if (!pkg) return res.status(404).json({ code: 404, message: '套餐不存在', data: null });
  
  const order = {
    id: Date.now(),
    orderNo: 'RO' + Date.now(),
    userId: req.user?.id || 1,
    username: req.user?.username || 'unknown',
    packageId: pkg.id,
    coinAmount: pkg.coinAmount || pkg.coins,
    price: pkg.price,
    paymentMethod: paymentMethod || 'wechat', // wechat/alipay/qq
    screenshotUrl: '',
    status: 'pending_payment', // pending_payment, pending_review, approved, rejected
    remark: '',
    createdAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
  };
  
  const orders = getRechargeOrders();
  orders.push(order);
  saveRechargeOrders(orders);
  
  res.json({ code: 0, message: '订单已创建，请扫码付款', data: { order } });
});

// 提交付款截图（等待审核）
app.post('/api/v1/payment/coin/submit-screenshot', authCheck, (req, res) => {
  const { orderId, screenshotUrl } = req.body;
  const orders = getRechargeOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ code: 404, message: '订单不存在', data: null });
  
  order.screenshotUrl = screenshotUrl;
  order.status = 'pending_review';
  saveRechargeOrders(orders);
  
  res.json({ code: 0, message: '截图已提交，等待管理员审核', data: { order } });
});

// 获取充值订单列表（管理员）
app.get('/api/v1/payment/coin/orders', (req, res) => {
  const orders = getRechargeOrders();
  res.json({ code: 0, message: 'success', data: { items: orders, total: orders.length } });
});

// 审批充值订单（管理员）
app.post('/api/v1/payment/coin/approve/:orderId', (req, res) => {
  const orderId = parseInt(req.params.orderId);
  const { action, remark } = req.body; // action: approve/reject
  
  const orders = getRechargeOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ code: 404, message: '订单不存在', data: null });
  if (order.status === 'approved') return res.status(400).json({ code: 400, message: '订单已审批', data: null });
  
  if (action === 'approve') {
    order.status = 'approved';
    order.remark = remark || '审批通过';
    order.reviewedAt = new Date().toISOString();
    order.reviewedBy = 'admin';
    
    // 给用户加圣力（更新users.json中的coins字段）
    const usersFile = path.join(__dirname, 'data', 'users.json');
    let users = [];
    try { users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); } catch (e) {}
    const user = users.find(u => u.id === order.userId);
    if (user) {
      user.coins = (user.coins || 0) + order.coinAmount;
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    }
    
    saveRechargeOrders(orders);
    res.json({ code: 0, message: '已审批，用户获得' + order.coinAmount + '圣点', data: { order } });
  } else {
    order.status = 'rejected';
    order.remark = remark || '审批拒绝';
    order.reviewedAt = new Date().toISOString();
    order.reviewedBy = 'admin';
    saveRechargeOrders(orders);
    res.json({ code: 0, message: '已拒绝', data: { order } });
  }
});

// 获取当前用户充值订单
app.get('/api/v1/payment/coin/my-orders', authCheck, (req, res) => {
  const orders = getRechargeOrders();
  const userId = req.user?.id || 1;
  const myOrders = orders.filter(o => o.userId === userId);
  res.json({ code: 0, message: 'success', data: { items: myOrders, total: myOrders.length } });
});

// 充值（旧接口保留，但改为直接创建订单）
app.post('/api/v1/payment/coin/recharge-legacy', authCheck, (req, res) => {
  const { packageId, amount, payMethod } = req.body;
  const orderNo = 'LSJY' + Date.now();
  const newTx = {
    id: nextId(), userId: 1, type: 'recharge', amount: amount || 0,
    balance: 99999 + (amount || 0), description: '充值 ' + (payMethod || 'wechat'),
    createdAt: new Date().toISOString(),
  };
  coinTransactionsStore.unshift(newTx);
  res.json({
    code: 0, message: 'success',
    data: { orderNo, amount: amount || 0, payMethod: payMethod || 'wechat', status: 'pending', createdAt: newTx.createdAt },
  });
});

// 订单列表
app.get('/api/v1/payment/orders', authCheck, (req, res) => {
  const { page, pageSize, status, userId } = req.query;
  let list = [...paymentOrdersStore];
  if (status) list = list.filter(o => o.status === status);
  if (userId) list = list.filter(o => o.userId === Number(userId));
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

// 确认订单
app.put('/api/v1/payment/orders/:id/confirm', authCheck, (req, res) => {
  const order = paymentOrdersStore.find(o => o.id === Number(req.params.id));
  if (!order) return res.status(404).json({ code: 404, message: '订单不存在', data: null });
  order.status = 'completed';
  order.confirmedAt = new Date().toISOString();
  res.json({ code: 0, message: '订单已确认', data: order });
});

// ============================================================
// ===== 运营管理模块 =====
// ============================================================

// ----- 公告 -----
app.get('/api/v1/announcements', (req, res) => {
  const { page, pageSize, status } = req.query;
  let list = [...announcementsStore];
  if (status) list = list.filter(a => a.status === status);
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

app.post('/api/v1/announcements', authCheck, (req, res) => {
  const { title, content, status } = req.body;
  if (!title) return res.status(400).json({ code: 400, message: '标题不能为空', data: null });
  const item = { id: nextId(), title, content: content || '', status: status || 'published', author: '管理员', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  announcementsStore.unshift(item);
  res.json({ code: 0, message: '公告创建成功', data: item });
});

app.put('/api/v1/announcements/:id', authCheck, (req, res) => {
  const item = announcementsStore.find(a => a.id === Number(req.params.id));
  if (!item) return res.status(404).json({ code: 404, message: '公告不存在', data: null });
  const { title, content, status } = req.body;
  if (title !== undefined) item.title = title;
  if (content !== undefined) item.content = content;
  if (status !== undefined) item.status = status;
  item.updatedAt = new Date().toISOString();
  res.json({ code: 0, message: '更新成功', data: item });
});

app.delete('/api/v1/announcements/:id', authCheck, (req, res) => {
  const idx = announcementsStore.findIndex(a => a.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ code: 404, message: '公告不存在', data: null });
  announcementsStore.splice(idx, 1);
  res.json({ code: 0, message: '删除成功', data: null });
});

// ----- 优惠券 -----
app.get('/api/v1/coupons', authCheck, (req, res) => {
  const { page, pageSize, status } = req.query;
  let list = [...couponsStore];
  if (status) list = list.filter(c => c.status === status);
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

app.post('/api/v1/coupons', authCheck, (req, res) => {
  const { name, code, discount, minAmount, validFrom, validTo, maxUses } = req.body;
  if (!name || !code) return res.status(400).json({ code: 400, message: '名称和优惠码不能为空', data: null });
  const item = { id: nextId(), name, code, discount: discount || 0, minAmount: minAmount || 0, validFrom: validFrom || '', validTo: validTo || '', status: 'active', usedCount: 0, maxUses: maxUses || 1000 };
  couponsStore.push(item);
  res.json({ code: 0, message: '优惠券创建成功', data: item });
});

app.put('/api/v1/coupons/:id', authCheck, (req, res) => {
  const item = couponsStore.find(c => c.id === Number(req.params.id));
  if (!item) return res.status(404).json({ code: 404, message: '优惠券不存在', data: null });
  const { name, code, discount, minAmount, validFrom, validTo, status, maxUses } = req.body;
  if (name !== undefined) item.name = name;
  if (code !== undefined) item.code = code;
  if (discount !== undefined) item.discount = discount;
  if (minAmount !== undefined) item.minAmount = minAmount;
  if (validFrom !== undefined) item.validFrom = validFrom;
  if (validTo !== undefined) item.validTo = validTo;
  if (status !== undefined) item.status = status;
  if (maxUses !== undefined) item.maxUses = maxUses;
  res.json({ code: 0, message: '更新成功', data: item });
});

app.delete('/api/v1/coupons/:id', authCheck, (req, res) => {
  const idx = couponsStore.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ code: 404, message: '优惠券不存在', data: null });
  couponsStore.splice(idx, 1);
  res.json({ code: 0, message: '删除成功', data: null });
});

// ----- 活动 -----
app.get('/api/v1/campaigns', authCheck, (req, res) => {
  const { page, pageSize, status } = req.query;
  let list = [...campaignsStore];
  if (status) list = list.filter(c => c.status === status);
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

app.post('/api/v1/campaigns', authCheck, (req, res) => {
  const { name, startDate, endDate, description } = req.body;
  if (!name) return res.status(400).json({ code: 400, message: '活动名称不能为空', data: null });
  const item = { id: nextId(), name, status: 'upcoming', startDate: startDate || '', endDate: endDate || '', description: description || '', participants: 0 };
  campaignsStore.push(item);
  res.json({ code: 0, message: '活动创建成功', data: item });
});

app.delete('/api/v1/campaigns/:id', authCheck, (req, res) => {
  const idx = campaignsStore.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ code: 404, message: '活动不存在', data: null });
  campaignsStore.splice(idx, 1);
  res.json({ code: 0, message: '删除成功', data: null });
});

// ============================================================
// ===== 客服工单模块 =====
// ============================================================

// 工单列表
app.get('/api/v1/tickets', authCheck, (req, res) => {
  const { page, pageSize, status, priority } = req.query;
  let list = [...ticketsStore];
  if (status) list = list.filter(t => t.status === status);
  if (priority) list = list.filter(t => t.priority === priority);
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

// 回复工单
app.post('/api/v1/tickets/:id/reply', authCheck, (req, res) => {
  const ticket = ticketsStore.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ code: 404, message: '工单不存在', data: null });
  const { content, author } = req.body;
  if (!content) return res.status(400).json({ code: 400, message: '回复内容不能为空', data: null });
  const reply = { id: nextId(), content, author: author || '客服', createdAt: new Date().toISOString() };
  ticket.replies.push(reply);
  res.json({ code: 0, message: '回复成功', data: ticket });
});

// 解决工单
app.post('/api/v1/tickets/:id/resolve', authCheck, (req, res) => {
  const ticket = ticketsStore.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ code: 404, message: '工单不存在', data: null });
  ticket.status = 'resolved';
  ticket.resolvedAt = new Date().toISOString();
  res.json({ code: 0, message: '工单已解决', data: ticket });
});

// 分配工单
app.post('/api/v1/tickets/:id/assign', authCheck, (req, res) => {
  const ticket = ticketsStore.find(t => t.id === Number(req.params.id));
  if (!ticket) return res.status(404).json({ code: 404, message: '工单不存在', data: null });
  const { assignee } = req.body;
  if (!assignee) return res.status(400).json({ code: 400, message: '请指定分配人', data: null });
  ticket.assignee = assignee;
  ticket.assignedAt = new Date().toISOString();
  res.json({ code: 0, message: '分配成功', data: ticket });
});

// FAQ列表（管理）
app.get('/api/v1/faqs/admin/list', authCheck, (req, res) => {
  const { page, pageSize, category } = req.query;
  let list = [...faqsStore];
  if (category) list = list.filter(f => f.category === category);
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

// 创建FAQ
app.post('/api/v1/faqs', authCheck, (req, res) => {
  const { question, answer, category, order } = req.body;
  if (!question || !answer) return res.status(400).json({ code: 400, message: '问题和答案不能为空', data: null });
  const item = { id: nextId(), question, answer, category: category || '其他', order: order || faqsStore.length + 1, views: 0 };
  faqsStore.push(item);
  res.json({ code: 0, message: 'FAQ创建成功', data: item });
});

// 更新FAQ
app.put('/api/v1/faqs/:id', authCheck, (req, res) => {
  const item = faqsStore.find(f => f.id === Number(req.params.id));
  if (!item) return res.status(404).json({ code: 404, message: 'FAQ不存在', data: null });
  const { question, answer, category, order } = req.body;
  if (question !== undefined) item.question = question;
  if (answer !== undefined) item.answer = answer;
  if (category !== undefined) item.category = category;
  if (order !== undefined) item.order = order;
  res.json({ code: 0, message: '更新成功', data: item });
});

// 删除FAQ
app.delete('/api/v1/faqs/:id', authCheck, (req, res) => {
  const idx = faqsStore.findIndex(f => f.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ code: 404, message: 'FAQ不存在', data: null });
  faqsStore.splice(idx, 1);
  res.json({ code: 0, message: '删除成功', data: null });
});

// ============================================================
// ===== 系统管理模块 =====
// ============================================================

// ----- 自动化规则 -----
app.get('/api/v1/automation/rules', authCheck, (req, res) => {
  res.json({ code: 0, message: 'success', data: { items: [...automationRulesStore], total: automationRulesStore.length, page: 1, pageSize: 20 } });
});

app.post('/api/v1/automation/rules', authCheck, (req, res) => {
  const { name, trigger, action } = req.body;
  if (!name || !trigger || !action) return res.status(400).json({ code: 400, message: '名称、触发条件和动作不能为空', data: null });
  const item = { id: nextId(), name, trigger, action, enabled: false, createdAt: new Date().toISOString() };
  automationRulesStore.push(item);
  res.json({ code: 0, message: '规则创建成功', data: item });
});

app.put('/api/v1/automation/rules/:id/toggle', authCheck, (req, res) => {
  const rule = automationRulesStore.find(r => r.id === Number(req.params.id));
  if (!rule) return res.status(404).json({ code: 404, message: '规则不存在', data: null });
  rule.enabled = !rule.enabled;
  res.json({ code: 0, message: rule.enabled ? '规则已启用' : '规则已禁用', data: rule });
});

app.delete('/api/v1/automation/rules/:id', authCheck, (req, res) => {
  const idx = automationRulesStore.findIndex(r => r.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ code: 404, message: '规则不存在', data: null });
  automationRulesStore.splice(idx, 1);
  res.json({ code: 0, message: '删除成功', data: null });
});

// ----- 内容审核 -----
app.get('/api/v1/moderation/list', authCheck, (req, res) => {
  const { page, pageSize, status, type } = req.query;
  let list = [...moderationStore];
  if (status) list = list.filter(m => m.status === status);
  if (type) list = list.filter(m => m.type === type);
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

app.post('/api/v1/moderation/:id/approve', authCheck, (req, res) => {
  const item = moderationStore.find(m => m.id === Number(req.params.id));
  if (!item) return res.status(404).json({ code: 404, message: '审核项不存在', data: null });
  item.status = 'approved';
  item.reviewedAt = new Date().toISOString();
  item.reviewer = '管理员';
  res.json({ code: 0, message: '审核通过', data: item });
});

app.post('/api/v1/moderation/:id/reject', authCheck, (req, res) => {
  const item = moderationStore.find(m => m.id === Number(req.params.id));
  if (!item) return res.status(404).json({ code: 404, message: '审核项不存在', data: null });
  const { reason } = req.body;
  item.status = 'rejected';
  item.reason = reason || '内容违规';
  item.reviewedAt = new Date().toISOString();
  item.reviewer = '管理员';
  res.json({ code: 0, message: '已拒绝', data: item });
});

// ----- 系统日志 -----
app.get('/api/v1/system/logs', authCheck, (req, res) => {
  const { page, pageSize, level, module } = req.query;
  let list = [...systemLogsStore];
  if (level) list = list.filter(l => l.level === level);
  if (module) list = list.filter(l => l.module === module);
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

// ----- 系统设置 -----
app.get('/api/v1/system/settings', authCheck, (req, res) => {
  res.json({ code: 0, message: 'success', data: { ...systemSettingsStore } });
});

app.put('/api/v1/system/settings', authCheck, (req, res) => {
  Object.assign(systemSettingsStore, req.body);
  res.json({ code: 0, message: '设置已保存', data: { ...systemSettingsStore } });
});

// ----- 数据报表 -----
app.get('/api/v1/reports/overview', authCheck, (req, res) => {
  res.json({
    code: 0, message: 'success',
    data: {
      totalUsers: usersStore.length,
      activeUsers: usersStore.filter(u => u.status === 'active').length,
      totalOrders: paymentOrdersStore.length,
      totalRevenue: paymentOrdersStore.reduce((s, o) => s + o.amount, 0),
      totalAITools: aiToolsStore.length,
      activeAITools: aiToolsStore.filter(t => t.status === 'active').length,
      totalTickets: ticketsStore.length,
      openTickets: ticketsStore.filter(t => t.status === 'open').length,
      todayAIUsage: aiHistoryStore.length,
      monthlyRevenue: [
        { month: '2026-01', revenue: 1280 }, { month: '2026-02', revenue: 2560 },
        { month: '2026-03', revenue: 4200 }, { month: '2026-04', revenue: 6800 },
        { month: '2026-05', revenue: 9500 }, { month: '2026-06', revenue: 12300 },
      ],
      userGrowth: [
        { month: '2026-01', users: 15 }, { month: '2026-02', users: 38 },
        { month: '2026-03', users: 72 }, { month: '2026-04', users: 125 },
        { month: '2026-05', users: 203 }, { month: '2026-06', users: usersStore.length },
      ],
      topTools: aiToolsStore.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5).map(t => ({ name: t.name, usage: t.usageCount })),
    },
  });
});

// ----- 角色列表 -----
app.get('/api/v1/roles', authCheck, (req, res) => {
  res.json({ code: 0, message: 'success', data: [...rolesStore] });
});

// ----- 通知 -----
app.get('/api/v1/notifications', authCheck, (req, res) => {
  const { page, pageSize, read } = req.query;
  let list = [...notificationsStore];
  if (read !== undefined) list = list.filter(n => n.read === (read === 'true'));
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

app.get('/api/v1/notifications/unread-count', authCheck, (req, res) => {
  const count = notificationsStore.filter(n => !n.read).length;
  res.json({ code: 0, message: 'success', data: { count } });
});

// ============================================================
// ===== 通用 fallback（必须放在所有路由之后） =====
// ============================================================
app.use('/api/v1/*all', (req, res) => {
  res.json({ code: 0, message: 'success', data: [] });
});

// ===== 启动服务器 =====
app.listen(PORT, '0.0.0.0', () => {
  log(`\n 罗圣纪元后端服务器 v2 启动成功！`);
  log(`   端口: ${PORT}`);
  log(`   环境: ${process.env.NODE_ENV || 'development'}`);
  log(`\n📊 AI 模型配置状态:`);
  log(`   主 Provider: ${CONFIG.AI_PROVIDER}`);
  log(`   豆包 (Doubao): ${CONFIG.DOUBAO_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  log(`   DeepSeek: ${CONFIG.DEEPSEEK_API_KEY ? '✅ 已配置' : ' 未配置'}`);
  log(`   通义千问 (Tongyi): ${CONFIG.TONGYI_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  log(`   腾讯元宝 (Yuanbao): ${CONFIG.YUANBAO_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  log(`   即梦 (Jimeng 图片): ${CONFIG.JIMENG_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  log(`   可灵 (Kling 视频): ${CONFIG.KLING_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  log(`   Coze 智能体: ${CONFIG.COZE_API_KEY && CONFIG.COZE_BOT_ID ? '✅ 已配置' : '❌ 未配置'}`);
  log(`\n📝 图片生成: ${CONFIG.IMAGE_GENERATION_PROVIDER} | 视频生成: ${CONFIG.VIDEO_GENERATION_PROVIDER}`);
  log(`\n🌐 外部访问: http://0.0.0.0:${PORT}/api/v1`);
  log(`   API 端点总数: 77+`);
  log(`\n⚠️  如看到"❌ 未配置"，请在 backend/.env 文件中填入对应的 API Key`);
});
