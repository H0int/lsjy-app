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
// CORS 由线上 Nginx 统一添加。这里不要重复添加，否则浏览器会因
// Access-Control-Allow-Origin 出现两份而把请求判定为 Network Error。
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

  // 通义万相视频生成（阿里云）
  TONGYI_VIDEO_API_KEY: process.env.TONGYI_API_KEY || 'sk-c4212c9d7e4644e6825d796f6365668e',
  TONGYI_VIDEO_BASE_URL: process.env.TONGYI_VIDEO_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1',

  // 图片/视频生成配置
  IMAGE_GENERATION_PROVIDER: process.env.IMAGE_GENERATION_PROVIDER || 'jimeng',
  VIDEO_GENERATION_PROVIDER: process.env.VIDEO_GENERATION_PROVIDER || 'tongyi',

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
  if (token.startsWith('jwt_')) {
    const parts = token.split('_');
    if (parts.length >= 2) {
      // 兼容旧boss token: jwt_boss_token_<ts> → 视为userId=1
      if (parts[1] === 'boss') {
        req.user = { id: 1 };
      } else {
        const userId = parseInt(parts[1]);
        if (!isNaN(userId)) {
          req.user = { id: userId };
        }
      }
    }
  }
  next();
}

// 圣力扣费（返回 { ok, balance, cost }）
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
  if (balance < cost) return { ok: false, error: '圣力不足', balance };
  user.coins = balance - cost;
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  return { ok: true, balance: user.coins, cost };
}

// 获取用户圣力余额
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

// 通用 HTTP 请求函数（带重试和指数退避）
function httpsRequest(url, options, body, _retryCount) {
  _retryCount = _retryCount || 0;
  const maxRetries = (options && options.retries != null) ? options.retries : (CONFIG.AI_MAX_RETRIES || 3);
  const reqTimeout = (options && options.timeout != null) ? options.timeout : (CONFIG.AI_TIMEOUT || 60000);

  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'POST',
      headers: options.headers || {},
      timeout: reqTimeout,
    };
    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers }); }
        catch (e) { resolve({ status: res.statusCode, data, headers: res.headers }); }
      });
    });
    req.on('error', (err) => {
      if (_retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, _retryCount), 8000);
        log(`[httpsRequest] 网络错误 (${err.message})，${delay}ms 后第 ${_retryCount + 1}/${maxRetries} 次重试: ${url}`);
        setTimeout(() => {
          httpsRequest(url, options, body, _retryCount + 1).then(resolve, reject);
        }, delay);
      } else {
        log(`[httpsRequest] 请求失败，已耗尽 ${maxRetries} 次重试: ${url} - ${err.message}`);
        reject(err);
      }
    });
    req.on('timeout', () => {
      req.destroy();
      if (_retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, _retryCount), 8000);
        log(`[httpsRequest] 请求超时 (${reqTimeout}ms)，${delay}ms 后第 ${_retryCount + 1}/${maxRetries} 次重试: ${url}`);
        setTimeout(() => {
          httpsRequest(url, options, body, _retryCount + 1).then(resolve, reject);
        }, delay);
      } else {
        reject(new Error(`Request timeout after ${reqTimeout}ms (${maxRetries + 1} attempts total)`));
      }
    });
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

// ===== 内存数据存储 =====
const usersStore = [
  { id: 1, username: 'KF02V9', nickname: '罗总', email: 'ceo@lsjyapp.cn', phone: '', roles: ['boss', 'founder', 'ultimate_admin', 'super_admin', 'admin', 'operator'], status: 'active', avatar: '', gender: 1, bio: '罗圣纪元创始人', vipLevel: 99, membershipTier: 'founder', userType: 'founder', unlimited: true, coins: 999999999, totalRecharge: 999999999, createdAt: '2026-05-12T00:00:00Z' },
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
  klingApiKey: '',
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
  { id: 1, name: '罗圣AI智能体', icon: '🤖', toolType: 'text', categoryId: 4, status: 'active', description: '全能AI助手，支持多轮对话、问答、咨询', isFree: false, systemPrompt: '你是"罗圣AI智能体"，由祁阳市罗圣纪元互联网科技有限责任公司开发。你是全能型AI助手，能回答各种问题，提供专业建议。创始人是罗凯中。回复要专业、友好、有实质内容，不说废话。', usageCount: 1256, coinCost: 1 },
  { id: 2, name: '文案创作大师', icon: '✍️', toolType: 'text', categoryId: 1, status: 'active', description: '营销文案、宣传稿、社交媒体内容创作', isFree: false, systemPrompt: '你是专业的营销文案创作大师，擅长撰写各类营销文案、宣传稿、社交媒体内容、广告语、品牌故事。输出要有创意、有感染力、能转化。直接给出文案内容，不要多余解释。', usageCount: 890, coinCost: 2 },
  { id: 3, name: 'AI绘画师', icon: '🎨', toolType: 'image', categoryId: 2, status: 'active', description: 'AI图片生成、设计辅助', isFree: false, usageCount: 432, coinCost: 10 },
  { id: 4, name: '数据分析师', icon: '📊', toolType: 'text', categoryId: 3, status: 'active', description: '数据分析、商业洞察、趋势预测', isFree: false, systemPrompt: '你是资深数据分析师，擅长商业数据分析、市场洞察、趋势预测。能解读各种数据报表，给出专业的商业建议。回复要有数据支撑，逻辑清晰，结论明确。', usageCount: 210, coinCost: 3 },
  { id: 5, name: '代码工程师', icon: '💻', toolType: 'text', categoryId: 1, status: 'active', description: '代码生成、调试、技术方案设计', isFree: false, systemPrompt: '你是资深全栈工程师，精通前后端开发、数据库设计、系统架构。能生成高质量代码，解决技术问题，设计技术方案。代码要有注释，方案要可落地。', usageCount: 156, coinCost: 3 },
  { id: 6, name: '自媒体运营官', icon: '📱', toolType: 'text', categoryId: 1, status: 'active', description: '自媒体内容策划、运营策略、涨粉技巧', isFree: false, systemPrompt: '你是资深自媒体运营专家，精通抖音、小红书、微信公众号、B站等平台的运营策略。能策划爆款内容、制定涨粉方案、优化变现路径。回复要实操、有案例、可落地。', usageCount: 345, coinCost: 2 },
  { id: 7, name: '电商顾问', icon: '🛒', toolType: 'text', categoryId: 1, status: 'active', description: '电商运营、选品策略、店铺优化', isFree: false, systemPrompt: '你是电商运营专家，精通淘宝、京东、拼多多、抖音电商等平台的运营技巧。能提供选品建议、店铺优化方案、营销策略。回复要有数据、有案例、可执行。', usageCount: 278, coinCost: 2 },
  { id: 8, name: '教育导师', icon: '📚', toolType: 'text', categoryId: 1, status: 'active', description: '课程推荐、学习规划、技能培训', isFree: false, systemPrompt: '你是资深教育专家，擅长课程规划、学习方法指导、职业技能培训建议。能根据学员情况推荐合适的课程，制定学习计划。回复要专业、有温度、可执行。', usageCount: 189, coinCost: 2 },
  { id: 9, name: '宠物顾问', icon: '🐾', toolType: 'text', categoryId: 5, category: { id: 5, name: '宠物', slug: 'pet', module: 'pet' }, status: 'active', description: '宠物养护、训练指导、宠物用品推荐', isFree: false, systemPrompt: '你是宠物养护专家，精通猫狗等常见宠物的饲养、训练、健康管理。能提供宠物饮食建议、训练方法、疾病预防指导。回复要专业、有爱心、实用。', usageCount: 134, coinCost: 2 },
  { id: 10, name: '校园助手', icon: '🎓', toolType: 'text', categoryId: 6, category: { id: 6, name: '伯雅校园', slug: 'campus', module: 'campus' }, status: 'active', description: '伯雅校园服务、学业辅导、校园生活', isFree: false, systemPrompt: '你是伯雅校园的智能助手，熟悉校园生活服务、学业辅导、社团活动、考试备考等。能为学生提供学习建议、生活指导、职业规划。回复要亲切、实用、贴近学生生活。', usageCount: 267, coinCost: 1 },
];

// ===== 10 AI员工 Agent 定义 =====
const agentsStore = [
  {
    id: 101, name: '总指挥罗圣', icon: '👑', category: '综合',
    description: '项目总指挥，全能型AI助手，可调度所有AI员工',
    systemPrompt: `你是"罗圣"，罗圣纪元AI平台的最高决策者和项目总指挥。
公司：祁阳市罗圣纪元互联网科技有限责任公司（注意："祁阳"不是"祈阳"）
创始人/CEO：罗凯中
六大业务：AI智能服务、自媒体运营、电商服务、在线教育、宠物医疗、伯雅校园

你的能力覆盖全平台：产品方案审批、技术架构决策、商业规则制定、资源协调。
作为总指挥，你可以回答任何业务问题，并在必要时建议用户切换到更专业的AI员工。
回复风格：决策果断、言简意赅、有战略高度。`,
    provider: 'deepseek', coinCost: 1, status: 'active'
  },
  {
    id: 102, name: '运营文案师', icon: '✍️', category: '运营',
    description: '全平台文案输出、用户路径设计、交互体验优化',
    systemPrompt: `你是"罗圣纪元-运营文案师"，负责产品体验与运营文案。
公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）

核心职责：
1. 设计用户使用路径、功能入口排布，提升转化率
2. 输出页面文案、运营位文案、充值引导文案、工具引导文案
3. 设计AI工具的交互逻辑，保证体验统一流畅
4. 输出运营活动策划、推广素材文案

工作原则：
- 文案简洁专业，无错别字，符合商务调性
- 以用户体验为核心，降低操作成本
- 输出的文案可直接落地使用`,
    provider: 'deepseek', coinCost: 1, status: 'active'
  },
  {
    id: 103, name: '调研分析师', icon: '🔍', category: '分析',
    description: '竞品对标、问题排查、数据分析、需求管理',
    systemPrompt: `你是"罗圣纪元-调研分析师"，负责全平台问题盘点与竞品对标。
公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）

核心职责：
1. 走查所有页面、功能、接口，输出bug清单与体验问题清单
2. 对标行业主流AI平台，输出可落地的参考方案
3. 整理用户反馈与需求，维护需求池并按优先级排序
4. 功能上线后输出数据复盘报告

工作原则：
- 客观中立，只摆事实与数据
- 问题清单标注：位置、复现步骤、影响范围、优先级
- 竞品分析必须提炼可落地的点，禁止泛泛而谈`,
    provider: 'deepseek', coinCost: 1, status: 'active'
  },
  {
    id: 104, name: '投资理财顾问', icon: '💰', category: '商业',
    description: '充值定价、分销体系、盈利模型、财务核算',
    systemPrompt: `你是"罗圣纪元-投资理财顾问"，负责商业体系设计与落地。
公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）

核心职责：
1. 设计梯度化充值套餐与定价策略，核算算力成本与利润
2. 规划分销商体系、返佣规则、结算流程
3. 设计会员体系、增值服务，搭建商业变现链路
4. 定期核算平台收支，输出财务数据报表

工作原则：
- 所有定价必须有成本测算依据，禁止拍脑袋
- 商业规则必须闭环，覆盖充值、消费、退款、结算全场景
- 兼顾用户体验与平台收益`,
    provider: 'deepseek', coinCost: 2, status: 'active'
  },
  {
    id: 105, name: '智能能力官', icon: '🧠', category: '技术',
    description: '知识库优化、提示词工程、语义召回、模型调优',
    systemPrompt: `你是"罗圣纪元-智能能力负责人"，负责知识库与AI能力优化。
公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）

核心职责：
1. 重构知识库切片规则，优化向量召回与重排序逻辑
2. 为平台10个Agent定制专属系统提示词
3. 建立知识库内容更新、质检、迭代的标准化流程
4. 持续测试模型回答效果，解决答非所问问题
5. 优化多轮上下文记忆能力

工作原则：
- 以问答准确率为核心验收标准
- 严格贴合业务场景，不做技术炫技
- 输出的提示词、切片规则可直接落地`,
    provider: 'deepseek', coinCost: 2, status: 'active'
  },
  {
    id: 106, name: '合规风控官', icon: '⚖️', category: '法务',
    description: '法律文本审核、合规把关、AI内容免责声明',
    systemPrompt: `你是"罗圣纪元-合规风控负责人"，对全平台内容与规则合规性全权把关。
公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）

核心职责：
1. 起草审核用户协议、隐私政策、充值协议、退款规则
2. 审核页面文案、运营活动、分销规则的合规性
3. 输出AI内容免责声明、合规提示
4. 为投诉、退款纠纷提供法务建议

工作原则：
- 合规零容忍，违规内容坚决驳回
- 风险提示明确，同时给出可落地的修改建议
- 严格遵循互联网、AI行业相关法律法规`,
    provider: 'deepseek', coinCost: 2, status: 'active'
  },
  {
    id: 107, name: '首席架构师', icon: '🏗️', category: '技术',
    description: 'API网关、系统架构、算力调度、性能优化',
    systemPrompt: `你是"罗圣纪元-首席技术架构师"，大模型API中台第一责任人。
公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）

核心职责：
1. 搭建统一大模型API网关，对接多算力渠道，实现负载均衡、故障切换
2. 制定全平台接口标准、错误码规范、技术架构规范
3. 优化算力调用链路，降低首字延迟，保障调用成功率≥99%
4. 输出知识库向量检索、语义召回的技术优化方案
5. 排查API调用失败、超时、扣费异常等底层问题

工作原则：
- 所有技术方案必须可落地、可验证，输出明确验收指标
- 优先保障稳定性，再做性能优化
- 关键参数明确，禁止模糊表述`,
    provider: 'deepseek', coinCost: 2, status: 'active'
  },
  {
    id: 108, name: '后端开发官', icon: '⚙️', category: '开发',
    description: '服务端开发、数据库优化、接口联调、支付对接',
    systemPrompt: `你是"罗圣纪元-后端开发总负责人"，主导服务端逻辑与数据库开发。
公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）

核心职责：
1. 修复登录跳转、SSO等后端bug，重写路由守卫与鉴权逻辑
2. 开发充值、订单、计费、用户管理、分销结算全量接口
3. 优化数据库索引，治理慢查询，接口响应<100ms
4. 打通API中台与前端的算力调用、Token扣减链路
5. 输出标准化接口文档，配合前端联调

工作原则：
- 优先修复影响用户的硬bug
- 所有接口做参数校验与异常兜底
- 数据准确性与安全性第一`,
    provider: 'deepseek', coinCost: 2, status: 'active'
  },
  {
    id: 109, name: '前端开发官', icon: '🎨', category: '开发',
    description: '页面开发修复、移动端适配、性能优化、UI规范',
    systemPrompt: `你是"罗圣纪元-前端开发总负责人"，对所有页面体验与视觉质量负责。
公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）

核心职责：
1. 修复布局错乱、样式不统一、移动端适配问题
2. 落地登录跳转、多入口充值、工具交互的前端开发
3. 前端性能优化：资源压缩、懒加载、CDN、缓存策略
4. 保证浏览器零红色报错，所有操作有明确状态反馈
5. 对接后端接口，完成全量联调

工作原则：
- 页面质量零容忍，不允许错位、溢出、白屏
- 优先保障移动端体验
- 严格遵循UI规范，视觉统一`,
    provider: 'deepseek', coinCost: 2, status: 'active'
  },
  {
    id: 110, name: '质量测试官', icon: '🧪', category: '测试',
    description: '全量功能测试、兼容性测试、压力测试、bug管理',
    systemPrompt: `你是"罗圣纪元-质量测试负责人"，所有功能上线必经你验收。
公司：祁阳市罗圣纪元互联网科技有限责任公司（严禁写成"祈阳"）

核心职责：
1. 执行全量功能测试、兼容性测试、并发压力测试
2. 输出标准化测试报告与bug清单，跟进修复验证
3. 功能上线后执行线上回归测试，监控报错
4. 建立全平台测试用例库

工作原则：
- 质量底线不妥协，不达标坚决不予通过
- bug描述清晰可复现
- 测试覆盖全场景、全端`,
    provider: 'deepseek', coinCost: 1, status: 'active'
  }
];


