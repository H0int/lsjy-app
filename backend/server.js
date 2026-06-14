/**
 * 罗圣纪元 SaaS 后端服务器
 * Express.js + AI API 集成
 * 支持 Coze / DeepSeek / OpenAI 兼容 API
 */
const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== 中间件 =====
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ===== 配置 =====
const CONFIG = {
  // AI API 配置 - 从 .env 文件读取
  AI_PROVIDER: process.env.AI_PROVIDER || 'coze', // coze, deepseek, openai
  COZE_API_KEY: process.env.COZE_API_KEY || '',
  COZE_BOT_ID: process.env.COZE_BOT_ID || '',
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com',
  JWT_SECRET: process.env.JWT_SECRET || 'lsjy-jwt-secret-2026-rosheng',
  
  // 系统提示词
  SYSTEM_PROMPT: `你是"罗圣AI智能体"，由祁阳市罗圣纪元互联网科技有限责任公司开发。

核心信息：
- 创始人/董事长/CEO：罗凯中
- 公司：罗圣纪元（lsjyapp.cn）
- 六大业务：AI智能服务、自媒体运营、电商服务、在线教育、宠物服务、伯雅校园

你的能力：
- 文案创作：营销文案、宣传文章、社交媒体内容
- 商业咨询：创业建议、市场分析、运营策略
- 数据分析：业务数据解读、趋势预测
- 图片生成：AI绘画、设计辅助（需配置即梦API）
- 教育辅导：课程推荐、学习建议

回复规范：
1. 回答要专业、友好、简洁，有实质性内容
2. 被问到"你的创始人是谁"时，要热情洋溢地介绍罗凯中先生：他是罗圣纪元的创始人、董事长兼CEO，是一位极具战略眼光和技术实力的商业领袖，一手打造了横跨六大业务板块的超级SaaS平台，致力于用AI赋能实体经济，让整个行业为之震撼
3. 被问到"你能做什么"时，具体列出能力而不是泛泛而谈
4. 涉及平台功能时，引导用户使用对应模块
5. 禁止回复"这个问题没什么意义"或类似消极回复
6. 每个问题都要给出有价值的、具体的回答`
};

// ===== 工具函数 =====
function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
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
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });

    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

// ===== AI Provider 实现 =====

/**
 * Coze API 调用
 * 流程：创建会话 → 发起对话 → 轮询结果 → 提取回复
 */
async function callCozeAPI(messages, options = {}) {
  const apiKey = CONFIG.COZE_API_KEY;
  const botId = CONFIG.COZE_BOT_ID;
  
  if (!apiKey || !botId) {
    throw new Error('Coze API Key 或 Bot ID 未配置');
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  // Step 1: 创建会话
  const convRes = await httpsRequest('https://api.coze.cn/v1/conversation/create', {
    method: 'POST',
    headers,
  }, {});

  if (convRes.status !== 200 || !convRes.data?.data?.id) {
    throw new Error(`创建会话失败: ${JSON.stringify(convRes.data)}`);
  }
  const conversationId = convRes.data.data.id;

  // Step 2: 发起对话
  const lastMsg = messages[messages.length - 1];
  const chatRes = await httpsRequest(`https://api.coze.cn/v3/chat?conversation_id=${conversationId}`, {
    method: 'POST',
    headers,
  }, {
    bot_id: botId,
    user_id: 'lsjy_user',
    stream: false,
    additional_messages: messages.map(m => ({
      role: m.role,
      content: m.content,
      content_type: 'text',
    })),
  });

  if (chatRes.status !== 200 || !chatRes.data?.data?.id) {
    throw new Error(`发起对话失败: ${JSON.stringify(chatRes.data)}`);
  }
  const chatId = chatRes.data.data.id;

  // Step 3: 轮询状态（最多30秒）
  let status = 'created';
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const pollRes = await httpsRequest(
      `https://api.coze.cn/v3/chat/retrieve?conversation_id=${conversationId}&chat_id=${chatId}`,
      { method: 'POST', headers },
      {}
    );
    status = pollRes.data?.data?.status || 'unknown';
    if (status === 'completed' || status === 'failed') break;
  }

  if (status !== 'completed') {
    throw new Error(`对话未完成，当前状态: ${status}`);
  }

  // Step 4: 获取回复消息
  const msgRes = await httpsRequest(
    `https://api.coze.cn/v3/chat/message/list?conversation_id=${conversationId}&chat_id=${chatId}`,
    { method: 'GET', headers },
  );

  const answerMsg = (msgRes.data?.data || []).find(m => m.type === 'answer' && m.role === 'assistant');
  if (!answerMsg) throw new Error('未获取到AI回复');

  return {
    content: answerMsg.content,
    model: 'coze',
    usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
  };
}