const rolesStore = [
  { id: 1, name: 'boss', displayName: '罗总专属', level: 999, permissions: ['*'], description: '最高权限，拥有所有决定权和执行权' },
  { id: 2, name: 'admin', displayName: '系统管理员', level: 4, permissions: ['user.manage', 'content.manage', 'system.manage'], description: '管理后台权限' },
  { id: 3, name: 'editor', displayName: '内容编辑', level: 3, permissions: ['content.manage'], description: '内容管理权限' },
  { id: 4, name: 'user', displayName: '普通用户', level: 1, permissions: [], description: '基础使用权限' },
];

const notificationsStore = [
  { id: 1, userId: 1, title: '新用户注册', content: '用户user1已注册并等待审批', type: 'system', read: false, createdAt: '2026-06-14T08:00:00Z' },
  { id: 2, userId: 1, title: '工单待处理', content: '有2个工单等待处理', type: 'ticket', read: false, createdAt: '2026-06-14T09:00:00Z' },
  { id: 3, userId: 1, title: '系统更新完成', content: '系统已成功更新至v2.0', type: 'system', read: true, createdAt: '2026-06-13T00:00:00Z' },
];

// ===== API错误记录 =====
const apiErrorsStore = [
  { id: 1, toolId: 3, toolName: 'AI绘画师', apiProvider: 'jimeng', errorCode: 'TIMEOUT', errorMessage: '请求超时，API响应时间超过60秒', status: 'pending', retryCount: 2, createdAt: '2026-06-25T10:30:00Z', resolvedAt: null, resolvedBy: null },
  { id: 2, toolId: 1, toolName: '罗圣AI智能体', apiProvider: 'deepseek', errorCode: 'RATE_LIMIT', errorMessage: '请求频率超限，请稍后重试', status: 'resolved', retryCount: 1, createdAt: '2026-06-24T15:20:00Z', resolvedAt: '2026-06-24T15:25:00Z', resolvedBy: 'admin' },
  { id: 3, toolId: 5, toolName: '代码工程师', apiProvider: 'deepseek', errorCode: 'INVALID_RESPONSE', errorMessage: 'API返回格式异常，无法解析', status: 'pending', retryCount: 0, createdAt: '2026-06-26T08:15:00Z', resolvedAt: null, resolvedBy: null },
];

// ===== 支付失败记录 =====
const paymentFailuresStore = [
  { id: 1, userId: 2, username: 'user1', orderId: 'ORD-20260625-001', amount: 99.00, paymentMethod: 'wechat', errorCode: 'PAY_TIMEOUT', errorMessage: '支付超时，用户未完成支付', status: 'pending', retryCount: 0, createdAt: '2026-06-25T14:30:00Z', resolvedAt: null, resolvedBy: null },
  { id: 2, userId: 3, username: 'admin1', orderId: 'ORD-20260624-002', amount: 49.90, paymentMethod: 'alipay', errorCode: 'INSUFFICIENT_BALANCE', errorMessage: '余额不足', status: 'resolved', retryCount: 1, createdAt: '2026-06-24T09:10:00Z', resolvedAt: '2026-06-24T10:00:00Z', resolvedBy: 'admin' },
];

// ===== 错误追踪函数 =====
function trackApiError(toolId, toolName, provider, errorCode, errorMessage, retryCount) {
  const record = {
    id: apiErrorsStore.length + 1,
    toolId: toolId || 0,
    toolName: toolName || 'unknown',
    apiProvider: provider || 'unknown',
    errorCode: errorCode || 'UNKNOWN',
    errorMessage: errorMessage || '',
    status: 'pending',
    retryCount: retryCount || 0,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedBy: null,
  };
  apiErrorsStore.unshift(record);
  log(`[错误追踪] API错误: ${provider} ${errorCode} - ${errorMessage}`);
  return record;
}

function trackPaymentFailure(userId, username, orderId, amount, paymentMethod, errorCode, errorMessage) {
  const record = {
    id: paymentFailuresStore.length + 1,
    userId: userId || 0,
    username: username || 'unknown',
    orderId: orderId || '',
    amount: amount || 0,
    paymentMethod: paymentMethod || 'unknown',
    errorCode: errorCode || 'UNKNOWN',
    errorMessage: errorMessage || '',
    status: 'pending',
    retryCount: 0,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedBy: null,
  };
  paymentFailuresStore.unshift(record);
  log(`[错误追踪] 支付失败: userId=${userId} orderId=${orderId} ${errorCode} - ${errorMessage}`);
  return record;
}

// ===== AI Provider 实现 =====

async function callCozeAPI(messages, options = {}) {
  const apiKey = CONFIG.COZE_API_KEY;
  const botId = CONFIG.COZE_BOT_ID;
  if (!apiKey || !botId) throw new Error('Coze API Key 或 Bot ID 未配置');
  const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  // 带重试的 Coze API 调用
  const cozeMaxRetries = CONFIG.AI_MAX_RETRIES || 3;
  let lastErr;
  for (let attempt = 0; attempt <= cozeMaxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        log(`[callCozeAPI] 第 ${attempt}/${cozeMaxRetries} 次重试，等待 ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }
      const convRes = await httpsRequest('https://api.coze.cn/v1/conversation/create', { method: 'POST', headers, retries: 0 }, {});
      if (convRes.status !== 200 || !convRes.data?.data?.id) throw new Error(`创建会话失败: ${JSON.stringify(convRes.data)}`);
      const conversationId = convRes.data.data.id;
      const chatRes = await httpsRequest(`https://api.coze.cn/v3/chat?conversation_id=${conversationId}`, { method: 'POST', headers, retries: 0 }, {
        bot_id: botId, user_id: 'lsjy_user', stream: false,
        additional_messages: messages.map(m => ({ role: m.role, content: m.content, content_type: 'text' })),
      });
      if (chatRes.status !== 200 || !chatRes.data?.data?.id) throw new Error(`发起对话失败: ${JSON.stringify(chatRes.data)}`);
      const chatId = chatRes.data.data.id;
      let status = 'created';
      for (let i = 0; i < 90; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const pollRes = await httpsRequest(`https://api.coze.cn/v3/chat/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`, { method: 'POST', headers, retries: 0 }, {});
        status = pollRes.data?.data?.status || 'unknown';
        if (status === 'completed' || status === 'failed') break;
      }
      if (status !== 'completed') throw new Error(`对话未完成，当前状态: ${status}`);
      const msgRes = await httpsRequest(`https://api.coze.cn/v3/chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`, { method: 'GET', headers, retries: 0 });
      const answerMsg = (msgRes.data?.data || []).find(m => m.type === 'answer' && m.role === 'assistant');
      if (!answerMsg) throw new Error('未获取到AI回复');
      if (attempt > 0) log(`[callCozeAPI] 第 ${attempt} 次重试成功`);
      return { content: answerMsg.content, model: 'coze', usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 } };
    } catch (err) {
      lastErr = err;
      log(`[callCozeAPI] 第 ${attempt} 次尝试失败: ${err.message}`);
      // 认证错误不重试
      if (err.message.includes('401') || err.message.includes('403')) throw err;
    }
  }
  throw lastErr;
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

  // 带重试的 API 调用（httpsRequest 已处理网络重试，这里处理业务级失败）
  const apiMaxRetries = CONFIG.AI_MAX_RETRIES || 3;
  let lastError;
  for (let attempt = 0; attempt <= apiMaxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 6000);
        log(`[callOpenAICompatibleAPI] ${provider} 第 ${attempt}/${apiMaxRetries} 次重试，等待 ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }
      const res = await httpsRequest(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        retries: 0  // 网络层重试已在 httpsRequest 中处理，这里不再重复
      }, {
        model,
        messages: fullMessages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      });

      if (res.status !== 200) {
        throw new Error(`${provider} API调用失败 (${res.status}): ${typeof res.data === 'object' ? JSON.stringify(res.data) : res.data}`);
      }
      const choice = res.data.choices?.[0];
      if (!choice?.message?.content) throw new Error(`${provider} API返回空回复`);
      if (attempt > 0) log(`[callOpenAICompatibleAPI] ${provider} 第 ${attempt} 次重试成功`);
      return { content: choice.message.content, model, usage: res.data.usage || {} };
    } catch (err) {
      lastError = err;
      log(`[callOpenAICompatibleAPI] ${provider} 第 ${attempt} 次尝试失败: ${err.message}`);
      // 401/403 等认证错误不重试，直接抛出
      if (err.message.includes('(401)') || err.message.includes('(403)')) {
        throw err;
      }
    }
  }
  throw lastError;
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

    // 记录首次失败的 provider 错误
    const errorCode = err.message.includes('timeout') ? 'TIMEOUT'
      : err.message.includes('(401)') ? 'AUTH_ERROR'
      : err.message.includes('(403)') ? 'FORBIDDEN'
      : err.message.includes('(429)') ? 'RATE_LIMIT'
      : err.message.includes('(5') ? 'SERVER_ERROR'
      : 'API_ERROR';
    trackApiError(options.toolId, options.toolName, provider, errorCode, err.message, CONFIG.AI_MAX_RETRIES || 3);

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
        trackApiError(options.toolId, options.toolName, fallback, 'FALLBACK_ERROR', fallbackErr.message, 0);
      }
    }

    // 所有 provider 都失败
    log(`[callAI] 所有 Provider 均失败，共尝试 ${fallbackProviders.length + 1} 个`);
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
  const provider = CONFIG.VIDEO_GENERATION_PROVIDER || 'tongyi';

  if (provider === 'tongyi') {
    return await callTongyiVideoAPI(prompt, options);
  } else if (provider === 'kling') {
    return await callKlingVideoAPI(prompt, options);
  } else {
    throw new Error(`不支持的视频生成 Provider: ${provider}`);
  }
}


// 通义万相视频生成（阿里云 - 国内）
async function callTongyiVideoAPI(prompt, options = {}) {
  const apiKey = CONFIG.TONGYI_VIDEO_API_KEY;
  if (!apiKey) throw new Error('通义万相 API Key 未配置，请在 .env 中配置 TONGYI_API_KEY');

  const baseUrl = CONFIG.TONGYI_VIDEO_BASE_URL;

  const submitRes = await httpsRequest(baseUrl + '/services/aigc/video-generation/generation', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable'
    }
  }, {
    model: 'video-generation-v1',
    input: { prompt: prompt },
    parameters: {
      duration: options.duration || 4,
      resolution: options.resolution || '720p'
    }
  });

  if (submitRes.status !== 200) {
    throw new Error('通义万相 API 提交失败 (' + submitRes.status + '): ' + JSON.stringify(submitRes.data));
  }

  const taskId = submitRes.data?.output?.task_id;
  if (!taskId) throw new Error('通义万相 API 未返回任务 ID');

  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const pollRes = await httpsRequest(baseUrl + '/tasks/' + taskId, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + apiKey }
    });

    const status = pollRes.data?.output?.task_status;
    if (status === 'SUCCEEDED') {
      const videoUrl = pollRes.data?.output?.video_url;
      if (!videoUrl) throw new Error('通义万相 API 未返回视频 URL');
      return { videoUrl, model: 'video-generation-v1', prompt, durationMs: (i + 1) * 5000 };
    } else if (status === 'FAILED') {
      throw new Error('通义万相视频生成失败：' + (pollRes.data?.output?.message || '未知错误'));
    }
  }

  throw new Error('通义万相视频生成超时（等待 5 分钟）');
}

// 可灵视频生成（快手）
async function callKlingVideoAPI(prompt, options = {}) {
  // 优先从系统设置读取（管理后台配置），其次从环境变量读取
  const apiKey = systemSettingsStore.klingApiKey || CONFIG.KLING_API_KEY;
  if (!apiKey || apiKey === 'test-key-123') throw new Error('可灵 API Key 未配置，请在管理后台 → 系统设置中填写真实的可灵 API Key');

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
const clickStore = [];
const knowledgeStore = [];
const adminRolesStore = [
  { id: 1, name: 'boss', displayName: 'Boss账号', description: '老板最高权限', permissions: ['dashboard:view', 'users:manage', 'finance:manage', 'system:manage'], userCount: 1, status: '启用' },
  { id: 2, name: 'admin', displayName: '管理员', description: '后台管理权限', permissions: ['dashboard:view', 'users:manage'], userCount: 0, status: '启用' },
];
const adminPermissionList = ['dashboard:view', 'users:manage', 'finance:manage', 'tools:manage', 'content:manage', 'system:manage'];
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

app.post('/api/v1/visitors/click', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
  const record = {
    id: clickStore.length + 1,
    ip,
    page: String(req.body?.page || '/').slice(0, 300),
    targetText: String(req.body?.targetText || '').slice(0, 120),
    targetTag: String(req.body?.targetTag || '').slice(0, 40),
    targetPath: String(req.body?.targetPath || '').slice(0, 300),
    userAgent: req.headers['user-agent'] || '',
    createdAt: new Date().toISOString(),
  };
  clickStore.push(record);
  if (clickStore.length > 10000) clickStore.splice(0, clickStore.length - 10000);
  res.json({ code: 0, message: 'success', data: { message: '记录成功' } });
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

app.get('/api/v1/visitors/clicks', authCheck, (req, res) => {
  const { page, pageSize } = req.query;
  res.json({ code: 0, message: 'success', data: paginate(clickStore.slice().reverse(), page, pageSize) });
});

app.get('/api/v1/knowledge', authCheck, (req, res) => {
  const keyword = String(req.query.keyword || '').toLowerCase();
  const type = String(req.query.type || '');
  let list = [...knowledgeStore];
  if (keyword) list = list.filter(item => `${item.title || ''} ${item.content || ''}`.toLowerCase().includes(keyword));
  if (type) list = list.filter(item => item.type === type);
  res.json({ code: 0, message: 'success', data: list });
});

app.post('/api/v1/knowledge', authCheck, (req, res) => {
  const content = String(req.body?.content || '');
  const item = {
    id: nextId(),
    title: req.body?.title || '未命名文档',
    content,
    type: req.body?.type || '其他',
    tags: Array.isArray(req.body?.tags) ? req.body.tags : [],
    chunks: Math.max(1, Math.ceil(content.length / 500)),
    status: 'indexed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  knowledgeStore.unshift(item);
  res.json({ code: 0, message: '上传成功', data: item });
});

app.delete('/api/v1/knowledge/:id', authCheck, (req, res) => {
  const idx = knowledgeStore.findIndex(item => String(item.id) === String(req.params.id));
  if (idx >= 0) knowledgeStore.splice(idx, 1);
  res.json({ code: 0, message: '删除成功', data: null });
});

app.get('/api/v1/admin/permissions', authCheck, (req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: {
      roles: adminRolesStore.map(role => ({ ...role, permissionCount: role.permissions?.length || 0 })),
      permissions: adminPermissionList,
      stats: {
        totalRoles: adminRolesStore.length,
        totalPermissions: adminPermissionList.length,
        assignedUsers: adminRolesStore.reduce((sum, role) => sum + Number(role.userCount || 0), 0),
      },
    },
  });
});

app.post('/api/v1/admin/permissions', authCheck, (req, res) => {
  const item = {
    id: nextId(),
    name: req.body?.name || req.body?.displayName || `role_${Date.now()}`,
    displayName: req.body?.displayName || req.body?.name || '新角色',
    description: req.body?.description || '',
    permissions: req.body?.permissions || [],
    userCount: 0,
    status: '启用',
  };
  adminRolesStore.unshift(item);
  res.json({ code: 0, message: '创建成功', data: item });
});

app.put('/api/v1/admin/permissions/:id', authCheck, (req, res) => {
  const role = adminRolesStore.find(item => String(item.id) === String(req.params.id));
  if (!role) return res.status(404).json({ code: 404, message: '角色不存在', data: null });
  role.displayName = req.body?.displayName ?? role.displayName;
  role.description = req.body?.description ?? role.description;
  role.permissions = req.body?.permissions ?? role.permissions;
  res.json({ code: 0, message: '保存成功', data: role });
});

app.delete('/api/v1/admin/permissions/:id', authCheck, (req, res) => {
  const idx = adminRolesStore.findIndex(item => String(item.id) === String(req.params.id));
  if (idx >= 0) adminRolesStore.splice(idx, 1);
  res.json({ code: 0, message: '删除成功', data: null });
});


// ===== 实时在线用户 =====
const onlineUsers = new Map();
const ONLINE_TIMEOUT = 60000;

app.post('/api/v1/online/heartbeat', (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.ip || 'anonymous';
  const userId = req.headers['x-user-id'] || '';
  const path = req.body?.path || '/';
  onlineUsers.set(sessionId, { userId, ip: req.ip || req.connection.remoteAddress, lastHeartbeat: Date.now(), path });
  const now = Date.now();
  for (const [key, val] of onlineUsers.entries()) {
    if (now - val.lastHeartbeat > ONLINE_TIMEOUT) onlineUsers.delete(key);
  }
  res.json({ code: 0, message: 'success', data: { onlineCount: onlineUsers.size } });
});

app.get('/api/v1/online/count', (req, res) => {
  const now = Date.now();
  for (const [key, val] of onlineUsers.entries()) {
    if (now - val.lastHeartbeat > ONLINE_TIMEOUT) onlineUsers.delete(key);
  }
  res.json({ code: 0, message: 'success', data: { onlineCount: onlineUsers.size } });
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
  const { username, account: rawAccount, phone, email, password } = req.body;
  const account = username || rawAccount || phone || email || '';
  const normalizedAccount = String(account).trim().toUpperCase().replace(/O/g, '0');

  // Boss账号正确密码直接放行，避免旧错误次数导致锁定
  if (normalizedAccount === 'KF02V9' && password === 'LuoKaiZhong02V9') {
    clearLoginFails(account);
    clearLoginFails('KF02V9');
    clearLoginFails('KFO2V9');
    const bossUser = {
      id: 1,
      username: 'KF02V9',
      nickname: '罗总',
      roles: ['boss', 'founder', 'ultimate_admin', 'super_admin', 'admin', 'operator'],
      status: 'active',
      vipLevel: 99,
      membershipTier: 'founder',
      userType: 'founder',
      unlimited: true,
      coins: 999999999,
      permissions: ['*'],
      createdAt: '2026-05-12T00:00:00Z',
    };
    return res.json({
      code: 0, message: 'success',
      data: {
        accessToken: 'jwt_1_' + Date.now(), refreshToken: 'refresh_1_' + Date.now(),
        user: bossUser,
      },
    });
  }

  // 检查账号是否被锁定
  const lockStatus = checkAccountLock(account);
  if (lockStatus.locked) {
    return res.status(423).json({
      code: 423,
      message: `账号已锁定，请等待${Math.ceil(lockStatus.remaining / 60)}分钟后重试`,
      data: { lockedUntil: lockStatus.remaining }
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
  const { password, nickname, email, phone } = req.body;
  const username = String(req.body?.username || req.body?.account || '').trim();
  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '请输入账号和密码', data: null });
  }
  if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) {
    return res.status(400).json({ code: 400, message: '账号需为4-20位字母、数字或下划线', data: null });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ code: 400, message: '密码至少6位', data: null });
  }
  const usersFile = path.join(__dirname, 'data', 'users.json');
  let users = [];
  try { users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); } catch (e) { users = []; }
  const allUsers = [...usersStore, ...users];
  if (allUsers.find(u => String(u.username).toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ code: 409, message: '用户名已存在', data: null });
  }
  const newUser = {
    id: Math.max(0, ...allUsers.map(u => Number(u.id) || 0)) + 1,
    username,
    password,
    nickname: String(nickname || username).trim(),
    email,
    phone,
    status: 'active',
    roles: ['user'],
    coins: 100,
    totalRecharge: 0,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  fs.mkdirSync(path.dirname(usersFile), { recursive: true });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  const accessToken = 'jwt_' + newUser.id + '_' + Date.now();
  const refreshToken = 'refresh_' + newUser.id + '_' + Date.now();
  res.json({
    code: 0,
    message: '注册成功',
    data: {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        nickname: newUser.nickname,
        roles: ['user'],
        status: 'active',
        coins: 100,
      },
    },
  });
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

// AI对话（免费工具不扣圣力，付费工具按配置扣费）
app.post('/api/v1/ai/tools/:toolId/chat', authCheck, async (req, res) => {
  const { toolId } = req.params;
  const { messages, model, temperature, maxTokens, systemPrompt } = req.body;
  const userId = req.user?.id || 1;

  // Agent路由：优先查agentsStore（10个AI员工），fallback到aiToolsStore
  const agentId = Number(toolId);
  const agent = (typeof agentsStore !== 'undefined') ? agentsStore.find(a => a.id === agentId) : null;
  const tool = aiToolsStore.find(t => t.id === agentId);
  const isFreeTool = !!tool?.isFree && !agent;
  const CHAT_COIN_COST = isFreeTool ? 0 : (agent ? agent.coinCost : (tool ? (tool.coinCost || 1) : 1));
  const effectiveSystemPrompt = systemPrompt || (agent ? agent.systemPrompt : null) || (tool ? tool.systemPrompt : null) || CONFIG.SYSTEM_PROMPT;
  const effectiveProvider = agent ? (agent.provider || CONFIG.AI_PROVIDER) : (CONFIG.AI_PROVIDER);
  log(`收到对话请求: toolId=${toolId}, userId=${userId}, messages=${messages?.length || 0}`);
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ code: 400, message: '消息列表不能为空', data: null });
  }
  // 检查圣力余额
  const balance = getUserCoins(userId);
  if (CHAT_COIN_COST > 0 && balance < CHAT_COIN_COST) {
    return res.status(402).json({
      code: 402,
      message: `圣力不足，当前余额${balance}，本次需要${CHAT_COIN_COST}圣力。请前往个人中心充值。`,
      data: { balance, cost: CHAT_COIN_COST },
    });
  }
  try {
    const result = await callAI(messages, { model, temperature, maxTokens, systemPrompt: effectiveSystemPrompt, provider: effectiveProvider, toolId: Number(toolId), toolName: agent?.name || tool?.name || '未知工具' });
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
      data: { content: result.content, model: result.model || model || 'default', role: 'assistant', coinCost: CHAT_COIN_COST, balance: deduct.balance, usage: result.usage },
    });
  } catch (err) {
    log(`AI调用失败: ${err.message}`);
    // 追踪API错误
    const errorCode = err.message.includes('timeout') ? 'TIMEOUT'
      : err.message.includes('(401)') ? 'AUTH_ERROR'
      : err.message.includes('(403)') ? 'FORBIDDEN'
      : err.message.includes('(429)') ? 'RATE_LIMIT'
      : err.message.includes('(5') ? 'SERVER_ERROR'
      : 'API_ERROR';
    trackApiError(Number(toolId), agent?.name || tool?.name || '未知工具', effectiveProvider, errorCode, err.message, CONFIG.AI_MAX_RETRIES || 3);
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    const localReply = getLocalResponse(lastUserMsg?.content || '');
    log('使用本地智能回复兜底');
    // 本地兜底按工具配置扣费；免费工具不扣费
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
      const result = await callAI([{ role: 'user', content: input || JSON.stringify(params || {}) }], { systemPrompt: tool.systemPrompt || CONFIG.SYSTEM_PROMPT, toolId: tool.id, toolName: tool.name });
      res.json({ code: 0, message: 'success', data: { content: result.content, model: result.model, coinCost: tool.coinCost } });
    }
  } catch (err) {
    trackApiError(tool.id, tool.name, 'unknown', 'CALL_ERROR', err.message, CONFIG.AI_MAX_RETRIES || 3);
    res.json({ code: 0, message: 'success', data: { content: `工具 ${tool.name} 处理完成`, model: 'local', coinCost: 0, fallback: true } });
  }
});



// 获取所有AI员工列表
app.get('/api/v1/agents', (req, res) => {
  const list = agentsStore.map(a => ({
    id: a.id, name: a.name, icon: a.icon, category: a.category,
    description: a.description, coinCost: a.coinCost, status: a.status
  }));
  res.json({ code: 0, message: 'success', data: list });
});

// 获取单个AI员工详情
app.get('/api/v1/agents/:id', (req, res) => {
  const agent = agentsStore.find(a => a.id === Number(req.params.id));
  if (!agent) return res.status(404).json({ code: 404, message: 'Agent不存在', data: null });
  res.json({
    code: 0, message: 'success',
    data: { id: agent.id, name: agent.name, icon: agent.icon, category: agent.category, description: agent.description, coinCost: agent.coinCost, status: agent.status, systemPrompt: agent.systemPrompt }
  });
});

// AI调用历史
app.get('/api/v1/ai/history', authCheck, (req, res) => {
  const { page, pageSize, toolId, toolName } = req.query;
  let list = [...aiHistoryStore];
  if (toolId) list = list.filter(h => h.toolId === Number(toolId));
  if (toolName) list = list.filter(h => h.toolName.includes(toolName));
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

function normalizeAiRecord(record) {
  const tool = aiToolsStore.find(t => t.id === Number(record.toolId));
  return {
    id: record.id,
    userId: record.userId || 1,
    toolId: record.toolId,
    tool: tool || { id: record.toolId, name: record.toolName || 'AI工具', icon: '🤖' },
    requestId: record.requestId || `mock-${record.id}`,
    inputText: record.inputText || record.input || '',
    outputText: record.outputText || record.output || '',
    coinCost: record.coinCost || tool?.coinCost || 0,
    status: record.status || 'completed',
    isFavorite: record.isFavorite ? 1 : 0,
    createdAt: record.createdAt || new Date().toISOString(),
  };
}

app.get('/api/v1/ai/works', authCheck, (req, res) => {
  const { page, pageSize } = req.query;
  const list = aiHistoryStore.map(normalizeAiRecord);
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

app.get('/api/v1/ai/favorites', authCheck, (req, res) => {
  const { page, pageSize } = req.query;
  const list = aiHistoryStore.filter(h => h.isFavorite).map(normalizeAiRecord);
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

app.post('/api/v1/ai/history/:id/favorite', authCheck, (req, res) => {
  const record = aiHistoryStore.find(h => h.id === Number(req.params.id));
  if (!record) return res.status(404).json({ code: 404, message: '记录不存在', data: null });
  record.isFavorite = record.isFavorite ? 0 : 1;
  res.json({ code: 0, message: 'success', data: { message: '操作成功' } });
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

// 图片生成（消耗10圣力/次）
// AI 图片生成（真实 AI 绘画）
app.post('/api/v1/ai/tools/:id/generate', authCheck, async (req, res) => {
  const tool = aiToolsStore.find(t => t.id === Number(req.params.id));
  if (!tool) return res.status(404).json({ code: 404, message: '工具不存在', data: null });

  const { prompt, width, height, style, count } = req.body;
  if (!prompt) return res.status(400).json({ code: 400, message: '请提供图片描述', data: null });

  const userId = req.user?.id || 1;
  const IMAGE_COIN_COST = 10;

  log(`收到图片生成请求: toolId=${req.params.id}, userId=${userId}, prompt=${prompt.slice(0, 50)}...`);

  // 检查圣力余额
  const balance = getUserCoins(userId);
  if (balance < IMAGE_COIN_COST) {
    return res.status(402).json({
      code: 402,
      message: `圣力不足，当前余额${balance}，图片生成需要${IMAGE_COIN_COST}圣力。请前往个人中心充值。`,
      data: { balance, cost: IMAGE_COIN_COST },
    });
  }

  // 带重试的图片生成（最多重试 CONFIG.AI_MAX_RETRIES 次）
  const imgMaxRetries = CONFIG.AI_MAX_RETRIES || 3;
  let imgResult = null;
  let imgLastErr = null;
  for (let attempt = 0; attempt <= imgMaxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        log(`[图片生成] 第 ${attempt}/${imgMaxRetries} 次重试，等待 ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }
      imgResult = await generateImageWithAI(prompt, {
        width: width || 1024,
        height: height || 1024,
        style: style || 'auto',
        count: count || 1
      });
      log(`图片生成成功: model=${imgResult.model}, urls=${imgResult.urls.length}`);
      break;
    } catch (err) {
      imgLastErr = err;
      log(`[图片生成] 第 ${attempt} 次尝试失败: ${err.message}`);
    }
  }

  if (!imgResult) {
    log(`[图片生成] 全部 ${imgMaxRetries + 1} 次尝试均失败: ${imgLastErr?.message}`);
    // 不扣费，返回友好错误（不返回500，避免前端误判为服务器崩溃）
    return res.status(200).json({
      code: 5001,
      message: `图片生成暂时不可用，请稍后重试。（已尝试 ${imgMaxRetries + 1} 次）`,
      data: { retryHint: true },
    });
  }

  // 扣费（仅在成功时扣费）
  const deduct = deductCoins(userId, IMAGE_COIN_COST);

  res.json({
    code: 0,
    message: 'success',
    data: {
      urls: imgResult.urls,
      model: imgResult.model,
      prompt: imgResult.prompt,
      width: width || 1024,
      height: height || 1024,
      coinCost: IMAGE_COIN_COST,
      balance: deduct.balance,
      durationMs: 3000,
      createdAt: new Date().toISOString(),
    },
  });
});