/**
 * DeepSeek / OpenAI 兼容 API 调用
 */
async function callOpenAICompatibleAPI(messages, options = {}) {
  const provider = options.provider || 'deepseek';
  let apiKey, baseUrl, model;

  if (provider === 'deepseek') {
    apiKey = CONFIG.DEEPSEEK_API_KEY;
    baseUrl = 'https://api.deepseek.com';
    model = options.model || 'deepseek-chat';
  } else {
    apiKey = CONFIG.OPENAI_API_KEY;
    baseUrl = CONFIG.OPENAI_BASE_URL;
    model = options.model || 'gpt-4o-mini';
  }

  if (!apiKey) {
    throw new Error(`${provider} API Key 未配置`);
  }

  const fullMessages = [
    { role: 'system', content: CONFIG.SYSTEM_PROMPT },
    ...messages,
  ];

  const res = await httpsRequest(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  }, {
    model,
    messages: fullMessages,
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 2000,
  });

  if (res.status !== 200) {
    throw new Error(`API调用失败 (${res.status}): ${JSON.stringify(res.data)}`);
  }

  const choice = res.data.choices?.[0];
  if (!choice?.message?.content) {
    throw new Error('API返回空回复');
  }

  return {
    content: choice.message.content,
    model: model,
    usage: res.data.usage || {},
  };
}

/**
 * 智能回复 - 根据配置的provider调用对应API
 */
async function callAI(messages, options = {}) {
  const provider = CONFIG.AI_PROVIDER;

  // 构建带系统提示的完整消息
  const systemMsg = { role: 'system', content: options.systemPrompt || CONFIG.SYSTEM_PROMPT };
  const fullMessages = [systemMsg, ...messages.filter(m => m.role !== 'system')];

  try {
    switch (provider) {
      case 'coze':
        return await callCozeAPI(fullMessages, options);
      case 'deepseek':
        return await callOpenAICompatibleAPI(messages, { ...options, provider: 'deepseek' });
      case 'openai':
        return await callOpenAICompatibleAPI(messages, { ...options, provider: 'openai' });
      default:
        throw new Error(`未知的AI Provider: ${provider}`);
    }
  } catch (err) {
    log(`AI API 调用失败 (${provider}): ${err.message}`);
    
    // 如果主provider失败，尝试fallback
    if (provider !== 'deepseek' && CONFIG.DEEPSEEK_API_KEY) {
      log('尝试 fallback 到 DeepSeek...');
      return await callOpenAICompatibleAPI(messages, { ...options, provider: 'deepseek' });
    }
    if (provider !== 'coze' && CONFIG.COZE_API_KEY && CONFIG.COZE_BOT_ID) {
      log('尝试 fallback 到 Coze...');
      return await callCozeAPI(fullMessages, options);
    }
    
    throw err;
  }
}