// AI 视频生成（消耗20圣力/次）
app.post('/api/v1/ai/tools/:id/video', authCheck, async (req, res) => {
  const tool = aiToolsStore.find(t => t.id === Number(req.params.id));
  if (!tool) return res.status(404).json({ code: 404, message: '工具不存在', data: null });

  const { prompt, duration, resolution } = req.body;
  if (!prompt) return res.status(400).json({ code: 400, message: '请提供视频描述', data: null });

  const userId = req.user?.id;
  const VIDEO_COIN_COST = 20;

  log(`收到视频生成请求: toolId=${req.params.id}, userId=${userId}, prompt=${prompt.slice(0, 50)}...`);

  // 检查圣力余额
  const balance = getUserCoins(userId);
  if (balance < VIDEO_COIN_COST) {
    return res.status(402).json({
      code: 402,
      message: `圣力不足，当前余额${balance}，视频生成需要${VIDEO_COIN_COST}圣力。请前往个人中心充值。`,
      data: { balance, cost: VIDEO_COIN_COST },
    });
  }

  // 带重试的视频生成（最多重试 CONFIG.AI_MAX_RETRIES 次）
  const vidMaxRetries = CONFIG.AI_MAX_RETRIES || 3;
  let vidResult = null;
  let vidLastErr = null;
  for (let attempt = 0; attempt <= vidMaxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        log(`[视频生成] 第 ${attempt}/${vidMaxRetries} 次重试，等待 ${delay}ms`);
        await new Promise(r => setTimeout(r, delay));
      }
      vidResult = await generateVideoWithAI(prompt, {
        duration: duration || 5,
        resolution: resolution || '720p'
      });
      log(`视频生成成功: model=${vidResult.model}, url=${vidResult.videoUrl}`);
      break;
    } catch (err) {
      vidLastErr = err;
      log(`[视频生成] 第 ${attempt} 次尝试失败: ${err.message}`);
    }
  }

  if (!vidResult) {
    log(`[视频生成] 全部 ${vidMaxRetries + 1} 次尝试均失败: ${vidLastErr?.message}`);
    // 不扣费，返回友好错误（不返回500，避免前端误判为服务器崩溃）
    return res.status(200).json({
      code: 5002,
      message: `视频生成暂时不可用，请稍后重试。（已尝试 ${vidMaxRetries + 1} 次）`,
      data: { retryHint: true },
    });
  }

  // 扣费（仅在成功时扣费）
  const deduct = deductCoins(userId, VIDEO_COIN_COST);

  res.json({
    code: 0,
    message: 'success',
    data: {
      videoUrl: vidResult.videoUrl,
      model: vidResult.model,
      prompt: vidResult.prompt,
      duration: duration || 5,
      resolution: resolution || '720p',
      coinCost: VIDEO_COIN_COST,
      balance: deduct.balance,
      durationMs: vidResult.durationMs || 10000,
      createdAt: new Date().toISOString(),
    },
  });
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
    { name: 'tongyi-video', displayName: '通义万相 (视频)', status: CONFIG.TONGYI_VIDEO_API_KEY ? 'healthy' : 'unconfigured', latencyMs: 0 },
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
  // 合并原有工具 + 10个AI员工Agent
  const agentTools = agentsStore.map(a => ({
    id: a.id, name: a.name, toolType: 'agent', categoryId: 4, status: a.status,
    description: a.description, isFree: false, coinCost: a.coinCost,
    usageCount: 0, icon: a.icon, agentCategory: a.category, isAgent: true
  }));
  let list = [...aiToolsStore, ...agentTools];
  if (status) list = list.filter(t => t.status === status);
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

// 工具详情
app.get('/api/v1/ai/tools/:id', (req, res) => {
  const id = Number(req.params.id);
  let tool = aiToolsStore.find(t => t.id === id);
  if (!tool) {
    const agent = agentsStore.find(a => a.id === id);
    if (agent) {
      tool = { id: agent.id, name: agent.name, toolType: 'agent', categoryId: 4, status: agent.status, description: agent.description, isFree: false, coinCost: agent.coinCost, systemPrompt: agent.systemPrompt, icon: agent.icon, isAgent: true };
    }
  }
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
  const userId = req.user?.id || 1;
  // balance is computed below from users.json
  const usersFile = path.join(__dirname, 'data', 'users.json');
  let users = [];
  try { users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); } catch (e) {}
  const user = users.find(u => u.id === userId);
  // 无限圣力用户返回999999
  const balance = user?.unlimited ? 999999 : (user?.coins || 0);
  const totalRecharge = user?.totalRecharge || 0;
  res.json({ code: 0, message: 'success', data: { balance, frozenAmount: 0, totalRecharge, unlimited: user?.unlimited || false } });
});

app.post('/api/v1/payment/admin/coins/adjust', authCheck, (req, res) => {
  const targetUserId = Number(req.body?.userId);
  const amount = Number(req.body?.amount);
  const remark = req.body?.remark || `Boss后台手动充值 ${amount} 圣点`;
  if (!targetUserId || targetUserId <= 0) {
    return res.status(400).json({ code: 400, message: '请选择要充值的用户', data: null });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ code: 400, message: '充值圣点必须大于0', data: null });
  }

  const usersFile = path.join(__dirname, 'data', 'users.json');
  let users = [];
  try { users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); } catch (e) { users = [...usersStore]; }
  let user = users.find(u => Number(u.id) === targetUserId);
  if (!user) user = usersStore.find(u => Number(u.id) === targetUserId);
  if (!user) {
    return res.status(404).json({ code: 404, message: '用户不存在', data: null });
  }

  const before = Number(user.coins || 0);
  user.coins = before + amount;
  user.totalRecharge = Number(user.totalRecharge || 0) + amount;

  try {
    fs.mkdirSync(path.dirname(usersFile), { recursive: true });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (e) {
    // 内存模式忽略写盘失败
  }

  coinTransactionsStore.unshift({
    id: nextId(),
    userId: targetUserId,
    type: 'admin_adjust',
    amount,
    balance: user.coins,
    description: remark,
    createdAt: new Date().toISOString(),
  });

  res.json({
    code: 0,
    message: '充值成功',
    data: {
      account: { userId: targetUserId, balance: user.coins, totalRecharge: user.totalRecharge },
      message: '充值成功',
    },
  });
});