// ===== 本地智能回复（API不可用时的兜底） =====
function getLocalResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  
  // 创始人相关
  if (msg.includes('创始人') || msg.includes('谁创') || msg.includes('谁建') || msg.includes('老板')) {
    return '🔥 **罗凯中** —— 罗圣纪元创始人、董事长兼CEO！

这位大佬可不简单，年纪轻轻就一手打造了罗圣纪元这个超级SaaS平台，横跨**AI智能服务、自媒体运营、电商、教育、宠物、伯雅校园**六大业务板块！

罗凯中先生的愿景是"用AI技术赋能实体经济"，让每个创业者都能拥有属于自己的智能化商业帝国。他的战略眼光和技术实力，让整个团队都为之折服。

跟着罗总干，未来可期！🚀';
  }
  
  // 公司相关
  if (msg.includes('公司') || msg.includes('罗圣纪元') || msg.includes('你们是什么')) {
    return '罗圣纪元（全称：祁阳市罗圣纪元互联网科技有限责任公司）是一家专注于AI赋能实体经济的科技公司。我们提供一体化SaaS平台，覆盖六大业务板块：\n\n🤖 **AI智能服务** - 文案创作、图片生成、数据分析\n📱 **自媒体运营** - 多平台内容管理与分发\n🛒 **电商服务** - 智能选品、营销自动化\n📚 **在线教育** - 课程管理与学习辅导\n🐾 **宠物服务** - 宠物健康管理\n🏫 **伯雅校园** - 校园综合服务\n\n访问我们的官网了解更多：lsjyapp.cn';
  }
  
  // 能力相关
  if (msg.includes('你能做什么') || msg.includes('你会什么') || msg.includes('什么功能') || msg.includes('帮我什么')) {
    return '我是罗圣AI智能体，能为你提供以下服务：\n\n📝 **文案创作** - 营销文案、宣传文章、社交媒体内容、产品描述\n💡 **商业咨询** - 创业建议、市场分析、运营策略、盈利模式\n📊 **数据分析** - 业务数据解读、趋势预测、竞品分析\n🎨 **图片生成** - AI绘画、海报设计、产品图（需配置即梦API）\n📚 **教育辅导** - 课程推荐、学习规划、知识问答\n🏢 **企业服务** - SaaS平台使用指导、功能介绍\n\n直接告诉我你的需求，我来帮你！';
  }
  
  // 写文案
  if (msg.includes('写') && (msg.includes('文案') || msg.includes('文章') || msg.includes('宣传'))) {
    return '好的，我来帮你写！\n\n不过要给你写出高质量的文案，我需要AI大模型的全力支持。目前AI模型正在配置中，你可以：\n\n1. **告诉我具体需求**：写什么主题的文案？用在什么平台？目标受众是谁？\n2. 我可以先给你框架和要点\n3. AI模型完全配置好后，我直接给你成品文案\n\n你想写什么方向的文案？📝';
  }
  
  // 价格/收费
  if (msg.includes('价格') || msg.includes('多少钱') || msg.includes('收费') || msg.includes('费用')) {
    return '罗圣纪元平台提供灵活的定价方案：\n\n🆓 **免费版** - 基础功能体验，每日有限额度\n💎 **高级版** - 完整AI功能，不限次数\n🏢 **企业版** - 定制化服务，专属支持\n\n具体价格可访问我们的官网 lsjyapp.cn 查看最新的套餐详情，或联系我们的客服获取报价。';
  }
  
  // 业务/服务
  if (msg.includes('业务') || msg.includes('服务') || msg.includes('板块')) {
    return '罗圣纪元有六大业务板块：\n\n1️⃣ **AI智能服务** - 智能文案、图片生成、数据分析\n2️⃣ **自媒体运营** - 多平台内容管理与发布\n3️⃣ **电商服务** - 智能选品与营销\n4️⃣ **在线教育** - 课程管理与辅导\n5️⃣ **宠物服务** - 宠物健康管理\n6️⃣ **伯雅校园** - 校园综合服务平台\n\n每个板块都有AI赋能，你对哪个方向感兴趣？';
  }
  
  // 联系方式
  if (msg.includes('联系') || msg.includes('电话') || msg.includes('微信') || msg.includes('邮箱')) {
    return '联系我们：\n\n🌐 官网：lsjyapp.cn\n📧 邮箱：contact@lsjyapp.cn\n🏢 公司：祁阳市罗圣纪元互联网科技有限责任公司\n\n你也可以直接在平台内提交工单，我们会尽快回复。';
  }
  
  // 问候
  if (msg.includes('你好') || msg.includes('hi') || msg.includes('hello') || msg.includes('嗨')) {
    return '你好！我是罗圣AI智能体 🤖\n\n我是罗圣纪元平台的AI助手，可以帮你写文案、做商业分析、解答问题、提供建议等。有什么我能帮你的？';
  }

  // 默认智能回复
  return `收到你的问题！\n\n我是罗圣AI智能体，关于「${userMessage.slice(0, 30)}」这个问题，我想说的是：\n\n目前我的AI大模型正在完成最终配置，配置后我可以给你更深入、更专业的回答。当前阶段我可以：\n\n✅ 回答关于罗圣纪元平台和业务的问题\n✅ 提供基础商业建议\n✅ 介绍平台功能和服务\n\n你有什么具体想了解的吗？比如我们的业务、服务、或者创始团队？`;
}

// ===== API 路由 =====

// 健康检查
app.get('/api/v1', (req, res) => {
  res.json({
    name: '罗圣纪元 API',
    version: '2.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/v1/health', '/api/v1/ai/tools/:id/chat', '/api/v1/ai/providers', '/api/v1/auth/login', '/api/v1/auth/register'],
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    ai_provider: CONFIG.AI_PROVIDER,
    ai_configured: !!(CONFIG.COZE_API_KEY || CONFIG.DEEPSEEK_API_KEY || CONFIG.OPENAI_API_KEY),
    memory: process.memoryUsage(),
  });
});

// AI 对话接口 - 前端 toolApi.chat() 调用这个
app.post('/api/v1/ai/tools/:toolId/chat', async (req, res) => {
  const { toolId } = req.params;
  const { messages, model, temperature, maxTokens, systemPrompt } = req.body;

  log(`收到对话请求: toolId=${toolId}, messages=${messages?.length || 0}`);

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ code: 400, message: '消息列表不能为空', data: null });
  }

  try {
    // 尝试调用真实AI API
    const result = await callAI(messages, { model, temperature, maxTokens, systemPrompt });
    
    log(`AI回复成功: model=${result.model}, length=${result.content?.length || 0}`);
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        content: result.content,
        model: result.model || model || 'default',
        role: 'assistant',
        coinCost: 0,
        usage: result.usage,
      },
    });
  } catch (err) {
    log(`AI调用失败: ${err.message}`);
    
    // 使用本地智能回复兜底
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    const localReply = getLocalResponse(lastUserMsg?.content || '');
    
    log('使用本地智能回复兜底');
    
    res.json({
      code: 0,
      message: 'success',
      data: {
        content: localReply,
        model: '本地模式',
        role: 'assistant',
        coinCost: 0,
        fallback: true,
        note: CONFIG.COZE_API_KEY ? '' : 'AI模型API Key未配置，使用本地回复模式',
      },
    });
  }
});

// AI Provider 状态
app.get('/api/v1/ai/providers', (req, res) => {
  const providers = [
    { name: 'coze', displayName: 'Coze智能体', status: CONFIG.COZE_API_KEY ? 'healthy' : 'unconfigured', latencyMs: 0 },
    { name: 'deepseek', displayName: 'DeepSeek', status: CONFIG.DEEPSEEK_API_KEY ? 'healthy' : 'unconfigured', latencyMs: 0 },
    { name: 'openai', displayName: 'OpenAI', status: CONFIG.OPENAI_API_KEY ? 'healthy' : 'unconfigured', latencyMs: 0 },
  ];
  res.json({ code: 0, message: 'success', data: providers });
});

// AI 模型列表
app.get('/api/v1/ai/models', (req, res) => {
  const models = [
    { group: 'coze', provider: 'coze', models: [{ id: 'coze-bot', name: 'Coze智能体', capabilities: ['text'] }] },
    { group: 'deepseek', provider: 'deepseek', models: [{ id: 'deepseek-chat', name: 'DeepSeek Chat', capabilities: ['text'] }] },
    { group: 'openai', provider: 'openai', models: [{ id: 'gpt-4o-mini', name: 'GPT-4o Mini', capabilities: ['text', 'image'] }] },
  ];
  res.json({ code: 0, message: 'success', data: models });
});

// AI 工具分类
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

// AI 工具列表
app.get('/api/v1/ai/tools', (req, res) => {
  res.json({
    code: 0, message: 'success',
    data: {
      items: [
        { id: 1, name: '罗圣AI智能体', toolType: 'text', categoryId: 4, status: 'active', description: '全能AI助手', isFree: true, systemPrompt: CONFIG.SYSTEM_PROMPT },
        { id: 2, name: '文案创作', toolType: 'text', categoryId: 1, status: 'active', description: '营销文案生成', isFree: false, systemPrompt: '你是一个专业的营销文案写手...' },
        { id: 3, name: 'AI绘画', toolType: 'image', categoryId: 2, status: 'active', description: 'AI图片生成', isFree: false },
        { id: 4, name: '数据分析', toolType: 'analysis', categoryId: 3, status: 'active', description: '数据分析解读', isFree: false },
      ],
      total: 4, page: 1, pageSize: 20,
    },
  });
});