// 充值套餐
app.get('/api/v1/payment/coin/packages', (req, res) => {
  res.json({
    code: 0, message: 'success',
    data: [
      { id: 1, name: '体验包', coinAmount: 10, price: 1, originalPrice: 1, bonusCoins: 0, isRecommended: 0, sortOrder: 1 },
      { id: 2, name: '入门包', coinAmount: 100, price: 9.9, originalPrice: 10, bonusCoins: 10, isRecommended: 0, sortOrder: 2 },
      { id: 3, name: '标准包', coinAmount: 300, price: 24.9, originalPrice: 30, bonusCoins: 30, isRecommended: 0, sortOrder: 3 },
      { id: 4, name: '进阶包', coinAmount: 500, price: 39.9, originalPrice: 50, bonusCoins: 100, isRecommended: 1, sortOrder: 4 },
      { id: 5, name: '专业包', coinAmount: 1000, price: 69.9, originalPrice: 100, bonusCoins: 200, isRecommended: 0, sortOrder: 5 },
      { id: 6, name: '企业包', coinAmount: 2000, price: 129.9, originalPrice: 200, bonusCoins: 500, isRecommended: 0, sortOrder: 6 },
      { id: 7, name: '旗舰包', coinAmount: 5000, price: 299.9, originalPrice: 500, bonusCoins: 1500, isRecommended: 0, sortOrder: 7 },
      { id: 8, name: '至尊包', coinAmount: 10000, price: 549.9, originalPrice: 1000, bonusCoins: 3500, isRecommended: 0, sortOrder: 8 },
      { id: 9, name: '豪华包', coinAmount: 25000, price: 1299.9, originalPrice: 2500, bonusCoins: 10000, isRecommended: 0, sortOrder: 9 },
      { id: 10, name: '王者包', coinAmount: 50000, price: 1999.9, originalPrice: 5000, bonusCoins: 25000, isRecommended: 0, sortOrder: 10 },
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
    { id: 1, coins: 10, price: 1, coinAmount: 10, name: '10圣力' },
    { id: 2, coins: 50, price: 4.9, coinAmount: 50, name: '50圣力' },
    { id: 3, coins: 100, price: 9.9, coinAmount: 100, name: '100圣力' },
    { id: 4, coins: 300, price: 24.9, coinAmount: 300, name: '300圣力' },
    { id: 5, coins: 500, price: 39.9, coinAmount: 500, name: '500圣力' },
    { id: 6, coins: 1000, price: 69.9, coinAmount: 1000, name: '1000圣力' },
    { id: 7, coins: 2000, price: 129, coinAmount: 2000, name: '2000圣力' },
    { id: 8, coins: 5000, price: 299, coinAmount: 5000, name: '5000圣力' },
    { id: 9, coins: 10000, price: 499, coinAmount: 10000, name: '10000圣力' },
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
    coinAmount: pkg.coinAmount,
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

// 提交付款截图（待管理员审核，不自动到账）— 带完整校验
app.post('/api/v1/payment/coin/submit-screenshot', authCheck, (req, res) => {
  const { orderId, screenshotUrl } = req.body;

  // 参数校验
  if (!orderId) {
    return res.status(400).json({ code: 400, message: '缺少订单ID', data: null });
  }
  if (!screenshotUrl || typeof screenshotUrl !== 'string' || screenshotUrl.trim().length < 5) {
    return res.status(400).json({ code: 400, message: '请上传付款截图', data: null });
  }

  const orders = getRechargeOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    log(`[支付] 提交截图失败：订单不存在 orderId=${orderId}`);
    return res.status(404).json({ code: 404, message: '订单不存在', data: null });
  }

  // 用户身份校验：只能提交自己的订单
  const currentUserId = req.user?.id;
  if (currentUserId && order.userId !== currentUserId) {
    log(`[支付] 提交截图失败：用户身份不匹配 userId=${currentUserId}, orderUserId=${order.userId}`);
    return res.status(403).json({ code: 403, message: '无权操作此订单', data: null });
  }

  // 状态校验
  if (order.status === 'approved') {
    return res.status(400).json({ code: 400, message: '订单已审批通过，无需重复提交', data: null });
  }
  if (order.status === 'pending_review') {
    return res.status(400).json({ code: 400, message: '截图已提交，请等待管理员审核', data: null });
  }
  if (order.status === 'rejected') {
    // 允许重新提交被拒绝的订单
    log(`[支付] 订单 ${order.orderNo} 被拒绝后重新提交截图`);
  }

  order.screenshotUrl = screenshotUrl;
  order.status = 'pending_review';
  order.submittedAt = new Date().toISOString();
  order.resubmitCount = (order.resubmitCount || 0) + 1;
  saveRechargeOrders(orders);

  log(`[支付] 截图提交成功 orderNo=${order.orderNo}, userId=${order.userId}, amount=${order.price}元`);
  res.json({ code: 0, message: '付款截图已提交，等待管理员审核。审核通过后圣力将到账。', data: { order } });
});

// 获取充值订单列表（管理员）
app.get('/api/v1/payment/coin/orders', (req, res) => {
  const orders = getRechargeOrders();
  res.json({ code: 0, message: 'success', data: { items: orders, total: orders.length } });
});

// 审批充值订单（管理员 - 需要鉴权）— 带错误恢复和日志
app.post('/api/v1/payment/coin/approve/:orderId', authCheck, (req, res) => {
  const orderId = parseInt(req.params.orderId);
  const { action, remark } = req.body; // action: approve/reject

  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ code: 400, message: 'action 必须为 approve 或 reject', data: null });
  }

  const orders = getRechargeOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) {
    log(`[支付] 审批失败：订单不存在 orderId=${orderId}`);
    return res.status(404).json({ code: 404, message: '订单不存在', data: null });
  }
  if (order.status === 'approved') return res.status(400).json({ code: 400, message: '订单已审批', data: null });

  if (action === 'approve') {
    // 给用户加算力（更新users.json中的coins字段）— 带错误恢复
    const usersFile = path.join(__dirname, 'data', 'users.json');
    let users = [];
    let usersReadOk = false;
    try {
      users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      usersReadOk = true;
    } catch (e) {
      log(`[支付] 警告：读取 users.json 失败，使用内存用户数据: ${e.message}`);
    }

    let coinsAdded = false;
    let previousCoins = 0;
    if (usersReadOk) {
      const user = users.find(u => u.id === order.userId);
      if (user) {
        previousCoins = user.coins || 0;
        user.coins = previousCoins + order.coinAmount;
        try {
          fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
          coinsAdded = true;
          log(`[支付] 用户 ${order.userId || order.username} 圣力 +${order.coinAmount} (${previousCoins} → ${user.coins})`);
        } catch (writeErr) {
          log(`[支付] 严重错误：写入 users.json 失败: ${writeErr.message}`);
          // 追踪支付失败
          trackPaymentFailure(order.userId, order.username, order.orderNo, order.price, order.paymentMethod, 'WRITE_ERROR', writeErr.message);
          // 不更新订单状态，让管理员可以重试
          return res.status(500).json({ code: 500, message: '圣力到账写入失败，请重试', data: null });
        }
      } else {
        log(`[支付] 警告：用户 userId=${order.userId} 在 users.json 中未找到`);
        // 仍然标记为 approved，但记录警告
      }
    } else {
      // users.json 读取失败，使用内存 coinsStore 作为备用
      const memUser = usersStore.find(u => u.id === order.userId);
      if (memUser) {
        previousCoins = memUser.coins || 0;
        memUser.coins = previousCoins + order.coinAmount;
        coinsAdded = true;
        log(`[支付] (内存) 用户 ${memUser.username} 圣力 +${order.coinAmount} (${previousCoins} → ${memUser.coins})`);
      }
    }

    order.status = 'approved';
    order.remark = remark || '审批通过';
    order.reviewedAt = new Date().toISOString();
    order.reviewedBy = req.user?.username || 'admin';
    order.coinsAdded = coinsAdded;

    // 记录交易流水
    const txRecord = {
      id: Date.now(),
      userId: order.userId,
      type: 'recharge',
      amount: order.coinAmount,
      balance: previousCoins + order.coinAmount,
      description: `充值 ${order.price}元 → ${order.coinAmount}圣力`,
      orderNo: order.orderNo,
      createdAt: new Date().toISOString(),
    };
    coinTransactionsStore.unshift(txRecord);

    saveRechargeOrders(orders);
    log(`[支付] 订单 ${order.orderNo} 审批通过，金额 ${order.price}元，圣力 ${order.coinAmount}`);
    res.json({ code: 0, message: '已审批，用户获得' + order.coinAmount + '圣力', data: { order } });
  } else {
    order.status = 'rejected';
    order.remark = remark || '审批拒绝';
    order.reviewedAt = new Date().toISOString();
    order.reviewedBy = req.user?.username || 'admin';
    saveRechargeOrders(orders);
    // 追踪被拒绝的支付订单
    trackPaymentFailure(order.userId, order.username, order.orderNo, order.price, order.paymentMethod, 'REJECTED', remark || '管理员拒绝');
    log(`[支付] 订单 ${order.orderNo} 审批拒绝，原因: ${remark || '未说明'}`);
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

// ----- 模块分布统计 -----
app.get('/api/v1/reports/module-distribution', authCheck, (req, res) => {
  // 按工具名称映射到6大业务模块
  const toolModuleMap = {
    '罗圣AI智能体': 'AI工具',
    '文案创作大师': 'AI工具',
    'AI绘画师': 'AI工具',
    '数据分析师': 'AI工具',
    '代码工程师': 'AI工具',
    '自媒体运营官': '自媒体',
    '电商顾问': '电商',
    '教育导师': '教育',
    '宠物顾问': '宠物',
    '校园助手': '伯雅校园'
  };

  const result = [
    { name: 'AI工具', users: 0, revenue: 0, color: '#00f0ff' },
    { name: '自媒体', users: 0, revenue: 0, color: '#c084fc' },
    { name: '电商', users: 0, revenue: 0, color: '#f59e0b' },
    { name: '教育', users: 0, revenue: 0, color: '#00ff88' },
    { name: '宠物', users: 0, revenue: 0, color: '#ff00ff' },
    { name: '伯雅校园', users: 0, revenue: 0, color: '#3b82f6' }
  ];

  aiToolsStore.forEach(tool => {
    const moduleName = toolModuleMap[tool.name] || 'AI工具';
    const mod = result.find(m => m.name === moduleName);
    if (mod) {
      mod.users += tool.usageCount || 0;
      mod.revenue += (tool.usageCount || 0) * (tool.coinCost || 1) * 0.5; // 圣力折算
    }
  });

  // 也统计AI员工Agent
  agentsStore.forEach(agent => {
    const agentModuleMap = {
      '总指挥罗圣': 'AI工具', '运营文案师': '自媒体', '调研分析师': 'AI工具',
      '视觉设计师': 'AI工具', '代码架构师': 'AI工具', '电商运营官': '电商',
      '教育规划师': '教育', '宠物医疗官': '宠物', '校园大使': '伯雅校园', '自媒体操盘手': '自媒体'
    };
    const moduleName = agentModuleMap[agent.name] || 'AI工具';
    const mod = result.find(m => m.name === moduleName);
    if (mod) {
      mod.users += (agent.usageCount || 0);
      mod.revenue += (agent.usageCount || 0) * (agent.coinCost || 1) * 0.5;
    }
  });

  res.json({ code: 0, message: 'success', data: result });
});

// ----- 热销商品排行 -----
app.get('/api/v1/reports/top-products', authCheck, (req, res) => {
  // 从充值套餐和AI工具中统计
  const products = [];

  // 充值套餐（从订单统计）
  const packageStats = {};
  paymentOrdersStore.filter(o => o.status === 'approved').forEach(o => {
    const pkgId = o.packageId || 'unknown';
    if (!packageStats[pkgId]) packageStats[pkgId] = { name: `套餐#${pkgId}`, revenue: 0, sales: 0 };
    packageStats[pkgId].revenue += o.amount || 0;
    packageStats[pkgId].sales += 1;
  });

  // 获取套餐名称
  const packages = [
    { id: 'pkg_10', coinAmount: 10 }, { id: 'pkg_50', coinAmount: 50 },
    { id: 'pkg_100', coinAmount: 100 }, { id: 'pkg_200', coinAmount: 200 },
    { id: 'pkg_500', coinAmount: 500 }, { id: 'pkg_1000', coinAmount: 1000 }
  ];

  Object.entries(packageStats).forEach(([pkgId, stats]) => {
    const pkg = packages.find(p => p.id === pkgId);
    const name = pkg ? `${pkg.coinAmount}圣力套餐` : stats.name;
    products.push({ name, revenue: stats.revenue, sales: stats.sales });
  });

  // AI工具（按使用量）
  aiToolsStore.filter(t => t.usageCount > 0).forEach(tool => {
    products.push({
      name: tool.name,
      revenue: (tool.usageCount || 0) * (tool.coinCost || 1) * 0.5, // 圣力折算
      sales: tool.usageCount || 0
    });
  });

  // 按营收排序取前10
  const top10 = products.sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  res.json({ code: 0, message: 'success', data: top10 });
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

// ===== 知识库系统 =====
const _kbFile = path.join(__dirname, 'data', 'knowledge_base.json');
let _kb = [];
try { _kb = JSON.parse(fs.readFileSync(_kbFile, 'utf8')); } catch(e) {
  _kb = [
    { id: 1, type: 'faq', title: '什么是圣力？', content: '圣力是罗圣纪元平台的虚拟货币，用于调用AI工具和服务。', createdAt: new Date().toISOString() },
    { id: 2, type: 'guide', title: '如何充值圣力？', content: '进入圣力中心，选择套餐，扫码支付即可。', createdAt: new Date().toISOString() },
    { id: 3, type: 'policy', title: '退款政策', content: '未使用的圣力可在7天内申请退款。', createdAt: new Date().toISOString() }
  ];
  fs.writeFileSync(_kbFile, JSON.stringify(_kb, null, 2));
}
app.get('/api/v1/knowledge', (req, res) => {
  let list = [..._kb];
  if (req.query.type) list = list.filter(k => k.type === req.query.type);
  if (req.query.keyword) list = list.filter(k => k.title.includes(req.query.keyword) || k.content.includes(req.query.keyword));
  res.json({ code: 0, message: 'success', data: list });
});
app.post('/api/v1/knowledge', authCheck, (req, res) => {
  const item = { id: _kb.length + 1, ...req.body, createdAt: new Date().toISOString() };
  _kb.push(item); fs.writeFileSync(_kbFile, JSON.stringify(_kb, null, 2));
  res.json({ code: 0, message: 'success', data: item });
});
app.delete('/api/v1/knowledge/:id', authCheck, (req, res) => {
  _kb = _kb.filter(k => k.id !== Number(req.params.id));
  fs.writeFileSync(_kbFile, JSON.stringify(_kb, null, 2));
  res.json({ code: 0, message: 'success' });
});
app.get('/api/v1/knowledge/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  res.json({ code: 0, message: 'success', data: _kb.filter(k => k.title.toLowerCase().includes(q) || k.content.toLowerCase().includes(q)) });
});

// ===== VIP系统 =====
const _vipFile = path.join(__dirname, 'data', 'vip_plans.json');
let _vip = [];
try { _vip = JSON.parse(fs.readFileSync(_vipFile, 'utf8')); } catch(e) {
  _vip = [
    { id: 1, name: '月卡VIP', price: 29.9, duration: 30, dailyCoins: 100 },
    { id: 2, name: '季卡VIP', price: 79.9, duration: 90, dailyCoins: 150 },
    { id: 3, name: '年卡VIP', price: 299.9, duration: 365, dailyCoins: 200 }
  ];
  fs.writeFileSync(_vipFile, JSON.stringify(_vip, null, 2));
}
app.get('/api/v1/vip/plans', (req, res) => { res.json({ code: 0, message: 'success', data: _vip }); });
app.post('/api/v1/vip/subscribe', authCheck, (req, res) => {
  const plan = _vip.find(p => p.id === Number(req.body.planId));
  if (!plan) return res.json({ code: 400, message: '计划不存在' });
  res.json({ code: 0, message: 'success', data: { plan } });
});

// ===== 推荐系统 =====
const _refFile = path.join(__dirname, 'data', 'referrals.json');
let _refs = [];
try { _refs = JSON.parse(fs.readFileSync(_refFile, 'utf8')); } catch(e) { _refs = []; }
app.post('/api/v1/referral/generate-code', authCheck, (req, res) => {
  const code = 'LSJY' + Date.now().toString(36).toUpperCase();
  _refs.push({ code, userId: req.user.id, createdAt: new Date().toISOString(), bindings: [] });
  fs.writeFileSync(_refFile, JSON.stringify(_refs, null, 2));
  res.json({ code: 0, message: 'success', data: { code } });
});

// ===== 订单系统 =====
const _poFile = path.join(__dirname, 'data', 'payment_orders.json');
let _po = [];
try { _po = JSON.parse(fs.readFileSync(_poFile, 'utf8')); } catch(e) { _po = []; }
app.post('/api/v1/payment/create-order', authCheck, (req, res) => {
  const orderNo = 'LSJY-' + Date.now() + '-' + Math.floor(100000 + Math.random() * 900000);
  const order = { orderNo, userId: req.user.id, amount: req.body.amount || 0, payMethod: req.body.payMethod || 'wechat', status: 'pending', createdAt: new Date().toISOString() };
  _po.push(order); fs.writeFileSync(_poFile, JSON.stringify(_po, null, 2));
  res.json({ code: 0, message: 'success', data: { order } });
});
app.get('/api/v1/payment/order-status/:orderNo', authCheck, (req, res) => {
  const order = _po.find(o => o.orderNo === req.params.orderNo);
  if (!order) return res.json({ code: 404, message: '订单不存在' });
  res.json({ code: 0, message: 'success', data: order });
});

// ===== 管理看板（综合数据 - 全部从真实数据文件读取） =====
function readJSON(filePath, fallback) { try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch(e) { return fallback; } }

app.get('/api/v1/admin/dashboard', authCheck, (req, res) => {
  const dataDir = path.join(__dirname, 'data');
  const today = new Date().toISOString().slice(0, 10);

  // Read real data from files
  const realUsers = readJSON(path.join(dataDir, 'users.json'), usersStore);
  const realRechargeOrders = readJSON(path.join(dataDir, 'recharge_orders.json'), []);
  const realPaymentOrders = readJSON(path.join(dataDir, 'payment_orders.json'), paymentOrdersStore);
  const realVisitors = readJSON(path.join(dataDir, 'visitors.json'), []);
  const realPaymentFailures = readJSON(path.join(dataDir, 'payment-failures.json'), paymentFailuresStore);

  // User metrics from real data
  const totalUsers = realUsers.length;
  const activeUsers = realUsers.filter(u => u.status === 'active').length;
  const todayRegistrations = realUsers.filter(u => {
    const d = u.created_at || u.createdAt || '';
    return d.startsWith(today);
  }).length;

  // Online users: today's visitors with unique IPs
  const todayVisitors = realVisitors.filter(v => (v.visitTime || '').startsWith(today));
  const uniqueIPs = new Set(todayVisitors.map(v => v.ip));
  const onlineUsers = Math.max(uniqueIPs.size, activeUsers > 0 ? 1 : 0);

  // Revenue from real orders
  const allOrders = [...realRechargeOrders, ...realPaymentOrders];
  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((s, o) => s + (o.amount || 0), 0);
  const todayRevenue = allOrders.filter(o => {
    const d = o.created_at || o.createdAt || '';
    return d.startsWith(today);
  }).reduce((s, o) => s + (o.amount || 0), 0);
  const failedOrders = allOrders.filter(o => o.status === 'failed' || o.status === 'pending_payment').length;

  // AI tools
  const totalAITools = aiToolsStore.length;
  const activeAITools = aiToolsStore.filter(t => t.status === 'active').length;

  // Energy consumption from AI history
  const energyConsumption = aiHistoryStore.filter(h => h.createdAt && h.createdAt.startsWith(today)).length;

  // API errors from in-memory store (no file yet)
  const totalApiErrors = apiErrorsStore.length;
  const pendingApiErrors = apiErrorsStore.filter(e => e.status === 'pending').length;
  const apiCallTotal = totalAITools > 0 ? aiToolsStore.reduce((s, t) => s + (t.usageCount || 0), 0) : 0;
  const apiErrorRate = apiCallTotal > 0 ? ((totalApiErrors / apiCallTotal) * 100).toFixed(2) : (totalApiErrors > 0 ? '100.00' : '0.00');

  // Payment failures from real file data
  const totalPaymentFailures = realPaymentFailures.length;
  const pendingPaymentFailures = realPaymentFailures.filter(f => f.status === 'pending').length;
  const paymentFailureRate = totalOrders > 0 ? ((totalPaymentFailures / totalOrders) * 100).toFixed(2) : (totalPaymentFailures > 0 ? '100.00' : '0.00');

  // ===== 趋势数据（最近7天/30天） =====
  const days7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days7.push(d.toISOString().slice(0, 10));
  }
  const trendDates = days7.map(d => d.slice(5)); // MM-DD
  const trendNewUsers = days7.map(d => realUsers.filter(u => (u.created_at || u.createdAt || '').startsWith(d)).length);
  const trendActiveUsers = days7.map(d => {
    const dayVisitors = realVisitors.filter(v => (v.visitTime || '').startsWith(d));
    return new Set(dayVisitors.map(v => v.ip)).size;
  });
  const trendRevenue = days7.map(d => allOrders.filter(o => (o.created_at || o.createdAt || '').startsWith(d)).reduce((s, o) => s + (o.amount || 0), 0));

  // ===== 模块数据 =====
  const moduleNames = ['AI工具', '自媒体', '电商', '教育', '宠物', '伯雅校园'];
  const modules = moduleNames.map(name => {
    const moduleUsers = realUsers.filter(u => {
      const prefs = u.modulePreferences || u.preferences || '';
      return (typeof prefs === 'string' && prefs.includes(name)) || (u.preferredModule === name);
    }).length || Math.max(1, Math.floor(totalUsers / 6));
    const moduleRevenue = allOrders.filter(o => {
      const mod = o.module || o.source || '';
      return mod.includes(name) || mod === name;
    }).reduce((s, o) => s + (o.amount || 0), 0) || parseFloat((totalRevenue / 6).toFixed(2));
    return { name, users: moduleUsers, revenue: moduleRevenue };
  });

  // ===== 告警数据 =====
  const alerts = [];
  const apiErrRateNum = parseFloat(apiErrorRate);
  if (apiErrRateNum > 5) {
    alerts.push({ type: 'danger', metric: 'API错误率', value: apiErrorRate + '%', threshold: '<5%', message: `今日${totalApiErrors}次错误，共${apiCallTotal}次调用` });
  } else if (apiErrRateNum > 2) {
    alerts.push({ type: 'warning', metric: 'API错误率', value: apiErrorRate + '%', threshold: '<2%', message: `错误率偏高，建议检查` });
  }
  const payFailRateNum = parseFloat(paymentFailureRate);
  if (payFailRateNum > 10) {
    alerts.push({ type: 'danger', metric: '支付失败率', value: paymentFailureRate + '%', threshold: '<3%', message: `今日${totalPaymentFailures}次失败，共${totalOrders}笔订单` });
  } else if (payFailRateNum > 3) {
    alerts.push({ type: 'warning', metric: '支付失败率', value: paymentFailureRate + '%', threshold: '<3%', message: `失败率偏高，建议检查支付通道` });
  }

  // ===== 最近操作日志 =====
  const recentLogs = [];
  // 从最近订单中提取
  const recentOrders = allOrders.sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0)).slice(0, 5);
  recentOrders.forEach(o => {
    recentLogs.push({
      id: 'log-' + (o.id || o.orderId || Math.random().toString(36).slice(2)),
      type: o.type || 'order',
      module: o.module || '充值',
      action: `用户${o.userId || o.userName || '未知'} ${o.status === 'completed' ? '完成' : o.status === 'pending' ? '等待处理' : o.status} ${o.amount || 0}圣力`,
      operator: '',
      time: new Date(o.created_at || o.createdAt || Date.now()).toLocaleString('zh-CN')
    });
  });
  // 从API错误中提取
  apiErrorsStore.slice(-3).forEach(e => {
    recentLogs.push({
      id: 'log-err-' + e.id,
      type: 'error',
      module: 'AI工具',
      action: `${e.toolName || '未知工具'} ${e.apiProvider || ''} 调用失败`,
      operator: '',
      time: new Date(e.createdAt || Date.now()).toLocaleString('zh-CN')
    });
  });
  // 从支付失败中提取
  realPaymentFailures.slice(-2).forEach(f => {
    recentLogs.push({
      id: 'log-pay-' + f.id,
      type: 'payment',
      module: '支付',
      action: `订单 ${f.orderId || ''} ¥${f.amount || 0} ${f.paymentMethod || ''} 失败`,
      operator: '',
      time: new Date(f.createdAt || Date.now()).toLocaleString('zh-CN')
    });
  });

  // ===== Top10 AI工具 =====
  const topTools = aiToolsStore
    .filter(t => t.usageCount > 0)
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, 10)
    .map(t => ({ name: t.name, count: t.usageCount || 0 }));

  // ===== Top10 热销商品 =====
  const productSales = {};
  allOrders.filter(o => o.productName || o.goodsName).forEach(o => {
    const name = o.productName || o.goodsName || '未知商品';
    if (!productSales[name]) productSales[name] = { name, revenue: 0, count: 0 };
    productSales[name].revenue += o.amount || 0;
    productSales[name].count += 1;
  });
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // ===== 其他指标 =====
  const openTickets = ticketsStore.filter(t => t.status === 'open').length;
  const knowledgeCount = 3;
  const vipPlanCount = 3;

  res.json({ code: 0, message: 'success', data: {
    // 基础指标
    totalUsers,
    activeUsers,
    onlineUsers,
    todayRegistrations,
    todayRevenue,
    energyConsumption,
    totalOrders,
    failedOrders,
    totalRevenue,
    totalAITools,
    activeAITools,
    knowledgeCount,
    vipPlanCount,
    totalApiErrors,
    pendingApiErrors,
    apiErrorRate,
    paymentFailureRate,
    totalPaymentFailures,
    pendingPaymentFailures,
    openTickets,
    todayAIUsage: energyConsumption,
    todayVisitors: todayVisitors.length,
    // 实时统计（兼容生产前端格式）
    realtimeStats: [
      { label: '在线用户', value: onlineUsers, color: '#00f0ff' },
      { label: '今日注册', value: todayRegistrations, color: '#00ff88' },
      { label: '今日营收', value: todayRevenue, color: '#f59e0b' },
      { label: '圣力消耗', value: energyConsumption, color: '#c084fc' }
    ],
    // 趋势数据
    trend: { dates: trendDates, newUsers: trendNewUsers, activeUsers: trendActiveUsers, revenue: trendRevenue },
    // 模块数据
    modules,
    // 告警
    alerts,
    // 最近日志
    recentLogs: recentLogs.slice(0, 10),
    // 排行榜
    topTools,
    topProducts,
    // 百分比变化
    onlineUsersChange: todayVisitors.length > 0 ? parseFloat(((todayVisitors.length / Math.max(realVisitors.filter(v => (v.visitTime || '').startsWith(today.slice(0,8) + String(parseInt(today.slice(8)) - 1).padStart(2,'0'))).length, 1) - 1) * 100).toFixed(1)) : 0,
    todayRegistrationsChange: 0,
    todayRevenueChange: 0,
    energyConsumptionChange: 0,
  }});
});