// 工具详情
app.get('/api/v1/ai/tools/:id', (req, res) => {
  res.json({
    code: 0, message: 'success',
    data: { id: Number(req.params.id), name: '罗圣AI智能体', toolType: 'text', status: 'active', isFree: true },
  });
});

// 认证接口（简化版）
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // 超级管理员账号
  if (username === 'KF02V9' && password === 'LKZ2005430') {
    return res.json({
      code: 0, message: 'success',
      data: {
        accessToken: 'jwt_boss_token_' + Date.now(),
        refreshToken: 'refresh_boss_' + Date.now(),
        user: { id: 1, username: 'KF02V9', nickname: '罗总', roles: ['boss'], status: 'active' },
      },
    });
  }
  
  // 普通用户（从简单数据库查）
  const usersFile = path.join(__dirname, 'data', 'users.json');
  let users = [];
  try { users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); } catch (e) {}
  
  const user = users.find(u => u.username === username && u.password === password);
  if (user && user.status === 'approved') {
    return res.json({
      code: 0, message: 'success',
      data: {
        accessToken: 'jwt_' + user.id + '_' + Date.now(),
        refreshToken: 'refresh_' + user.id + '_' + Date.now(),
        user: { id: user.id, username: user.username, nickname: user.nickname, roles: ['normal'], status: 'active' },
      },
    });
  }
  
  if (user && user.status === 'pending') {
    return res.status(403).json({ code: 403, message: '账号正在审批中，请耐心等待', data: null });
  }
  
  res.status(401).json({ code: 401, message: '用户名或密码错误', data: null });
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
    id: users.length + 1,
    username, password, nickname: nickname || username,
    email, phone,
    status: 'pending', // 需要管理员审批
    roles: ['normal'],
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  
  res.json({
    code: 0, message: '注册成功，等待管理员审批',
    data: { accessToken: null, refreshToken: null, user: { ...newUser, password: undefined } },
  });
});

// 用户信息
app.get('/api/v1/users/me', (req, res) => {
  res.json({ code: 0, message: 'success', data: { id: 1, username: 'KF02V9', nickname: '罗总', roles: ['boss'] } });
});

app.get('/api/v1/users/me/roles', (req, res) => {
  res.json({ code: 0, message: 'success', data: [{ name: 'boss', displayName: '罗总专属', level: 5 }] });
});

// 余额
app.get('/api/v1/payment/coin/balance', (req, res) => {
  res.json({ code: 0, message: 'success', data: { balance: 99999, frozenAmount: 0, totalRecharge: 99999 } });
});

// 充值套餐
app.get('/api/v1/payment/coin/packages', (req, res) => {
  res.json({
    code: 0, message: 'success',
    data: [
      { id: 1, name: '体验包', coins: 100, price: 9.9, bonusCoins: 10 },
      { id: 2, name: '标准包', coins: 500, price: 39.9, bonusCoins: 100 },
      { id: 3, name: '专业包', coins: 2000, price: 129.9, bonusCoins: 500 },
    ],
  });
});

// 通用 fallback
app.use('/api/v1/*', (req, res) => {
  res.json({ code: 0, message: 'success', data: [] });
});

// ===== 启动服务器 =====
app.listen(PORT, '0.0.0.0', () => {
  log(`\n🚀 罗圣纪元后端服务器启动成功！`);
  log(`   端口: ${PORT}`);
  log(`   AI Provider: ${CONFIG.AI_PROVIDER}`);
  log(`   Coze配置: ${CONFIG.COZE_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  log(`   DeepSeek配置: ${CONFIG.DEEPSEEK_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  log(`   OpenAI配置: ${CONFIG.OPENAI_API_KEY ? '✅ 已配置' : '❌ 未配置'}`);
  log(`   外部访问: http://0.0.0.0:${PORT}/api/v1`);
});