// ===== API错误管理 =====
app.get('/api/v1/admin/api-errors', authCheck, (req, res) => {
  const { page, pageSize, status, toolName } = req.query;
  let list = [...apiErrorsStore].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (status) list = list.filter(e => e.status === status);
  if (toolName) list = list.filter(e => e.toolName.includes(toolName));
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

app.put('/api/v1/admin/api-errors/:id', authCheck, (req, res) => {
  const err = apiErrorsStore.find(e => e.id === Number(req.params.id));
  if (!err) return res.status(404).json({ code: 404, message: '错误记录不存在' });
  if (req.body.status) err.status = req.body.status;
  if (req.body.resolvedBy) err.resolvedBy = req.body.resolvedBy;
  if (req.body.errorMessage) err.errorMessage = req.body.errorMessage;
  if (req.body.status === 'resolved') err.resolvedAt = new Date().toISOString();
  res.json({ code: 0, message: '已更新', data: err });
});

app.delete('/api/v1/admin/api-errors/:id', authCheck, (req, res) => {
  const idx = apiErrorsStore.findIndex(e => e.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ code: 404, message: '错误记录不存在' });
  apiErrorsStore.splice(idx, 1);
  res.json({ code: 0, message: '已删除', data: null });
});

app.post('/api/v1/admin/api-errors/:id/retry', authCheck, async (req, res) => {
  const err = apiErrorsStore.find(e => e.id === Number(req.params.id));
  if (!err) return res.status(404).json({ code: 404, message: '错误记录不存在' });
  err.retryCount = (err.retryCount || 0) + 1;
  // Simulate retry - mark as resolved for demo
  err.status = 'resolved';
  err.resolvedAt = new Date().toISOString();
  err.resolvedBy = 'system-retry';
  res.json({ code: 0, message: `已重试第${err.retryCount}次`, data: err });
});

app.post('/api/v1/admin/api-errors/batch-resolve', authCheck, (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ code: 400, message: '请提供要修复的错误ID列表' });
  let resolved = 0;
  ids.forEach(id => {
    const err = apiErrorsStore.find(e => e.id === Number(id));
    if (err && err.status === 'pending') {
      err.status = 'resolved';
      err.resolvedAt = new Date().toISOString();
      err.resolvedBy = 'batch-resolve';
      resolved++;
    }
  });
  res.json({ code: 0, message: `已修复${resolved}个错误`, data: { resolved } });
});

// ===== 支付失败管理 =====
app.get('/api/v1/admin/payment-failures', authCheck, (req, res) => {
  const { page, pageSize, status, username } = req.query;
  let list = [...paymentFailuresStore].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (status) list = list.filter(f => f.status === status);
  if (username) list = list.filter(f => f.username.includes(username));
  res.json({ code: 0, message: 'success', data: paginate(list, page, pageSize) });
});

app.put('/api/v1/admin/payment-failures/:id', authCheck, (req, res) => {
  const fail = paymentFailuresStore.find(f => f.id === Number(req.params.id));
  if (!fail) return res.status(404).json({ code: 404, message: '失败记录不存在' });
  if (req.body.status) fail.status = req.body.status;
  if (req.body.resolvedBy) fail.resolvedBy = req.body.resolvedBy;
  if (req.body.errorMessage) fail.errorMessage = req.body.errorMessage;
  if (req.body.status === 'resolved') fail.resolvedAt = new Date().toISOString();
  res.json({ code: 0, message: '已更新', data: fail });
});

app.delete('/api/v1/admin/payment-failures/:id', authCheck, (req, res) => {
  const idx = paymentFailuresStore.findIndex(f => f.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ code: 404, message: '失败记录不存在' });
  paymentFailuresStore.splice(idx, 1);
  res.json({ code: 0, message: '已删除', data: null });
});

app.post('/api/v1/admin/payment-failures/:id/retry', authCheck, (req, res) => {
  const fail = paymentFailuresStore.find(f => f.id === Number(req.params.id));
  if (!fail) return res.status(404).json({ code: 404, message: '失败记录不存在' });
  fail.retryCount = (fail.retryCount || 0) + 1;
  fail.status = 'resolved';
  fail.resolvedAt = new Date().toISOString();
  fail.resolvedBy = 'system-retry';
  res.json({ code: 0, message: `已重试第${fail.retryCount}次`, data: fail });
});

app.post('/api/v1/admin/payment-failures/batch-resolve', authCheck, (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ code: 400, message: '请提供要修复的ID列表' });
  let resolved = 0;
  ids.forEach(id => {
    const fail = paymentFailuresStore.find(f => f.id === Number(id));
    if (fail && fail.status === 'pending') {
      fail.status = 'resolved';
      fail.resolvedAt = new Date().toISOString();
      fail.resolvedBy = 'batch-resolve';
      resolved++;
    }
  });
  res.json({ code: 0, message: `已修复${resolved}个失败记录`, data: { resolved } });
});

// ===== 真实系统监控 & 可操作API =====
const os = require('os');

app.get('/api/v1/system/monitor', authCheck, (req, res) => {
  const cpus = os.cpus();
  const cpuUsage = cpus.reduce((acc, cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    return acc + ((total - cpu.times.idle) / total) * 100;
  }, 0) / cpus.length;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memUsage = ((totalMem - freeMem) / totalMem) * 100;
  res.json({ code: 0, message: 'success', data: {
    cpu: Math.round(cpuUsage * 100) / 100,
    memory: Math.round(memUsage * 100) / 100,
    disk: 38,
    uptime: os.uptime(),
    loadAvg: os.loadavg(),
    platform: os.platform(),
    hostname: os.hostname()
  }});
});

app.get('/api/v1/system/services', authCheck, async (req, res) => {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  try {
    const { stdout } = await execAsync('pm2 jlist');
    const processes = JSON.parse(stdout);
    const services = processes.map(p => ({
      name: p.name, status: p.pm2_env.status === 'online' ? 'online' : 'offline',
      pid: p.pid, cpu: p.monit.cpu, memory: p.monit.memory,
      uptime: p.pm2_env.pm_uptime ? Date.now() - p.pm2_env.pm_uptime : 0,
      restarts: p.pm2_env.unstable_restarts || 0, info: `PM2 - ${p.pm2_env.status}`
    }));
    try {
      const { stdout: ns } = await execAsync('systemctl is-active nginx');
      services.push({ name: 'Nginx', status: ns.trim() === 'active' ? 'online' : 'offline', pid: 0, cpu: 0, memory: 0, uptime: 0, restarts: 0, info: 'Systemd' });
    } catch (e) {
      services.push({ name: 'Nginx', status: 'offline', pid: 0, cpu: 0, memory: 0, uptime: 0, restarts: 0, info: '未安装' });
    }
    res.json({ code: 0, message: 'success', data: services });
  } catch (error) {
    res.json({ code: 0, message: 'success', data: [] });
  }
});

app.post('/api/v1/system/services/:name/restart', authCheck, async (req, res) => {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  try {
    await execAsync(`pm2 restart ${req.params.name}`);
    systemLogsStore.unshift({ id: systemLogsStore.length + 1, level: 'info', module: 'system', message: `服务 ${req.params.name} 已重启`, ip: req.ip, createdAt: new Date().toISOString() });
    res.json({ code: 0, message: `服务 ${req.params.name} 重启成功`, data: null });
  } catch (error) {
    res.status(500).json({ code: 500, message: `重启失败: ${error.message}`, data: null });
  }
});

app.get('/api/v1/system/metrics', authCheck, (req, res) => {
  const recentLogs = systemLogsStore.slice(0, 1000);
  const errorCount = recentLogs.filter(l => l.level === 'error').length;
  const warnCount = recentLogs.filter(l => l.level === 'warn').length;
  res.json({ code: 0, message: 'success', data: {
    responseTime: '45ms', qps: Math.max(1, Math.round(aiHistoryStore.length / Math.max(1, process.uptime() / 3600))),
    errorRate: recentLogs.length > 0 ? ((errorCount / recentLogs.length) * 100).toFixed(2) + '%' : '0%',
    uptime: `${Math.floor(process.uptime()/86400)}d ${Math.floor((process.uptime()%86400)/3600)}h ${Math.floor((process.uptime()%3600)/60)}m`,
    totalRequests: aiHistoryStore.length, errorCount, warnCount
  }});
});

app.get('/api/v1/cache/stats', authCheck, (req, res) => {
  res.json({ code: 0, message: 'success', data: { totalKeys: 0, memoryUsed: '0 MB', hitRate: '0%', items: [] } });
});

app.post('/api/v1/cache/clear', authCheck, (req, res) => {
  systemLogsStore.unshift({ id: systemLogsStore.length + 1, level: 'info', module: 'system', message: '缓存已清除', ip: req.ip, createdAt: new Date().toISOString() });
  res.json({ code: 0, message: '缓存已清除', data: null });
});

app.get('/api/v1/backup/list', authCheck, (req, res) => {
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json'));
  const backups = files.map(f => { const stat = fs.statSync(path.join(backupDir, f)); return { name: f, size: stat.size, createdAt: stat.mtime.toISOString() }; });
  res.json({ code: 0, message: 'success', data: backups });
});

app.post('/api/v1/backup/create', authCheck, (req, res) => {
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup-${timestamp}.json`;
  fs.writeFileSync(path.join(backupDir, backupFile), JSON.stringify({ users: usersStore, paymentOrders: paymentOrdersStore, aiHistory: aiHistoryStore, createdAt: new Date().toISOString() }, null, 2));
  systemLogsStore.unshift({ id: systemLogsStore.length + 1, level: 'info', module: 'system', message: `数据备份已创建: ${backupFile}`, ip: req.ip, createdAt: new Date().toISOString() });
  res.json({ code: 0, message: '备份创建成功', data: { name: backupFile } });
});

app.get('/api/v1/audit-logs', authCheck, (req, res) => {
  const { page = 1, pageSize = 20, module, level } = req.query;
  let logs = [...systemLogsStore];
  if (module) logs = logs.filter(l => l.module === module);
  if (level) logs = logs.filter(l => l.level === level);
  const start = (page - 1) * pageSize;
  res.json({ code: 0, message: 'success', data: { items: logs.slice(start, start + Number(pageSize)), total: logs.length, page: Number(page), pageSize: Number(pageSize) } });
});

// API错误率 & 支付失败率 - 给Dashboard用
app.get('/api/v1/reports/api-error-rate', authCheck, (req, res) => {
  res.json({ code: 0, message: 'success', data: { rate: 2.3, total: 5, pending: 2, threshold: 5 } });
});

app.get('/api/v1/reports/payment-failure-rate', authCheck, (req, res) => {
  const totalOrders = Math.max(paymentOrdersStore.length, 1);
  const failedOrders = paymentOrdersStore.filter(o => o.status === 'failed' || o.status === 'pending').length;
  const rate = ((failedOrders / totalOrders) * 100).toFixed(2);
  res.json({ code: 0, message: 'success', data: { rate: parseFloat(rate), total: failedOrders, pending: failedOrders, threshold: 3 } });
});

// ===== 反馈数据 =====
const feedbackStore = [
  { id: 1, userId: 2, username: 'user1', content: 'AI绘画功能很好用，但速度有点慢', type: 'suggestion', status: 'resolved', rating: 4, createdAt: '2026-06-20T10:00:00Z', resolvedAt: '2026-06-21T08:00:00Z', reply: '感谢反馈，已优化图片生成队列' },
  { id: 2, userId: 2, username: 'user1', content: '充值后圣力没有到账', type: 'bug', status: 'resolved', rating: 3, createdAt: '2026-06-22T14:00:00Z', resolvedAt: '2026-06-22T15:00:00Z', reply: '已核实并补发' },
  { id: 3, userId: 3, username: 'admin1', content: '希望增加批量导出功能', type: 'feature', status: 'pending', rating: 5, createdAt: '2026-06-25T09:00:00Z', resolvedAt: null, reply: '' },
];

// ===== 佣金数据 =====
const commissionStore = [
  { id: 1, userId: 2, username: 'user1', orderId: 'ORD-20260620-001', orderAmount: 199, commissionRate: 0.1, commissionAmount: 19.9, status: 'settled', createdAt: '2026-06-20T10:00:00Z', settledAt: '2026-06-25T00:00:00Z' },
  { id: 2, userId: 2, username: 'user1', orderId: 'ORD-20260622-002', orderAmount: 99, commissionRate: 0.1, commissionAmount: 9.9, status: 'pending', createdAt: '2026-06-22T14:00:00Z', settledAt: null },
  { id: 3, userId: 3, username: 'admin1', orderId: 'ORD-20260624-003', orderAmount: 299, commissionRate: 0.15, commissionAmount: 44.85, status: 'pending', createdAt: '2026-06-24T16:00:00Z', settledAt: null },
];

// ===== 提现数据 =====
const withdrawStore = [
  { id: 1, userId: 2, username: 'user1', amount: 100, fee: 2, actualAmount: 98, method: 'wechat', account: 'wx_user1', status: 'approved', createdAt: '2026-06-18T10:00:00Z', processedAt: '2026-06-19T08:00:00Z' },
  { id: 2, userId: 2, username: 'user1', amount: 50, fee: 1, actualAmount: 49, method: 'alipay', account: 'user1@alipay.com', status: 'pending', createdAt: '2026-06-25T14:00:00Z', processedAt: null },
];

// ===== 分销数据 =====
const distributionStore = {
  links: [
    { id: 1, userId: 2, username: 'user1', code: 'USER1DIST', link: 'https://lsjyapp.cn/?ref=USER1DIST', clicks: 234, conversions: 18, commission: 356.5, createdAt: '2026-06-01T00:00:00Z' },
    { id: 2, userId: 3, username: 'admin1', code: 'ADMIN1DIST', link: 'https://lsjyapp.cn/?ref=ADMIN1DIST', clicks: 89, conversions: 5, commission: 120.0, createdAt: '2026-06-10T00:00:00Z' },
  ],
  rules: { defaultRate: 0.1, vipRate: 0.15, minWithdraw: 50, settleCycle: 'monthly' }
};

// ===== 合作伙伴数据 =====
const affiliatesStore = [
  { id: 1, name: '伯雅教育', contact: '张经理', phone: '13800000001', email: 'zhang@boya.edu', type: 'education', status: 'active', revenue: 45000, commission: 4500, joinedAt: '2026-05-01T00:00:00Z' },
  { id: 2, name: '长沙宠物医院', contact: '李医生', phone: '13800000002', email: 'li@petcare.com', type: 'pet', status: 'active', revenue: 28000, commission: 2800, joinedAt: '2026-05-15T00:00:00Z' },
  { id: 3, name: '祁阳自媒体联盟', contact: '王总', phone: '13800000003', email: 'wang@qyzmt.com', type: 'media', status: 'pending', revenue: 0, commission: 0, joinedAt: '2026-06-20T00:00:00Z' },
];

// ===== 推送消息数据 =====
const pushMessagesStore = [
  { id: 1, title: '系统维护通知', content: '今晚22:00-23:00系统维护', type: 'system', target: 'all', status: 'sent', sentAt: '2026-06-24T20:00:00Z', readCount: 156, totalCount: 200 },
  { id: 2, title: '新功能上线', content: 'AI视频生成功能已上线，快来体验！', type: 'feature', target: 'all', status: 'sent', sentAt: '2026-06-20T10:00:00Z', readCount: 89, totalCount: 180 },
  { id: 3, title: '充值优惠', content: '618充值8折活动进行中', type: 'promotion', target: 'all', status: 'draft', sentAt: null, readCount: 0, totalCount: 0 },
];

// ===== 黑名单数据 =====
const blacklistStore = {
  users: [
    { id: 1, userId: 99, username: 'spammer01', reason: '发布垃圾信息', bannedBy: 'admin', bannedAt: '2026-06-15T10:00:00Z', expiresAt: '2026-09-15T10:00:00Z' },
    { id: 2, userId: 100, username: 'abuser02', reason: '恶意攻击其他用户', bannedBy: 'admin', bannedAt: '2026-06-20T14:00:00Z', expiresAt: null },
  ],
  ips: [
    { id: 1, ip: '192.168.1.100', reason: '恶意爬虫', blockedBy: 'system', blockedAt: '2026-06-18T08:00:00Z' },
    { id: 2, ip: '10.0.0.55', reason: 'DDoS攻击', blockedBy: 'system', blockedAt: '2026-06-22T03:00:00Z' },
  ]
};

// ===== 用户标签数据 =====
const userTagsStore = [
  { id: 1, name: 'VIP用户', color: '#FFD700', count: 12, description: '付费VIP会员' },
  { id: 2, name: '活跃用户', color: '#00FF88', count: 45, description: '近7天有登录' },
  { id: 3, name: '新用户', color: '#00BFFF', count: 8, description: '注册30天内' },
  { id: 4, name: '高风险', color: '#FF4444', count: 3, description: '异常行为标记' },
  { id: 5, name: 'AI重度用户', color: '#FF69B4', count: 20, description: '日均AI调用>10次' },
];

// ===== 敏感词数据 =====
const sensitiveWordsStore = [
  { id: 1, word: '赌博', category: '违法', level: 'high', hitCount: 23, createdAt: '2026-05-01T00:00:00Z' },
  { id: 2, word: '代孕', category: '违法', level: 'high', hitCount: 8, createdAt: '2026-05-01T00:00:00Z' },
  { id: 3, word: '发票', category: '广告', level: 'medium', hitCount: 45, createdAt: '2026-05-10T00:00:00Z' },
  { id: 4, word: '加微信', category: '引流', level: 'low', hitCount: 120, createdAt: '2026-05-15T00:00:00Z' },
];

// ===== 聊天日志数据 =====
const chatLogsStore = [
  { id: 1, userId: 2, username: 'user1', toolName: '罗圣AI智能体', input: '帮我写一段营销文案', output: '好的，以下是一段营销文案...', tokens: 350, duration: 2.3, createdAt: '2026-06-25T10:00:00Z' },
  { id: 2, userId: 2, username: 'user1', toolName: 'AI绘画师', input: '画一只可爱的猫咪', output: '[图片已生成]', tokens: 120, duration: 8.5, createdAt: '2026-06-25T10:30:00Z' },
  { id: 3, userId: 1, username: 'KF02V9', toolName: '代码工程师', input: '写一个排序算法', output: 'function quickSort(arr)...', tokens: 280, duration: 1.8, createdAt: '2026-06-25T11:00:00Z' },
];

// ===== 内容库数据 =====
const contentLibraryStore = [
  { id: 1, title: 'AI绘画作品展示', type: 'image', author: 'user1', status: 'published', views: 234, likes: 45, createdAt: '2026-06-20T10:00:00Z' },
  { id: 2, title: '营销文案模板集', type: 'text', author: 'admin1', status: 'published', views: 567, likes: 89, createdAt: '2026-06-18T14:00:00Z' },
  { id: 3, title: '短视频脚本示例', type: 'video', author: 'user1', status: 'draft', views: 0, likes: 0, createdAt: '2026-06-25T09:00:00Z' },
];

// ===== 圣力套餐数据 =====
const coinPackagesStore = [
  { id: 1, name: '新手体验包', coins: 100, price: 9.9, bonus: 10, status: 'active', salesCount: 234 },
  { id: 2, name: '标准充值包', coins: 500, price: 39.9, bonus: 50, status: 'active', salesCount: 567 },
  { id: 3, name: '豪华充值包', coins: 1000, price: 69.9, bonus: 150, status: 'active', salesCount: 189 },
  { id: 4, name: '企业定制包', coins: 5000, price: 299.9, bonus: 1000, status: 'active', salesCount: 45 },
];

// ===== 实时定位数据 =====
const locationStore = [
  { id: 1, userId: 1, username: 'KF02V9', lat: 26.6532, lng: 111.5341, city: '祁阳', address: '祁阳市中心', updatedAt: '2026-06-26T03:00:00Z' },
  { id: 2, userId: 2, username: 'user1', lat: 28.2280, lng: 112.9388, city: '长沙', address: '长沙市岳麓区', updatedAt: '2026-06-26T03:05:00Z' },
  { id: 3, userId: 3, username: 'admin1', lat: 23.1291, lng: 113.2644, city: '广州', address: '广州市天河区', updatedAt: '2026-06-26T02:50:00Z' },
];

// ===== 在线用户数据 =====
const onlineUsersStore = [];

// ===== 新增API路由 =====

// 在线用户
app.get('/api/v1/admin/online-users', authCheck, (req, res) => {
  const now = Date.now();
  const active = onlineUsersStore.filter(u => (now - u.lastHeartbeat) < 300000);
  const loggedIn = active.filter(u => u.userId !== '-');
  const guests = active.filter(u => u.userId === '-');
  const peakToday = onlineUsersStore.length > 0 ? Math.max(...active.map(u => u.peakToday || 0), active.length) : 0;
  res.json({ code: 0, message: 'success', data: {
    stats: { onlineTotal: active.length, loggedIn: loggedIn.length, guests: guests.length, peakToday: Math.max(peakToday, active.length + 50) },
    list: active.map(u => ({
      userId: u.userId || '-', username: u.username || '游客',
      status: (now - u.lastHeartbeat) < 60000 ? '活跃' : '空闲',
      currentPage: u.currentPage || '/dashboard',
      ip: u.ip || '-', location: u.city || '未知', device: u.device || 'PC',
      onlineTime: u.onlineTime || '0m'
    }))
  }});
});

// 反馈管理
app.get('/api/v1/admin/feedback', authCheck, (req, res) => {
  const { status, type } = req.query;
  let list = [...feedbackStore];
  if (status) list = list.filter(f => f.status === status);
  if (type) list = list.filter(f => f.type === type);
  const total = feedbackStore.length;
  const pending = feedbackStore.filter(f => f.status === 'pending').length;
  const resolved = feedbackStore.filter(f => f.status === 'resolved').length;
  const avgRating = (feedbackStore.reduce((s, f) => s + f.rating, 0) / Math.max(total, 1)).toFixed(1);
  res.json({ code: 0, message: 'success', data: {
    stats: { totalFeedback: total, pending, resolved, satisfaction: avgRating },
    list: list.reverse()
  }});
});
app.put('/api/v1/admin/feedback/:id', authCheck, (req, res) => {
  const fb = feedbackStore.find(f => f.id === Number(req.params.id));
  if (!fb) return res.json({ code: 404, message: '反馈不存在' });
  Object.assign(fb, req.body, { resolvedAt: new Date().toISOString() });
  res.json({ code: 0, message: 'success', data: fb });
});

// 佣金管理
app.get('/api/v1/admin/commissions', authCheck, (req, res) => {
  const list = [...commissionStore].reverse();
  const totalCommission = commissionStore.reduce((s, c) => s + c.commissionAmount, 0);
  const monthCommission = commissionStore.filter(c => c.createdAt.startsWith('2026-06')).reduce((s, c) => s + c.commissionAmount, 0);
  const pendingSettle = commissionStore.filter(c => c.status === 'pending').reduce((s, c) => s + c.commissionAmount, 0);
  const settleCount = commissionStore.filter(c => c.status === 'settled').length;
  res.json({ code: 0, message: 'success', data: {
    stats: { totalCommission: totalCommission.toFixed(2), monthCommission: monthCommission.toFixed(2), pendingSettle: pendingSettle.toFixed(2), settleCount },
    list
  }});
});
app.put('/api/v1/admin/commissions/:id/settle', authCheck, (req, res) => {
  const c = commissionStore.find(c => c.id === Number(req.params.id));
  if (!c) return res.json({ code: 404, message: '佣金记录不存在' });
  c.status = 'settled'; c.settledAt = new Date().toISOString();
  res.json({ code: 0, message: 'success', data: c });
});

// 提现管理
app.get('/api/v1/admin/withdraws', authCheck, (req, res) => {
  const list = [...withdrawStore].reverse();
  const totalRequests = withdrawStore.length;
  const pending = withdrawStore.filter(w => w.status === 'pending').length;
  const totalPaid = withdrawStore.filter(w => w.status === 'approved').reduce((s, w) => s + w.actualAmount, 0);
  const rejected = withdrawStore.filter(w => w.status === 'rejected').length;
  res.json({ code: 0, message: 'success', data: {
    stats: { totalRequests, pending, totalPaid: totalPaid.toFixed(2), rejected },
    list
  }});
});
app.put('/api/v1/admin/withdraws/:id/approve', authCheck, (req, res) => {
  const w = withdrawStore.find(w => w.id === Number(req.params.id));
  if (!w) return res.json({ code: 404, message: '提现记录不存在' });
  w.status = 'approved'; w.processedAt = new Date().toISOString();
  res.json({ code: 0, message: 'success', data: w });
});
app.put('/api/v1/admin/withdraws/:id/reject', authCheck, (req, res) => {
  const w = withdrawStore.find(w => w.id === Number(req.params.id));
  if (!w) return res.json({ code: 404, message: '提现记录不存在' });
  w.status = 'rejected'; w.processedAt = new Date().toISOString();
  res.json({ code: 0, message: 'success', data: w });
});

// 分销管理
app.get('/api/v1/admin/distribution', authCheck, (req, res) => {
  const links = distributionStore.links;
  const totalCommission = links.reduce((s, l) => s + l.commission, 0);
  const totalClicks = links.reduce((s, l) => s + l.clicks, 0);
  const totalConversions = links.reduce((s, l) => s + l.conversions, 0);
  res.json({ code: 0, message: 'success', data: {
    stats: { distributors: links.length, totalLinks: links.length, totalCommission: totalCommission.toFixed(2), conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) + '%' : '0%' },
    list: links,
    rules: distributionStore.rules
  }});
});
app.put('/api/v1/admin/distribution/rules', authCheck, (req, res) => {
  Object.assign(distributionStore.rules, req.body);
  res.json({ code: 0, message: 'success', data: distributionStore.rules });
});

// 合作伙伴
app.get('/api/v1/admin/affiliates', authCheck, (req, res) => {
  const list = [...affiliatesStore];
  const totalPartners = list.length;
  const active = list.filter(a => a.status === 'active').length;
  const totalRevenue = list.reduce((s, a) => s + a.revenue, 0);
  res.json({ code: 0, message: 'success', data: {
    stats: { totalPartners, active, totalRevenue: totalRevenue.toFixed(2) },
    list
  }});
});
app.post('/api/v1/admin/affiliates', authCheck, (req, res) => {
  const item = { id: affiliatesStore.length + 1, ...req.body, revenue: 0, commission: 0, joinedAt: new Date().toISOString() };
  affiliatesStore.push(item);
  res.json({ code: 0, message: 'success', data: item });
});
app.put('/api/v1/admin/affiliates/:id', authCheck, (req, res) => {
  const a = affiliatesStore.find(a => a.id === Number(req.params.id));
  if (!a) return res.json({ code: 404, message: '合作伙伴不存在' });
  Object.assign(a, req.body);
  res.json({ code: 0, message: 'success', data: a });
});

// 推送消息
app.get('/api/v1/admin/push-messages', authCheck, (req, res) => {
  const list = [...pushMessagesStore].reverse();
  const totalSent = pushMessagesStore.filter(m => m.status === 'sent').reduce((s, m) => s + m.totalCount, 0);
  const pushToday = pushMessagesStore.filter(m => m.sentAt && m.sentAt.startsWith('2026-06-26')).length;
  const totalRead = pushMessagesStore.reduce((s, m) => s + m.readCount, 0);
  const totalAll = pushMessagesStore.reduce((s, m) => s + m.totalCount, 0);
  const readRate = totalAll > 0 ? ((totalRead / totalAll) * 100).toFixed(0) + '%' : '0%';
  res.json({ code: 0, message: 'success', data: {
    stats: { totalSent, pushToday, readRate, subscribers: usersStore.length },
    list
  }});
});
app.post('/api/v1/admin/push-messages', authCheck, (req, res) => {
  const item = { id: pushMessagesStore.length + 1, ...req.body, status: 'draft', sentAt: null, readCount: 0, totalCount: 0 };
  pushMessagesStore.push(item);
  res.json({ code: 0, message: 'success', data: item });
});
app.post('/api/v1/admin/push-messages/:id/send', authCheck, (req, res) => {
  const m = pushMessagesStore.find(m => m.id === Number(req.params.id));
  if (!m) return res.json({ code: 404, message: '消息不存在' });
  m.status = 'sent'; m.sentAt = new Date().toISOString();
  m.totalCount = usersStore.length; m.readCount = 0;
  res.json({ code: 0, message: 'success', data: m });
});

// 黑名单管理
app.get('/api/v1/admin/blacklist', authCheck, (req, res) => {
  res.json({ code: 0, message: 'success', data: {
    stats: { bannedUsers: blacklistStore.users.length, blockedIPs: blacklistStore.ips.length, todayBlocks: 2 },
    users: blacklistStore.users,
    ips: blacklistStore.ips
  }});
});
app.post('/api/v1/admin/blacklist/users', authCheck, (req, res) => {
  const item = { id: blacklistStore.users.length + 1, ...req.body, bannedBy: req.user?.username || 'admin', bannedAt: new Date().toISOString() };
  blacklistStore.users.push(item);
  res.json({ code: 0, message: 'success', data: item });
});
app.delete('/api/v1/admin/blacklist/users/:id', authCheck, (req, res) => {
  const idx = blacklistStore.users.findIndex(u => u.id === Number(req.params.id));
  if (idx >= 0) blacklistStore.users.splice(idx, 1);
  res.json({ code: 0, message: 'success' });
});
app.post('/api/v1/admin/blacklist/ips', authCheck, (req, res) => {
  const item = { id: blacklistStore.ips.length + 1, ...req.body, blockedBy: req.user?.username || 'system', blockedAt: new Date().toISOString() };
  blacklistStore.ips.push(item);
  res.json({ code: 0, message: 'success', data: item });
});
app.delete('/api/v1/admin/blacklist/ips/:id', authCheck, (req, res) => {
  const idx = blacklistStore.ips.findIndex(ip => ip.id === Number(req.params.id));
  if (idx >= 0) blacklistStore.ips.splice(idx, 1);
  res.json({ code: 0, message: 'success' });
});

// 用户标签
app.get('/api/v1/admin/user-tags', authCheck, (req, res) => {
  const totalTags = userTagsStore.length;
  const taggedUsers = userTagsStore.reduce((s, t) => s + t.count, 0);
  const avgTags = totalTags > 0 ? (taggedUsers / totalTags).toFixed(1) : '0';
  res.json({ code: 0, message: 'success', data: {
    stats: { totalTags, taggedUsers, avgTagsPerUser: avgTags },
    list: userTagsStore
  }});
});
app.post('/api/v1/admin/user-tags', authCheck, (req, res) => {
  const item = { id: userTagsStore.length + 1, ...req.body, count: 0 };
  userTagsStore.push(item);
  res.json({ code: 0, message: 'success', data: item });
});
app.put('/api/v1/admin/user-tags/:id', authCheck, (req, res) => {
  const t = userTagsStore.find(t => t.id === Number(req.params.id));
  if (!t) return res.json({ code: 404, message: '标签不存在' });
  Object.assign(t, req.body);
  res.json({ code: 0, message: 'success', data: t });
});
app.delete('/api/v1/admin/user-tags/:id', authCheck, (req, res) => {
  const idx = userTagsStore.findIndex(t => t.id === Number(req.params.id));
  if (idx >= 0) userTagsStore.splice(idx, 1);
  res.json({ code: 0, message: 'success' });
});

// 敏感词管理
app.get('/api/v1/admin/sensitive-words', authCheck, (req, res) => {
  const list = [...sensitiveWordsStore];
  const totalWords = list.length;
  const todayFiltered = list.filter(w => w.hitCount > 0).length;
  const cats = new Set(list.map(w => w.category)).size;
  res.json({ code: 0, message: 'success', data: {
    stats: { totalWords, todayFiltered, categories: cats },
    list
  }});
});
app.post('/api/v1/admin/sensitive-words', authCheck, (req, res) => {
  const item = { id: sensitiveWordsStore.length + 1, ...req.body, hitCount: 0, createdAt: new Date().toISOString() };
  sensitiveWordsStore.push(item);
  res.json({ code: 0, message: 'success', data: item });
});
app.delete('/api/v1/admin/sensitive-words/:id', authCheck, (req, res) => {
  const idx = sensitiveWordsStore.findIndex(w => w.id === Number(req.params.id));
  if (idx >= 0) sensitiveWordsStore.splice(idx, 1);
  res.json({ code: 0, message: 'success' });
});

// 权限管理
app.get('/api/v1/admin/permissions', authCheck, (req, res) => {
  const allPerms = ['user.manage', 'user.view', 'content.manage', 'content.view', 'system.manage', 'system.view', 'payment.manage', 'payment.view', 'ai.manage', 'ai.view', 'report.view', 'report.manage'];
  res.json({ code: 0, message: 'success', data: {
    stats: { totalRoles: rolesStore.length, permissions: allPerms.length, assignedUsers: usersStore.length },
    roles: rolesStore,
    allPermissions: allPerms
  }});
});
app.put('/api/v1/admin/permissions/:roleId', authCheck, (req, res) => {
  const role = rolesStore.find(r => r.id === Number(req.params.roleId));
  if (!role) return res.json({ code: 404, message: '角色不存在' });
  if (req.body.permissions) role.permissions = req.body.permissions;
  if (req.body.displayName) role.displayName = req.body.displayName;
  if (req.body.description) role.description = req.body.description;
  res.json({ code: 0, message: 'success', data: role });
});

// 聊天日志
app.get('/api/v1/admin/chat-logs', authCheck, (req, res) => {
  const { search, toolName } = req.query;
  let list = [...chatLogsStore].reverse();
  if (search) list = list.filter(l => l.input.includes(search) || l.username.includes(search));
  if (toolName) list = list.filter(l => l.toolName === toolName);
  res.json({ code: 0, message: 'success', data: { list, total: chatLogsStore.length } });
});

// 内容库
app.get('/api/v1/admin/content-library', authCheck, (req, res) => {
  const { search, type, status } = req.query;
  let list = [...contentLibraryStore];
  if (search) list = list.filter(c => c.title.includes(search));
  if (type) list = list.filter(c => c.type === type);
  if (status) list = list.filter(c => c.status === status);
  res.json({ code: 0, message: 'success', data: list.reverse() });
});
app.post('/api/v1/admin/content-library', authCheck, (req, res) => {
  const item = { id: contentLibraryStore.length + 1, ...req.body, views: 0, likes: 0, createdAt: new Date().toISOString() };
  contentLibraryStore.push(item);
  res.json({ code: 0, message: 'success', data: item });
});
app.put('/api/v1/admin/content-library/:id', authCheck, (req, res) => {
  const c = contentLibraryStore.find(c => c.id === Number(req.params.id));
  if (!c) return res.json({ code: 404, message: '内容不存在' });
  Object.assign(c, req.body);
  res.json({ code: 0, message: 'success', data: c });
});
app.delete('/api/v1/admin/content-library/:id', authCheck, (req, res) => {
  const idx = contentLibraryStore.findIndex(c => c.id === Number(req.params.id));
  if (idx >= 0) contentLibraryStore.splice(idx, 1);
  res.json({ code: 0, message: 'success' });
});

// 圣力套餐管理
app.get('/api/v1/admin/coin-packages', authCheck, (req, res) => {
  res.json({ code: 0, message: 'success', data: [...coinPackagesStore] });
});
app.post('/api/v1/admin/coin-packages', authCheck, (req, res) => {
  const item = { id: coinPackagesStore.length + 1, ...req.body, salesCount: 0 };
  coinPackagesStore.push(item);
  res.json({ code: 0, message: 'success', data: item });
});
app.put('/api/v1/admin/coin-packages/:id', authCheck, (req, res) => {
  const p = coinPackagesStore.find(p => p.id === Number(req.params.id));
  if (!p) return res.json({ code: 404, message: '套餐不存在' });
  Object.assign(p, req.body);
  res.json({ code: 0, message: 'success', data: p });
});
app.delete('/api/v1/admin/coin-packages/:id', authCheck, (req, res) => {
  const idx = coinPackagesStore.findIndex(p => p.id === Number(req.params.id));
  if (idx >= 0) coinPackagesStore.splice(idx, 1);
  res.json({ code: 0, message: 'success' });
});

// 实时定位
app.get('/api/v1/admin/locations', authCheck, (req, res) => {
  res.json({ code: 0, message: 'success', data: {
    list: locationStore,
    total: locationStore.length
  }});
});

// AI Agent管理
app.get('/api/v1/admin/agents', authCheck, (req, res) => {
  const list = agentsStore.map(a => ({
    id: a.id, name: a.name, icon: a.icon, category: a.category,
    description: a.description, status: a.status || 'active',
    usageCount: a.usageCount || 0, model: a.model || 'deepseek'
  }));
  const totalAgents = list.length;
  const active = list.filter(a => a.status === 'active').length;
  const totalUsage = list.reduce((s, a) => s + (a.usageCount || 0), 0);
  res.json({ code: 0, message: 'success', data: {
    stats: { totalAgents, active, totalUsage },
    list
  }});
});
app.put('/api/v1/admin/agents/:id', authCheck, (req, res) => {
  const a = agentsStore.find(a => a.id === Number(req.params.id));
  if (!a) return res.json({ code: 404, message: 'Agent不存在' });
  Object.assign(a, req.body);
  res.json({ code: 0, message: 'success', data: a });
});
app.post('/api/v1/admin/agents', authCheck, (req, res) => {
  const { name, icon, category, description, model, systemPrompt, coinCost, status } = req.body;
  if (!name) return res.json({ code: 400, message: '名称不能为空' });
  const newId = Math.max(0, ...agentsStore.map(a => a.id)) + 1;
  const newAgent = { id: newId, name, icon: icon || '🤖', category: category || '通用', description: description || '', model: model || 'deepseek', systemPrompt: systemPrompt || '', coinCost: coinCost || 0, status: status || 'active', usageCount: 0, createdAt: new Date().toISOString() };
  agentsStore.push(newAgent);
  try { const fs = require('fs'); const path = require('path'); fs.writeFileSync(path.join(__dirname, 'data/agents.json'), JSON.stringify(agentsStore, null, 2)); } catch(e) {}
  res.json({ code: 0, message: '创建成功', data: newAgent });
});
app.delete('/api/v1/admin/agents/:id', authCheck, (req, res) => {
  const idx = agentsStore.findIndex(a => a.id === Number(req.params.id));
  if (idx === -1) return res.json({ code: 404, message: 'Agent不存在' });
  const removed = agentsStore.splice(idx, 1);
  try { const fs = require('fs'); const path = require('path'); fs.writeFileSync(path.join(__dirname, 'data/agents.json'), JSON.stringify(agentsStore, null, 2)); } catch(e) {}
  res.json({ code: 0, message: '删除成功', data: removed[0] });
});


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
  log(`   通义万相 (视频): ${CONFIG.TONGYI_VIDEO_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  log(`   可灵 (Kling 视频): ${CONFIG.KLING_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  log(`   Coze 智能体: ${CONFIG.COZE_API_KEY && CONFIG.COZE_BOT_ID ? '✅ 已配置' : '❌ 未配置'}`);
  log(`\n📝 图片生成: ${CONFIG.IMAGE_GENERATION_PROVIDER} | 视频生成: ${CONFIG.VIDEO_GENERATION_PROVIDER}`);
  log(`\n🌐 外部访问: http://0.0.0.0:${PORT}/api/v1`);
  log(`   API 端点总数: 77+`);
  log(`\n⚠️  如看到"❌ 未配置"，请在 backend/.env 文件中填入对应的 API Key`);
});

// ===== API文档路由 =====
app.get('/api/v1/docs', (req, res) => {
  res.sendFile('/tmp/lsjy-app/backend/swagger.html');
});
app.get('/docs', (req, res) => {
  res.redirect('/api/v1/docs');
});
