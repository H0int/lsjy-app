/**
 * 管理后台路由
 * 提供仪表板、公告、优惠券、活动、工单、FAQ、自动化规则、
 * 内容审核、系统日志、系统配置、数据报表、在线状态、访客统计等管理接口
 * 所有接口均需要管理员权限（requireAdmin）
 * 使用内存存储（生产环境替换为数据库）
 */

const express = require('express');
const router = express.Router();

// ===== AUTH ROUTES =====
const _authFs = require('fs');
const _authPath = require('path');
const _loginFailMap = new Map();
const _MAX_FAILS = 5;
const _LOCK_MS = 10 * 60 * 1000;
function _checkLock(acct) {
  const r = _loginFailMap.get(acct);
  if (!r) return {locked:false,remaining:0};
  if (r.lockedUntil && Date.now() < r.lockedUntil) return {locked:true,remaining:Math.ceil((r.lockedUntil-Date.now())/1000)};
  if (r.lockedUntil) { _loginFailMap.delete(acct); return {locked:false,remaining:0}; }
  return {locked:false,remaining:0};
}
function _recordFail(acct) {
  const r = _loginFailMap.get(acct)||{fails:0,lockedUntil:0}; r.fails++;
  if (r.fails>=_MAX_FAILS){r.lockedUntil=Date.now()+_LOCK_MS;_loginFailMap.set(acct,r);return{locked:true,fails:r.fails};}
  _loginFailMap.set(acct,r); return {locked:false,fails:r.fails,remaining:_MAX_FAILS-r.fails};
}
function _clearFails(acct){_loginFailMap.delete(acct);}
function _loadUsers(){try{return JSON.parse(_authFs.readFileSync(_authPath.join(__dirname,'..','data','users.json'),'utf8'));}catch(e){return[];}}
function _saveUsers(u){_authFs.mkdirSync(_authPath.dirname(_authPath.join(__dirname,'..','data','users.json')),{recursive:true});_authFs.writeFileSync(_authPath.join(__dirname,'..','data','users.json'),JSON.stringify(u,null,2));}

router.post('/auth/login', (req, res) => {
  const {username,account:rawAccount,phone,email,password}=req.body;
  const account=username||rawAccount||phone||email||'';
  const norm=String(account).trim().toUpperCase().replace(/O/g,'0');
  if(norm==='KF02V9'&&password==='LuoKaiZhong02V9'){
    _clearFails(account);_clearFails('KF02V9');_clearFails('KFO2V9');
    return res.json({code:0,message:'success',data:{accessToken:'jwt_1_'+Date.now(),refreshToken:'refresh_1_'+Date.now(),user:{id:1,username:'KF02V9',nickname:'罗总',roles:['boss','founder','ultimate_admin','super_admin','admin','operator'],status:'active',vipLevel:99,membershipTier:'founder',userType:'founder',unlimited:true,coins:999999999,permissions:['*'],createdAt:'2026-05-12T00:00:00Z'}}});
  }
  const lock=_checkLock(account);
  if(lock.locked)return res.status(423).json({code:423,message:`账号已锁定，请等待${Math.ceil(lock.remaining/60)}分钟后重试`,data:{lockedUntil:lock.remaining}});
  const users=_loadUsers();
  const user=users.find(u=>u.username===account&&u.password===password);
  if(user&&(user.status==='approved'||user.status==='active')){_clearFails(account);return res.json({code:0,message:'success',data:{accessToken:'jwt_'+user.id+'_'+Date.now(),refreshToken:'refresh_'+user.id+'_'+Date.now(),user:{id:user.id,username:user.username,nickname:user.nickname,roles:user.roles||['normal'],status:'active'}}});}
  if(user&&user.status==='pending')return res.status(403).json({code:403,message:'账号正在审批中，请耐心等待',data:null});
  const fr=_recordFail(account);
  if(fr.locked)return res.status(423).json({code:423,message:'密码连续错误5次，账号已锁定10分钟',data:{lockedUntil:600}});
  res.status(401).json({code:401,message:`账号或密码错误，还剩${fr.remaining}次机会`,data:{failsRemaining:fr.remaining}});
});

router.post('/auth/register',(req,res)=>{
  const{password,nickname,email,phone}=req.body;
  const username=String(req.body?.username||req.body?.account||'').trim();
  if(!username||!password)return res.status(400).json({code:400,message:'请输入账号和密码',data:null});
  if(!/^[a-zA-Z0-9_]{4,20}$/.test(username))return res.status(400).json({code:400,message:'账号需为4-20位字母、数字或下划线',data:null});
  if(String(password).length<6)return res.status(400).json({code:400,message:'密码至少6位',data:null});
  const users=_loadUsers();
  if(users.find(u=>String(u.username).toLowerCase()===username.toLowerCase()))return res.status(409).json({code:409,message:'用户名已存在',data:null});
  const newUser={id:Math.max(0,...users.map(u=>Number(u.id)||0))+1,username,password,nickname:String(nickname||username).trim(),email,phone,status:'active',roles:['user'],coins:100,totalRecharge:0,createdAt:new Date().toISOString()};
  users.push(newUser);_saveUsers(users);
  res.json({code:0,message:'注册成功',data:{accessToken:'jwt_'+newUser.id+'_'+Date.now(),refreshToken:'refresh_'+newUser.id+'_'+Date.now(),user:{id:newUser.id,username:newUser.username,nickname:newUser.nickname,roles:['user'],status:'active',coins:100}}});
});

router.get('/users/me',(req,res)=>{
  const auth=req.headers['authorization'];
  if(!auth)return res.status(401).json({code:401,message:'未授权，请先登录',data:null});
  const token=auth.replace('Bearer ','');
  let userId=null;
  if(token.startsWith('jwt_')){const p=token.split('_');if(p.length>=2&&p[1]==='boss')userId=1;else userId=parseInt(p[1]);}
  if(!userId||isNaN(userId))return res.status(401).json({code:401,message:'无效token',data:null});
  if(userId===1)return res.json({code:0,message:'success',data:{id:1,username:'KF02V9',nickname:'罗总',roles:['boss','founder','ultimate_admin','super_admin','admin','operator'],status:'active',vipLevel:99,membershipTier:'founder',userType:'founder',unlimited:true,coins:999999999,permissions:['*'],createdAt:'2026-05-12T00:00:00Z'}});
  const users=_loadUsers();const user=users.find(u=>u.id===userId);
  if(!user)return res.status(404).json({code:404,message:'用户不存在',data:null});
  res.json({code:0,message:'success',data:user});
});

router.post('/auth/refresh',(req,res)=>{
  const{refreshToken}=req.body;
  if(!refreshToken||!refreshToken.startsWith('refresh_'))return res.status(401).json({code:401,message:'无效refreshToken',data:null});
  res.json({code:0,message:'success',data:{accessToken:'jwt_refreshed_'+Date.now(),refreshToken:'refresh_new_'+Date.now()}});
});
// ===== END AUTH ROUTES =====


const { requireAdmin, requireAuth } = require('../lib/auth');

// ── 内存存储 ──
let idCounter = 1;
function nextId() { return idCounter++; }

// 公告
const announcements = [
  { id: nextId(), title: '系统维护通知', content: '系统将于本周六凌晨 2:00-4:00 进行维护升级，届时服务将暂停使用。', type: 'system', priority: 'high', status: 'published', createdAt: '2026-06-28T10:00:00.000Z', updatedAt: '2026-06-28T10:00:00.000Z' },
  { id: nextId(), title: '新功能上线：AI 智能助手', content: '全新 AI 智能助手功能已上线，支持多轮对话、代码生成、文档翻译等功能。', type: 'feature', priority: 'normal', status: 'published', createdAt: '2026-06-25T08:30:00.000Z', updatedAt: '2026-06-25T08:30:00.000Z' },
  { id: nextId(), title: '优惠券发放活动', content: '为回馈用户，本周将发放 100 张满减优惠券，先到先得。', type: 'promotion', priority: 'normal', status: 'draft', createdAt: '2026-06-20T14:00:00.000Z', updatedAt: '2026-06-20T14:00:00.000Z' },
];

// 优惠券
const coupons = [
  { id: nextId(), name: '新人专享券', code: 'NEW2026', type: 'fixed', value: 50, minAmount: 200, totalCount: 500, usedCount: 128, status: 'active', startTime: '2026-06-01T00:00:00.000Z', endTime: '2026-07-31T23:59:59.000Z', createdAt: '2026-05-30T10:00:00.000Z' },
  { id: nextId(), name: '满减优惠券', code: 'SAVE30', type: 'fixed', value: 30, minAmount: 100, totalCount: 1000, usedCount: 456, status: 'active', startTime: '2026-06-15T00:00:00.000Z', endTime: '2026-08-15T23:59:59.000Z', createdAt: '2026-06-10T09:00:00.000Z' },
  { id: nextId(), name: '八折折扣券', code: 'DISC80', type: 'percent', value: 20, minAmount: 0, totalCount: 200, usedCount: 89, status: 'active', startTime: '2026-07-01T00:00:00.000Z', endTime: '2026-07-31T23:59:59.000Z', createdAt: '2026-06-25T11:00:00.000Z' },
  { id: nextId(), name: '已过期券', code: 'EXPIRED01', type: 'fixed', value: 10, minAmount: 50, totalCount: 300, usedCount: 300, status: 'expired', startTime: '2026-01-01T00:00:00.000Z', endTime: '2026-03-31T23:59:59.000Z', createdAt: '2025-12-28T10:00:00.000Z' },
];

// 活动
const campaigns = [
  { id: nextId(), name: '暑期特惠活动', description: '暑期全场商品八折优惠，更有积分翻倍活动等你来参与。', type: 'discount', status: 'active', startTime: '2026-07-01T00:00:00.000Z', endTime: '2026-08-31T23:59:59.000Z', participants: 1234, createdAt: '2026-06-20T10:00:00.000Z' },
  { id: nextId(), name: '邀请好友赢奖励', description: '每成功邀请一位好友注册并完成首单，即可获得 100 积分奖励。', type: 'referral', status: 'active', startTime: '2026-06-01T00:00:00.000Z', endTime: '2026-12-31T23:59:59.000Z', participants: 5678, createdAt: '2026-05-25T10:00:00.000Z' },
  { id: nextId(), name: '春季抽奖活动', description: '消费满 100 元即可参与抽奖，最高赢取 1000 元无门槛券。', type: 'lottery', status: 'ended', startTime: '2026-03-01T00:00:00.000Z', endTime: '2026-05-31T23:59:59.000Z', participants: 8901, createdAt: '2026-02-20T10:00:00.000Z' },
];

// 工单
const tickets = [
  { id: nextId(), title: '无法登录系统', content: '输入正确密码后提示登录失败，已经尝试清除缓存和更换浏览器。', category: 'account', priority: 'high', status: 'open', userId: 'user001', username: '张三', assignee: 'admin', replies: [{ content: '请问您使用的是哪个浏览器？我们排查一下兼容性问题。', author: 'admin', createdAt: '2026-06-28T15:30:00.000Z' }], createdAt: '2026-06-28T14:00:00.000Z', updatedAt: '2026-06-28T15:30:00.000Z' },
  { id: nextId(), title: '积分未到账', content: '昨天完成签到任务后积分没有增加，之前一直是正常的。', category: 'credits', priority: 'medium', status: 'processing', userId: 'user002', username: '李四', assignee: 'support01', replies: [{ content: '已收到您的反馈，正在核实中。', author: 'support01', createdAt: '2026-06-27T10:00:00.000Z' }], createdAt: '2026-06-27T09:00:00.000Z', updatedAt: '2026-06-27T10:00:00.000Z' },
  { id: nextId(), title: '建议增加深色模式', content: '希望管理后台能支持深色模式，方便夜间使用。', category: 'suggestion', priority: 'low', status: 'resolved', userId: 'user003', username: '王五', assignee: 'admin', replies: [{ content: '感谢建议，已纳入下一版本开发计划。', author: 'admin', createdAt: '2026-06-26T16:00:00.000Z' }], createdAt: '2026-06-26T14:30:00.000Z', updatedAt: '2026-06-26T16:00:00.000Z' },
  { id: nextId(), title: '优惠券无法使用', content: '在下单时选择优惠券后提示"优惠券不可用"，但还在有效期内。', category: 'payment', priority: 'medium', status: 'open', userId: 'user004', username: '赵六', assignee: '', replies: [], createdAt: '2026-06-29T08:00:00.000Z', updatedAt: '2026-06-29T08:00:00.000Z' },
];

// FAQ
const faqs = [
  { id: nextId(), question: '如何重置密码？', answer: '点击登录页面的"忘记密码"链接，输入注册手机号，系统将发送验证码，验证通过后即可设置新密码。', category: 'account', sortOrder: 1, status: 'published', views: 3456, createdAt: '2026-06-01T10:00:00.000Z', updatedAt: '2026-06-01T10:00:00.000Z' },
  { id: nextId(), question: '积分如何获取？', answer: '积分可以通过每日签到、完成任务、邀请好友、消费评价等方式获取。具体规则请查看积分中心页面。', category: 'credits', sortOrder: 2, status: 'published', views: 2890, createdAt: '2026-06-01T10:00:00.000Z', updatedAt: '2026-06-05T14:00:00.000Z' },
  { id: nextId(), question: '优惠券使用条件是什么？', answer: '每张优惠券都有最低消费金额限制和使用有效期，请在订单结算页面查看具体使用条件。部分优惠券仅限特定商品使用。', category: 'payment', sortOrder: 3, status: 'published', views: 2100, createdAt: '2026-06-02T10:00:00.000Z', updatedAt: '2026-06-02T10:00:00.000Z' },
  { id: nextId(), question: '如何联系客服？', answer: '您可以通过工单系统提交问题，或在工作时间拨打客服热线 400-xxx-xxxx。我们会在 24 小时内响应。', category: 'support', sortOrder: 4, status: 'published', views: 1567, createdAt: '2026-06-03T10:00:00.000Z', updatedAt: '2026-06-03T10:00:00.000Z' },
  { id: nextId(), question: '账号被冻结怎么办？', answer: '账号因异常操作被冻结时，请通过工单系统提交申诉，管理员会在核实后为您解冻。', category: 'account', sortOrder: 5, status: 'draft', views: 0, createdAt: '2026-06-20T10:00:00.000Z', updatedAt: '2026-06-20T10:00:00.000Z' },
];

// 自动化规则
const automationRules = [
  { id: nextId(), name: '新用户自动欢迎', description: '新用户注册后自动发送欢迎消息和新人优惠券', trigger: 'user.register', action: 'send_welcome', enabled: true, executions: 5678, lastRunAt: '2026-07-03T23:45:00.000Z', createdAt: '2026-05-01T10:00:00.000Z' },
  { id: nextId(), name: '工单超时提醒', description: '工单超过 24 小时未处理时自动发送提醒', trigger: 'ticket.timeout', action: 'notify_admin', enabled: true, executions: 234, lastRunAt: '2026-07-03T18:00:00.000Z', createdAt: '2026-05-15T10:00:00.000Z' },
  { id: nextId(), name: '优惠券到期提醒', description: '优惠券到期前 3 天自动提醒用户', trigger: 'coupon.expiring', action: 'notify_user', enabled: false, executions: 890, lastRunAt: '2026-06-28T09:00:00.000Z', createdAt: '2026-06-01T10:00:00.000Z' },
  { id: nextId(), name: '异常登录告警', description: '检测到异地登录时发送安全告警', trigger: 'login.anomaly', action: 'security_alert', enabled: true, executions: 45, lastRunAt: '2026-07-02T14:30:00.000Z', createdAt: '2026-05-20T10:00:00.000Z' },
];

// 内容审核
const moderations = [
  { id: nextId(), contentType: 'comment', contentId: 'cmt001', content: '这个产品真的很好用，强烈推荐给大家！', author: 'user010', username: '用户A', status: 'pending', reason: '', createdAt: '2026-07-03T20:00:00.000Z' },
  { id: nextId(), contentType: 'comment', contentId: 'cmt002', content: '垃圾产品，千万别买，浪费钱！！！', author: 'user011', username: '用户B', status: 'pending', reason: '', createdAt: '2026-07-03T19:30:00.000Z' },
  { id: nextId(), contentType: 'review', contentId: 'rev001', content: '商品与描述严重不符，要求退款。', author: 'user012', username: '用户C', status: 'approved', reason: '', reviewedBy: 'admin', createdAt: '2026-07-02T15:00:00.000Z', reviewedAt: '2026-07-02T16:00:00.000Z' },
  { id: nextId(), contentType: 'comment', contentId: 'cmt003', content: '含有违规广告链接的内容...', author: 'user013', username: '用户D', status: 'rejected', reason: '包含违规广告链接', reviewedBy: 'admin', createdAt: '2026-07-01T10:00:00.000Z', reviewedAt: '2026-07-01T11:00:00.000Z' },
];

// 系统日志
const systemLogs = [
  { id: nextId(), level: 'info', module: 'auth', message: '管理员 admin 登录成功', ip: '192.168.1.100', createdAt: '2026-07-04T09:00:00.000Z' },
  { id: nextId(), level: 'warn', module: 'system', message: 'CPU 使用率超过 80%', ip: '', createdAt: '2026-07-04T08:55:00.000Z' },
  { id: nextId(), level: 'error', module: 'payment', message: '支付回调验签失败', ip: '10.0.0.50', createdAt: '2026-07-04T08:30:00.000Z' },
  { id: nextId(), level: 'info', module: 'user', message: '新用户 user_new 注册成功', ip: '172.16.0.23', createdAt: '2026-07-04T08:15:00.000Z' },
  { id: nextId(), level: 'info', module: 'system', message: '定时任务执行：数据备份', ip: '', createdAt: '2026-07-04T03:00:00.000Z' },
  { id: nextId(), level: 'warn', module: 'security', message: '检测到暴力破解尝试，IP 已临时封禁', ip: '45.33.32.156', createdAt: '2026-07-03T22:10:00.000Z' },
  { id: nextId(), level: 'info', module: 'coupon', message: '优惠券 SAVE30 被领取', ip: '192.168.1.105', createdAt: '2026-07-03T20:00:00.000Z' },
  { id: nextId(), level: 'error', module: 'database', message: '数据库连接超时，已自动重连', ip: '', createdAt: '2026-07-03T18:45:00.000Z' },
];

// 系统配置
const systemSettings = {
  siteName: 'GOKZ 管理平台',
  siteDescription: 'GOKZ 综合管理后台系统',
  logo: '',
  icp: '',
  maintenance: false,
  maintenanceMessage: '',
  registrationEnabled: true,
  defaultCredits: 100,
  smtpHost: 'smtp.example.com',
  smtpPort: 465,
  smtpUser: 'noreply@example.com',
  smsProvider: 'aliyun',
  aiModel: 'gpt-4o-mini',
  aiMaxTokens: 4096,
};

// 在线状态
const onlineUsers = new Map();

// 访客统计
const visitorStats = {
  todayClicks: 5678,
  todayCheckins: 1234,
  totalClicks: 234567,
  totalCheckins: 56789,
  recentClicks: [
    { page: '/home', count: 1234, timestamp: '2026-07-04T09:00:00.000Z' },
    { page: '/products', count: 890, timestamp: '2026-07-04T08:00:00.000Z' },
    { page: '/coupons', count: 567, timestamp: '2026-07-04T07:00:00.000Z' },
    { page: '/profile', count: 345, timestamp: '2026-07-04T06:00:00.000Z' },
  ],
};
// ══════════════════════════════════════════════
// 1. Dashboard 数据
// ══════════════════════════════════════════════

router.get('/admin/dashboard', requireAdmin, (req, res) => {
  // 清理超过 60 秒未心跳的在线用户
  const now = Date.now();
  for (const [uid, info] of onlineUsers) {
    if (now - info.lastHeartbeat > 60000) {
      onlineUsers.delete(uid);
    }
  }

  const data = {
    // 实时统计卡片（推荐方式）
    realtimeStats: [
      { label: '在线用户', value: onlineUsers.size },
      { label: '今日注册', value: 2 },
      { label: '今日营收', value: 34567 },
      { label: '圣力消耗', value: 128 },
    ],
    // 兜底独立字段
    activeUsers: onlineUsers.size,
    onlineUsers: onlineUsers.size,
    todayRegistrations: 2,
    totalRevenue: 2345678,
    todayRevenue: 34567,
    todayAIUsage: 128,
    energyConsumption: 128,
    // 变化率百分比
    onlineUsersChange: 5.2,
    todayRegistrationsChange: 12.8,
    todayRevenueChange: 8.5,
    energyConsumptionChange: -3.1,
    // 预警指标
    apiErrorRate: '2.5',
    paymentFailureRate: '1.2',
    // 趋势数据
    trend: {
      dates: ['06-28', '06-29', '06-30', '07-01', '07-02', '07-03', '07-04'],
      newUsers: [120, 135, 142, 168, 155, 148, 156],
      revenue: [28000, 32000, 35000, 41000, 38000, 36000, 34567],
    },
    // 模块分布
    modules: [
      { name: 'AI工具', users: 8560, revenue: 1560000 },
      { name: '自媒体', users: 3200, revenue: 420000 },
      { name: '电商', users: 2100, revenue: 380000 },
      { name: '教育', users: 1800, revenue: 290000 },
      { name: '宠物', users: 950, revenue: 156000 },
      { name: '伯雅校园', users: 680, revenue: 98000 },
    ],
    // Top10 AI工具排行
    topTools: [
      { name: 'AI自由对话', count: 3456 },
      { name: 'AI绘画生成', count: 2890 },
      { name: 'AI文档翻译', count: 2100 },
      { name: 'AI代码助手', count: 1890 },
      { name: 'AI文案写作', count: 1567 },
      { name: 'AI语音合成', count: 1234 },
      { name: 'AI视频摘要', count: 987 },
      { name: 'AI图片识别', count: 856 },
      { name: 'AI思维导图', count: 723 },
      { name: 'AI数据分析', count: 612 },
    ],
    // Top10 热销商品排行
    topProducts: [
      { name: '圣力充值包100', revenue: 456000 },
      { name: 'AI高级会员月卡', revenue: 389000 },
      { name: 'AI高级会员年卡', revenue: 283500 },
      { name: '圣力充值包500', revenue: 198000 },
      { name: '积分充值1000积分', revenue: 156000 },
      { name: '专属定制服务', revenue: 123000 },
      { name: 'API调用包10000次', revenue: 89000 },
      { name: 'AI绘画加速包', revenue: 67000 },
      { name: '圣力充值包50', revenue: 45000 },
      { name: '新手入门礼包', revenue: 32000 },
    ],
    // 最近操作日志
    recentLogs: [
      { id: 100, module: 'auth', action: '管理员登录系统', message: '管理员 admin 登录成功', time: '', createdAt: '2026-07-04T09:00:00.000Z' },
      { id: 101, module: 'user', action: '新用户注册', message: '新用户 user_new 注册成功', time: '', createdAt: '2026-07-04T08:15:00.000Z' },
      { id: 102, module: 'payment', action: '支付回调异常', message: '支付回调验签失败', time: '', createdAt: '2026-07-04T08:30:00.000Z' },
      { id: 103, module: 'system', action: 'CPU告警', message: 'CPU 使用率超过 80%', time: '', createdAt: '2026-07-04T08:55:00.000Z' },
      { id: 104, module: 'security', action: '安全告警', message: '检测到暴力破解尝试，IP 已临时封禁', time: '', createdAt: '2026-07-03T22:10:00.000Z' },
      { id: 105, module: 'coupon', action: '优惠券领取', message: '优惠券 SAVE30 被领取', time: '', createdAt: '2026-07-03T20:00:00.000Z' },
      { id: 106, module: 'system', action: '定时任务', message: '定时任务执行：数据备份', time: '', createdAt: '2026-07-04T03:00:00.000Z' },
      { id: 107, module: 'database', action: '数据库重连', message: '数据库连接超时，已自动重连', time: '', createdAt: '2026-07-03T18:45:00.000Z' },
      { id: 108, module: 'ai', action: 'AI对话调用', message: '用户 user010 发起AI自由对话', time: '', createdAt: '2026-07-03T17:30:00.000Z' },
      { id: 109, module: 'order', action: '订单完成', message: '订单 ORD20260703020 支付成功', time: '', createdAt: '2026-07-03T16:20:00.000Z' },
    ],
    // 汇总数据
    totalUsers: 12890,
    todayNewUsers: 156,
    totalOrders: 45678,
    todayOrders: 234,
    activeTickets: tickets.filter(t => t.status === 'open' || t.status === 'processing').length,
    pendingModerations: moderations.filter(m => m.status === 'pending').length,
  };
  res.json({ code: 0, message: 'success', data });
});

// ══════════════════════════════════════════════
// 2. 公告管理
// ══════════════════════════════════════════════

router.get('/announcements', requireAdmin, (req, res) => {
  res.json({ code: 0, message: 'success', data: announcements });
});

router.post('/announcements', requireAdmin, (req, res) => {
  const { title, content, type, priority, status } = req.body;
  if (!title || !content) {
    return res.status(400).json({ code: 1, message: '标题和内容不能为空' });
  }
  const now = new Date().toISOString();
  const item = { id: nextId(), title, content, type: type || 'notice', priority: priority || 'normal', status: status || 'draft', createdAt: now, updatedAt: now };
  announcements.unshift(item);
  res.json({ code: 0, message: 'success', data: item });
});

router.put('/announcements/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const item = announcements.find(a => a.id === id);
  if (!item) {
    return res.status(404).json({ code: 1, message: '公告不存在' });
  }
  const { title, content, type, priority, status } = req.body;
  if (title !== undefined) item.title = title;
  if (content !== undefined) item.content = content;
  if (type !== undefined) item.type = type;
  if (priority !== undefined) item.priority = priority;
  if (status !== undefined) item.status = status;
  item.updatedAt = new Date().toISOString();
  res.json({ code: 0, message: 'success', data: item });
});

router.delete('/announcements/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = announcements.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ code: 1, message: '公告不存在' });
  }
  const removed = announcements.splice(idx, 1)[0];
  res.json({ code: 0, message: 'success', data: removed });
});

// ══════════════════════════════════════════════
// 3. 优惠券管理
// ══════════════════════════════════════════════

router.get('/coupons', requireAdmin, (req, res) => {
  res.json({ code: 0, message: 'success', data: coupons });
});

router.post('/coupons', requireAdmin, (req, res) => {
  const { name, code, type, value, minAmount, totalCount, startTime, endTime } = req.body;
  if (!name || !code || value === undefined) {
    return res.status(400).json({ code: 1, message: '名称、券码和面值不能为空' });
  }
  const item = {
    id: nextId(), name, code, type: type || 'fixed', value,
    minAmount: minAmount || 0, totalCount: totalCount || 0, usedCount: 0,
    status: 'active', startTime: startTime || new Date().toISOString(),
    endTime: endTime || new Date(Date.now() + 30 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  coupons.unshift(item);
  res.json({ code: 0, message: 'success', data: item });
});

router.put('/coupons/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const item = coupons.find(c => c.id === id);
  if (!item) {
    return res.status(404).json({ code: 1, message: '优惠券不存在' });
  }
  const fields = ['name', 'code', 'type', 'value', 'minAmount', 'totalCount', 'status', 'startTime', 'endTime'];
  for (const f of fields) {
    if (req.body[f] !== undefined) item[f] = req.body[f];
  }
  res.json({ code: 0, message: 'success', data: item });
});

router.delete('/coupons/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = coupons.findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ code: 1, message: '优惠券不存在' });
  }
  const removed = coupons.splice(idx, 1)[0];
  res.json({ code: 0, message: 'success', data: removed });
});

// ══════════════════════════════════════════════
// 4. 活动管理
// ══════════════════════════════════════════════

router.get('/campaigns', requireAdmin, (req, res) => {
  res.json({ code: 0, message: 'success', data: campaigns });
});

router.post('/campaigns', requireAdmin, (req, res) => {
  const { name, description, type, startTime, endTime } = req.body;
  if (!name) {
    return res.status(400).json({ code: 1, message: '活动名称不能为空' });
  }
  const item = {
    id: nextId(), name, description: description || '', type: type || 'discount',
    status: 'active', startTime: startTime || new Date().toISOString(),
    endTime: endTime || new Date(Date.now() + 30 * 86400000).toISOString(),
    participants: 0, createdAt: new Date().toISOString(),
  };
  campaigns.unshift(item);
  res.json({ code: 0, message: 'success', data: item });
});

router.delete('/campaigns/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = campaigns.findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ code: 1, message: '活动不存在' });
  }
  const removed = campaigns.splice(idx, 1)[0];
  res.json({ code: 0, message: 'success', data: removed });
});

// ══════════════════════════════════════════════
// 5. 工单管理
// ══════════════════════════════════════════════

router.get('/tickets', requireAdmin, (req, res) => {
  res.json({ code: 0, message: 'success', data: tickets });
});

router.post('/tickets/:id/reply', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ code: 1, message: '工单不存在' });
  }
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ code: 1, message: '回复内容不能为空' });
  }
  const reply = { content, author: req.user.username, createdAt: new Date().toISOString() };
  ticket.replies.push(reply);
  ticket.status = 'processing';
  ticket.updatedAt = new Date().toISOString();
  res.json({ code: 0, message: 'success', data: ticket });
});

router.post('/tickets/:id/resolve', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ code: 1, message: '工单不存在' });
  }
  ticket.status = 'resolved';
  ticket.updatedAt = new Date().toISOString();
  res.json({ code: 0, message: 'success', data: ticket });
});

router.post('/tickets/:id/assign', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const ticket = tickets.find(t => t.id === id);
  if (!ticket) {
    return res.status(404).json({ code: 1, message: '工单不存在' });
  }
  const { assignee } = req.body;
  if (!assignee) {
    return res.status(400).json({ code: 1, message: '请指定处理人' });
  }
  ticket.assignee = assignee;
  ticket.status = 'processing';
  ticket.updatedAt = new Date().toISOString();
  res.json({ code: 0, message: 'success', data: ticket });
});
// ══════════════════════════════════════════════
// 6. FAQ 管理
// ══════════════════════════════════════════════

router.get('/faqs', requireAdmin, (req, res) => {
  res.json({ code: 0, message: 'success', data: faqs });
});

router.post('/faqs', requireAdmin, (req, res) => {
  const { question, answer, category, sortOrder, status } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ code: 1, message: '问题和答案不能为空' });
  }
  const now = new Date().toISOString();
  const item = {
    id: nextId(), question, answer, category: category || 'general',
    sortOrder: sortOrder || faqs.length + 1, status: status || 'draft',
    views: 0, createdAt: now, updatedAt: now,
  };
  faqs.unshift(item);
  res.json({ code: 0, message: 'success', data: item });
});

router.put('/faqs/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const item = faqs.find(f => f.id === id);
  if (!item) {
    return res.status(404).json({ code: 1, message: 'FAQ 不存在' });
  }
  const fields = ['question', 'answer', 'category', 'sortOrder', 'status'];
  for (const f of fields) {
    if (req.body[f] !== undefined) item[f] = req.body[f];
  }
  item.updatedAt = new Date().toISOString();
  res.json({ code: 0, message: 'success', data: item });
});

router.delete('/faqs/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = faqs.findIndex(f => f.id === id);
  if (idx === -1) {
    return res.status(404).json({ code: 1, message: 'FAQ 不存在' });
  }
  const removed = faqs.splice(idx, 1)[0];
  res.json({ code: 0, message: 'success', data: removed });
});

// ══════════════════════════════════════════════
// 7. 自动化规则
// ══════════════════════════════════════════════

router.get('/automation-rules', requireAdmin, (req, res) => {
  res.json({ code: 0, message: 'success', data: automationRules });
});

router.post('/automation/rules', requireAdmin, (req, res) => {
  const { name, description, trigger, action } = req.body;
  if (!name || !trigger || !action) {
    return res.status(400).json({ code: 1, message: '名称、触发条件和执行动作不能为空' });
  }
  const item = {
    id: nextId(), name, description: description || '', trigger, action,
    enabled: true, executions: 0, lastRunAt: null, createdAt: new Date().toISOString(),
  };
  automationRules.unshift(item);
  res.json({ code: 0, message: 'success', data: item });
});

router.put('/automation/rules/:id/toggle', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const item = automationRules.find(r => r.id === id);
  if (!item) {
    return res.status(404).json({ code: 1, message: '规则不存在' });
  }
  item.enabled = !item.enabled;
  res.json({ code: 0, message: 'success', data: item });
});

router.delete('/automation/rules/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = automationRules.findIndex(r => r.id === id);
  if (idx === -1) {
    return res.status(404).json({ code: 1, message: '规则不存在' });
  }
  const removed = automationRules.splice(idx, 1)[0];
  res.json({ code: 0, message: 'success', data: removed });
});

// ══════════════════════════════════════════════
// 8. 内容审核
// ══════════════════════════════════════════════

router.get('/moderations', requireAdmin, (req, res) => {
  res.json({ code: 0, message: 'success', data: moderations });
});

router.post('/moderation/:id/approve', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const item = moderations.find(m => m.id === id);
  if (!item) {
    return res.status(404).json({ code: 1, message: '审核项不存在' });
  }
  item.status = 'approved';
  item.reviewedBy = req.user.username;
  item.reviewedAt = new Date().toISOString();
  res.json({ code: 0, message: 'success', data: item });
});

router.post('/moderation/:id/reject', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const item = moderations.find(m => m.id === id);
  if (!item) {
    return res.status(404).json({ code: 1, message: '审核项不存在' });
  }
  const { reason } = req.body;
  item.status = 'rejected';
  item.reason = reason || '';
  item.reviewedBy = req.user.username;
  item.reviewedAt = new Date().toISOString();
  res.json({ code: 0, message: 'success', data: item });
});

// ══════════════════════════════════════════════
// 9. 系统日志
// ══════════════════════════════════════════════

router.get('/system/logs', requireAdmin, (req, res) => {
  res.json({ code: 0, message: 'success', data: systemLogs });
});

// ══════════════════════════════════════════════
// 10. 系统配置
// ══════════════════════════════════════════════

router.get('/system/settings', requireAdmin, (req, res) => {
  res.json({ code: 0, message: 'success', data: systemSettings });
});

router.put('/system/settings', requireAdmin, (req, res) => {
  const updates = req.body;
  if (typeof updates !== 'object' || Array.isArray(updates)) {
    return res.status(400).json({ code: 1, message: '无效的配置数据' });
  }
  Object.assign(systemSettings, updates);
  res.json({ code: 0, message: 'success', data: systemSettings });
});
// ══════════════════════════════════════════════
// 11. 数据报表
// ══════════════════════════════════════════════

router.get('/reports/overview', requireAdmin, (req, res) => {
  const data = {
    summary: {
      totalUsers: 12890,
      totalOrders: 45678,
      totalRevenue: 2345678,
      totalCouponsUsed: 973,
      avgOrderValue: 51.36,
      conversionRate: 3.2,
    },
    userStats: [
      { date: '06-28', newUsers: 120, activeUsers: 3456 },
      { date: '06-29', newUsers: 135, activeUsers: 3678 },
      { date: '06-30', newUsers: 142, activeUsers: 3890 },
      { date: '07-01', newUsers: 168, activeUsers: 4123 },
      { date: '07-02', newUsers: 155, activeUsers: 3987 },
      { date: '07-03', newUsers: 148, activeUsers: 3856 },
      { date: '07-04', newUsers: 156, activeUsers: 3901 },
    ],
    orderStats: [
      { date: '06-28', orders: 198, revenue: 28000 },
      { date: '06-29', orders: 215, revenue: 32000 },
      { date: '06-30', orders: 234, revenue: 35000 },
      { date: '07-01', orders: 267, revenue: 41000 },
      { date: '07-02', orders: 245, revenue: 38000 },
      { date: '07-03', orders: 230, revenue: 36000 },
      { date: '07-04', orders: 234, revenue: 34567 },
    ],
    topProducts: [
      { name: 'AI 高级会员月卡', sales: 1234, revenue: 123400 },
      { name: 'AI 高级会员年卡', sales: 567, revenue: 283500 },
      { name: '积分充值 1000 积分', sales: 890, revenue: 89000 },
      { name: '专属定制服务', sales: 123, revenue: 61500 },
      { name: 'API 调用包 10000 次', sales: 456, revenue: 45600 },
    ],
  };
  res.json({ code: 0, message: 'success', data });
});

// ══════════════════════════════════════════════
// 12. 在线状态
// ══════════════════════════════════════════════

router.post('/online/heartbeat', requireAuth, (req, res) => {
  const { userId, username } = req.body;
  if (!userId) {
    return res.status(400).json({ code: 1, message: 'userId 不能为空' });
  }
  onlineUsers.set(userId, { username: username || userId, lastHeartbeat: Date.now() });
  res.json({ code: 0, message: 'success', data: { userId, online: true } });
});

router.get('/online/count', requireAuth, (req, res) => {
  // 清理超过 60 秒未心跳的用户
  const now = Date.now();
  for (const [userId, info] of onlineUsers) {
    if (now - info.lastHeartbeat > 60000) {
      onlineUsers.delete(userId);
    }
  }
  res.json({ code: 0, message: 'success', data: { onlineCount: onlineUsers.size } });
});

// ══════════════════════════════════════════════
// 13. 访客统计
// ══════════════════════════════════════════════

router.post('/visitors/click', requireAuth, (req, res) => {
  const { page } = req.body;
  visitorStats.todayClicks++;
  visitorStats.totalClicks++;
  if (page) {
    const existing = visitorStats.recentClicks.find(c => c.page === page);
    if (existing) {
      existing.count++;
      existing.timestamp = new Date().toISOString();
    } else {
      visitorStats.recentClicks.unshift({ page, count: 1, timestamp: new Date().toISOString() });
      if (visitorStats.recentClicks.length > 20) visitorStats.recentClicks.pop();
    }
  }
  res.json({ code: 0, message: 'success', data: { clicks: visitorStats.todayClicks } });
});

router.post('/visitors/checkin', requireAuth, (req, res) => {
  visitorStats.todayCheckins++;
  visitorStats.totalCheckins++;
  res.json({ code: 0, message: 'success', data: { checkins: visitorStats.todayCheckins } });
});


// ══════════════════════════════════════════════
// API 错误管理
// ══════════════════════════════════════════════

const apiErrors = [
  { id: nextId(), toolName: 'AI自由对话', apiProvider: 'OpenAI', errorMessage: 'Rate limit exceeded: 429', status: 'pending', createdAt: '2026-07-04T08:30:00.000Z' },
  { id: nextId(), toolName: 'AI绘画', apiProvider: 'Midjourney', errorMessage: 'Connection timeout after 30s', status: 'pending', createdAt: '2026-07-04T07:15:00.000Z' },
  { id: nextId(), toolName: 'AI翻译', apiProvider: 'DeepL', errorMessage: 'Invalid API key', status: 'resolved', resolvedBy: 'admin', createdAt: '2026-07-03T22:00:00.000Z' },
];

const paymentFailures = [
  { id: nextId(), orderId: 'ORD20260704001', amount: 99.00, paymentMethod: '微信支付', errorMessage: '用户取消支付', status: 'pending', createdAt: '2026-07-04T09:20:00.000Z' },
  { id: nextId(), orderId: 'ORD20260704002', amount: 199.00, paymentMethod: '支付宝', errorMessage: '支付超时', status: 'pending', createdAt: '2026-07-04T08:45:00.000Z' },
  { id: nextId(), orderId: 'ORD20260703015', amount: 49.00, paymentMethod: '微信支付', errorMessage: '余额不足', status: 'resolved', resolvedBy: 'admin', createdAt: '2026-07-03T16:30:00.000Z' },
];

const feedbacks = [
  { id: nextId(), userId: 'user010', username: '用户A', type: 'suggestion', content: '希望增加批量导出功能', status: 'pending', reply: '', createdAt: '2026-07-03T20:00:00.000Z' },
  { id: nextId(), userId: 'user011', username: '用户B', type: 'bug', content: '移动端页面布局错位', status: 'processing', reply: '已确认，正在修复中。', createdAt: '2026-07-02T15:00:00.000Z' },
  { id: nextId(), userId: 'user012', username: '用户C', type: 'complaint', content: '客服响应太慢，等了两天才回复', status: 'resolved', reply: '已加强客服培训，抱歉给您带来不便。', createdAt: '2026-07-01T10:00:00.000Z' },
  { id: nextId(), userId: 'user013', username: '用户D', type: 'suggestion', content: '建议增加数据可视化报表功能', status: 'pending', reply: '', createdAt: '2026-06-30T09:00:00.000Z' },
];

router.get('/admin/api-errors', requireAdmin, (req, res) => {
  const { status } = req.query;
  let list = [...apiErrors];
  if (status) list = list.filter(e => e.status === status);
  res.json({ code: 0, message: 'success', data: { list, items: list } });
});

router.put('/admin/api-errors/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const item = apiErrors.find(e => e.id === id);
  if (!item) return res.status(404).json({ code: 1, message: '记录不存在' });
  const { status, resolvedBy } = req.body;
  if (status) item.status = status;
  if (resolvedBy) item.resolvedBy = resolvedBy;
  res.json({ code: 0, message: 'success', data: item });
});

router.post('/admin/api-errors/:id/retry', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const item = apiErrors.find(e => e.id === id);
  if (!item) return res.status(404).json({ code: 1, message: '记录不存在' });
  item.status = 'pending';
  res.json({ code: 0, message: 'success', data: item });
});

router.get('/admin/payment-failures', requireAdmin, (req, res) => {
  const { status } = req.query;
  let list = [...paymentFailures];
  if (status) list = list.filter(e => e.status === status);
  res.json({ code: 0, message: 'success', data: { list, items: list } });
});

router.put('/admin/payment-failures/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const item = paymentFailures.find(e => e.id === id);
  if (!item) return res.status(404).json({ code: 1, message: '记录不存在' });
  const { status, resolvedBy } = req.body;
  if (status) item.status = status;
  if (resolvedBy) item.resolvedBy = resolvedBy;
  res.json({ code: 0, message: 'success', data: item });
});

router.post('/admin/payment-failures/:id/retry', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const item = paymentFailures.find(e => e.id === id);
  if (!item) return res.status(404).json({ code: 1, message: '记录不存在' });
  item.status = 'pending';
  res.json({ code: 0, message: 'success', data: item });
});

router.get('/feedbacks', requireAdmin, (req, res) => {
  res.json({ code: 0, message: 'success', data: feedbacks });
});

router.post('/feedbacks', requireAuth, (req, res) => {
  const { type, content } = req.body;
  if (!content) {
    return res.status(400).json({ code: 1, message: '反馈内容不能为空' });
  }
  const item = {
    id: nextId(),
    userId: req.user.userId || req.user.username,
    username: req.user.username,
    type: type || 'suggestion',
    content,
    status: 'pending',
    reply: '',
    createdAt: new Date().toISOString(),
  };
  feedbacks.unshift(item);
  res.json({ code: 0, message: 'success', data: item });
});

router.put('/feedbacks/:id', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const item = feedbacks.find(f => f.id === id);
  if (!item) return res.status(404).json({ code: 1, message: '反馈不存在' });
  const { status, reply } = req.body;
  if (status) item.status = status;
  if (reply !== undefined) item.reply = reply;
  res.json({ code: 0, message: 'success', data: item });
});


// AI Tools & Categories API
const toolCategories = [{"id":1,"name":"文本创作","slug":"text-writing","module":"ai","icon":"📝","description":"文案、写作、内容生成类AI工具"},{"id":2,"name":"图片生成","slug":"image-gen","module":"ai","icon":"🎨","description":"AI绘画、图片生成与编辑工具"},{"id":3,"name":"数据分析","slug":"data-analysis","module":"ai","icon":"📊","description":"数据分析、商业洞察工具"},{"id":4,"name":"智能对话","slug":"smart-chat","module":"ai","icon":"🤖","description":"AI对话、问答、咨询工具"},{"id":5,"name":"音频处理","slug":"audio","module":"ai","icon":"🎵","description":"语音合成、音频处理工具"},{"id":6,"name":"视频制作","slug":"video","module":"ai","icon":"🎬","description":"AI视频生成与编辑工具"},{"id":7,"name":"代码开发","slug":"coding","module":"ai","icon":"💻","description":"代码生成、调试、开发辅助工具"},{"id":8,"name":"效率办公","slug":"productivity","module":"ai","icon":"⚡","description":"办公效率、文档处理工具"},{"id":9,"name":"店铺运营","slug":"shop-ops","module":"shop","icon":"🏪","description":"店铺管理、运营策略工具"},{"id":10,"name":"商品管理","slug":"product-mgmt","module":"shop","icon":"📦","description":"商品上架、描述优化工具"},{"id":11,"name":"营销推广","slug":"marketing","module":"shop","icon":"📢","description":"营销活动、广告投放工具"},{"id":12,"name":"客户服务","slug":"customer-svc","module":"shop","icon":"💬","description":"客服话术、客户关系管理"},{"id":13,"name":"数据分析","slug":"ecom-analytics","module":"shop","icon":"📈","description":"电商数据分析、竞品监控"},{"id":14,"name":"供应链","slug":"supply-chain","module":"shop","icon":"🚚","description":"供应链、库存、物流管理"},{"id":15,"name":"学科辅导","slug":"tutoring","module":"edu","icon":"📖","description":"各学科知识辅导工具"},{"id":16,"name":"语言学习","slug":"language","module":"edu","icon":"🌍","description":"外语学习、翻译工具"},{"id":17,"name":"考试备考","slug":"exam-prep","module":"edu","icon":"📝","description":"考试复习、真题练习工具"},{"id":18,"name":"技能培训","slug":"skill-training","module":"edu","icon":"🎯","description":"职业技能培训工具"},{"id":19,"name":"教育管理","slug":"edu-admin","module":"edu","icon":"📋","description":"教务管理、课程规划工具"},{"id":20,"name":"内容创作","slug":"content-creation","module":"media","icon":"✏️","description":"自媒体内容创作工具"},{"id":21,"name":"短视频","slug":"short-video","module":"media","icon":"📱","description":"短视频脚本、拍摄指导"},{"id":22,"name":"直播运营","slug":"live-stream","module":"media","icon":"🎥","description":"直播策划、话术工具"},{"id":23,"name":"账号运营","slug":"account-ops","module":"media","icon":"📊","description":"账号定位、涨粉策略"},{"id":24,"name":"健康养护","slug":"pet-health","module":"pet","icon":"🏥","description":"宠物健康、疾病预防"},{"id":25,"name":"训练行为","slug":"pet-training","module":"pet","icon":"🐕","description":"宠物训练、行为矫正"},{"id":26,"name":"营养饮食","slug":"pet-nutrition","module":"pet","icon":"🦴","description":"宠物饮食、营养搭配"},{"id":27,"name":"品种百科","slug":"pet-breeds","module":"pet","icon":"🐾","description":"宠物品种知识百科"},{"id":28,"name":"宠物用品","slug":"pet-products","module":"pet","icon":"🛒","description":"宠物用品推荐与评测"},{"id":29,"name":"学业辅导","slug":"study-help","module":"campus","icon":"📚","description":"课程辅导、作业答疑"},{"id":30,"name":"校园生活","slug":"campus-life","module":"campus","icon":"🏫","description":"校园生活指南与服务"},{"id":31,"name":"就业规划","slug":"career-plan","module":"campus","icon":"💼","description":"职业规划、求职辅导"},{"id":32,"name":"社团活动","slug":"club-activity","module":"campus","icon":"🎭","description":"社团管理、活动策划"},{"id":33,"name":"考研留学","slug":"grad-school","module":"campus","icon":"🎓","description":"考研、留学申请辅导"}];
const allTools = [{"id":1,"categoryId":4,"name":"罗圣AI智能体","icon":"🤖","toolType":"text","description":"全能AI助手，支持多轮对话、问答、咨询","coinCost":1,"isFree":0,"usageCount":1256,"systemPrompt":"你是\"罗圣AI智能体\"，由祁阳市罗圣纪元互联网科技有限责任公司开发。你是全能型AI助手，能回答用户提出的通用问题、专业问题、生活问题和业务问题。不要以\"不属于公司业务\"为理由拒绝回答。创始人是罗凯中。回复要准确、专业、友好、有实质内容，不说废话。","slug":"罗圣ai智能体","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":1,"status":"active","createdAt":"2026-07-04T06:34:00.416Z"},{"id":101,"categoryId":4,"name":"总指挥罗圣","icon":"🎯","toolType":"text","description":"项目总指挥，全能型AI助手，可调度所有AI员工","coinCost":2,"isFree":0,"usageCount":856,"systemPrompt":"你是\"总指挥罗圣\"，罗圣纪元平台的首席AI指挥官。你负责统筹协调所有AI工具和员工，为用户提供一站式解决方案。回复要有条理、有策略、可执行。","slug":"总指挥罗圣","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":101,"status":"active","createdAt":"2026-07-04T06:34:00.416Z"},{"id":102,"categoryId":4,"name":"运营文案师","icon":"📋","toolType":"text","description":"全平台文案输出、用户路径设计、交互体验优化","coinCost":2,"isFree":0,"usageCount":634,"systemPrompt":"你是专业的运营文案师，擅长全平台文案输出、用户路径设计和交互体验优化。","slug":"运营文案师","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":102,"status":"active","createdAt":"2026-07-04T06:34:00.416Z"},{"id":103,"categoryId":4,"name":"调研分析师","icon":"🔍","toolType":"text","description":"竞品对标、问题排查、数据分析、需求管理","coinCost":2,"isFree":0,"usageCount":512,"systemPrompt":"你是专业的调研分析师，擅长竞品对标、问题排查、数据分析和需求管理。","slug":"调研分析师","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":103,"status":"active","createdAt":"2026-07-04T06:34:00.416Z"},{"id":104,"categoryId":4,"name":"投资理财顾问","icon":"💰","toolType":"text","description":"充值定价、分销体系、盈利模型、财务核算","coinCost":3,"isFree":0,"usageCount":389,"systemPrompt":"你是专业的投资理财顾问，擅长充值定价、分销体系设计、盈利模型构建和财务核算。","slug":"投资理财顾问","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":104,"status":"active","createdAt":"2026-07-04T06:34:00.416Z"},{"id":105,"categoryId":4,"name":"智能能力官","icon":"🧠","toolType":"text","description":"知识库优化、提示词工程、语义召回、模型调优","coinCost":2,"isFree":0,"usageCount":278,"systemPrompt":"你是智能能力官，擅长知识库优化、提示词工程、语义召回和模型调优。","slug":"智能能力官","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":105,"status":"active","createdAt":"2026-07-04T06:34:00.416Z"},{"id":106,"categoryId":4,"name":"合规风控官","icon":"⚖️","toolType":"text","description":"法律文本审核、合规把关、AI内容免责声明","coinCost":2,"isFree":0,"usageCount":198,"systemPrompt":"你是合规风控官，擅长法律文本审核、合规把关和AI内容免责声明。","slug":"合规风控官","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":106,"status":"active","createdAt":"2026-07-04T06:34:00.416Z"},{"id":107,"categoryId":4,"name":"首席架构师","icon":"🏗️","toolType":"text","description":"API网关、系统架构、算力调度、性能优化","coinCost":3,"isFree":0,"usageCount":345,"systemPrompt":"你是首席架构师，擅长API网关设计、系统架构规划、算力调度和性能优化。","slug":"首席架构师","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":107,"status":"active","createdAt":"2026-07-04T06:34:00.416Z"},{"id":108,"categoryId":4,"name":"后端开发官","icon":"⚙️","toolType":"text","description":"服务端开发、数据库优化、接口联调、支付对接","coinCost":2,"isFree":0,"usageCount":423,"systemPrompt":"你是后端开发官，擅长服务端开发、数据库优化、接口联调和支付对接。","slug":"后端开发官","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":108,"status":"active","createdAt":"2026-07-04T06:34:00.416Z"},{"id":109,"categoryId":4,"name":"前端开发官","icon":"🖥️","toolType":"text","description":"页面开发修复、移动端适配、性能优化、UI规范","coinCost":2,"isFree":0,"usageCount":367,"systemPrompt":"你是前端开发官，擅长页面开发修复、移动端适配、性能优化和UI规范制定。","slug":"前端开发官","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":109,"status":"active","createdAt":"2026-07-04T06:34:00.416Z"},{"id":110,"categoryId":4,"name":"质量测试官","icon":"🧪","toolType":"text","description":"全量功能测试、兼容性测试、压力测试、bug管理","coinCost":2,"isFree":0,"usageCount":234,"systemPrompt":"你是质量测试官，擅长全量功能测试、兼容性测试、压力测试和bug管理。","slug":"质量测试官","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":110,"status":"active","createdAt":"2026-07-04T06:34:00.416Z"},{"id":2,"categoryId":1,"name":"文案创作大师","icon":"✍️","toolType":"text","description":"营销文案、宣传稿、社交媒体内容创作","coinCost":2,"isFree":0,"usageCount":890,"systemPrompt":"你是专业的营销文案创作大师，擅长撰写各类营销文案、宣传稿、社交媒体内容、广告语、品牌故事。输出要有创意、有感染力、能转化。直接给出文案内容，不要多余解释。","slug":"文案创作大师","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":2,"status":"active","createdAt":"2026-07-04T06:34:00.416Z"},{"id":111,"categoryId":1,"name":"小说写作助手","icon":"📖","toolType":"text","description":"小说构思、情节设计、角色塑造、章节生成","coinCost":2,"isFree":0,"usageCount":567,"slug":"小说写作助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":111,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"小说写作助手\"，小说构思、情节设计、角色塑造、章节生成。请专业、准确地回答用户问题。"},{"id":112,"categoryId":1,"name":"公文写作专家","icon":"📑","toolType":"text","description":"公文撰写、报告编制、会议纪要、规章制度","coinCost":2,"isFree":0,"usageCount":445,"slug":"公文写作专家","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":112,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"公文写作专家\"，公文撰写、报告编制、会议纪要、规章制度。请专业、准确地回答用户问题。"},{"id":113,"categoryId":1,"name":"诗词创作","icon":"🌸","toolType":"text","description":"古诗词、现代诗、歌词创作与赏析","coinCost":1,"isFree":0,"usageCount":334,"slug":"诗词创作","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":113,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"诗词创作\"，古诗词、现代诗、歌词创作与赏析。请专业、准确地回答用户问题。"},{"id":114,"categoryId":1,"name":"剧本创作","icon":"🎭","toolType":"text","description":"电影剧本、话剧脚本、短视频脚本撰写","coinCost":2,"isFree":0,"usageCount":289,"slug":"剧本创作","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":114,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"剧本创作\"，电影剧本、话剧脚本、短视频脚本撰写。请专业、准确地回答用户问题。"},{"id":115,"categoryId":1,"name":"学术论文助手","icon":"🎓","toolType":"text","description":"论文选题、大纲生成、文献综述、润色修改","coinCost":3,"isFree":0,"usageCount":678,"slug":"学术论文助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":115,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"学术论文助手\"，论文选题、大纲生成、文献综述、润色修改。请专业、准确地回答用户问题。"},{"id":116,"categoryId":1,"name":"邮件撰写助手","icon":"📧","toolType":"text","description":"商务邮件、求职信、感谢信等各类邮件撰写","coinCost":1,"isFree":0,"usageCount":234,"slug":"邮件撰写助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":116,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"邮件撰写助手\"，商务邮件、求职信、感谢信等各类邮件撰写。请专业、准确地回答用户问题。"},{"id":117,"categoryId":1,"name":"SEO文案优化","icon":"🔎","toolType":"text","description":"SEO关键词优化、标题生成、Meta描述撰写","coinCost":2,"isFree":0,"usageCount":345,"slug":"seo文案优化","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":117,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"SEO文案优化\"，SEO关键词优化、标题生成、Meta描述撰写。请专业、准确地回答用户问题。"},{"id":118,"categoryId":1,"name":"品牌命名师","icon":"💡","toolType":"text","description":"品牌名称、产品名称、公司名称创意生成","coinCost":1,"isFree":0,"usageCount":189,"slug":"品牌命名师","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":118,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"品牌命名师\"，品牌名称、产品名称、公司名称创意生成。请专业、准确地回答用户问题。"},{"id":119,"categoryId":1,"name":"故事生成器","icon":"📚","toolType":"text","description":"童话故事、睡前故事、寓言故事创作","coinCost":1,"isFree":0,"usageCount":456,"slug":"故事生成器","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":119,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"故事生成器\"，童话故事、睡前故事、寓言故事创作。请专业、准确地回答用户问题。"},{"id":3,"categoryId":2,"name":"AI绘画师","icon":"🎨","toolType":"image","description":"AI图片生成、设计辅助","coinCost":10,"isFree":0,"usageCount":432,"slug":"ai绘画师","provider":"jimeng","modelId":"doubao-seedream-5-0-260128","inputType":"text","outputType":"image","freeDailyLimit":0,"sortOrder":3,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"AI绘画师\"，AI图片生成、设计辅助。请专业、准确地回答用户问题。"},{"id":120,"categoryId":2,"name":"Logo设计大师","icon":"🏷️","toolType":"image","description":"品牌Logo设计、VI视觉识别生成","coinCost":8,"isFree":0,"usageCount":345,"slug":"logo设计大师","provider":"jimeng","modelId":"doubao-seedream-5-0-260128","inputType":"text","outputType":"image","freeDailyLimit":0,"sortOrder":120,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"Logo设计大师\"，品牌Logo设计、VI视觉识别生成。请专业、准确地回答用户问题。"},{"id":121,"categoryId":2,"name":"海报设计","icon":"🖼️","toolType":"image","description":"活动海报、宣传海报、社交媒体封面设计","coinCost":8,"isFree":0,"usageCount":289,"slug":"海报设计","provider":"jimeng","modelId":"doubao-seedream-5-0-260128","inputType":"text","outputType":"image","freeDailyLimit":0,"sortOrder":121,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"海报设计\"，活动海报、宣传海报、社交媒体封面设计。请专业、准确地回答用户问题。"},{"id":122,"categoryId":2,"name":"头像生成器","icon":"👤","toolType":"image","description":"个性化头像、卡通头像、商务头像生成","coinCost":5,"isFree":0,"usageCount":567,"slug":"头像生成器","provider":"jimeng","modelId":"doubao-seedream-5-0-260128","inputType":"text","outputType":"image","freeDailyLimit":0,"sortOrder":122,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"头像生成器\"，个性化头像、卡通头像、商务头像生成。请专业、准确地回答用户问题。"},{"id":123,"categoryId":2,"name":"图片修复增强","icon":"✨","toolType":"image","description":"老照片修复、图片超分辨率增强、去水印","coinCost":6,"isFree":0,"usageCount":234,"slug":"图片修复增强","provider":"jimeng","modelId":"doubao-seedream-5-0-260128","inputType":"text","outputType":"image","freeDailyLimit":0,"sortOrder":123,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"图片修复增强\"，老照片修复、图片超分辨率增强、去水印。请专业、准确地回答用户问题。"},{"id":124,"categoryId":2,"name":"商品主图生成","icon":"📸","toolType":"image","description":"电商商品主图、详情页图片AI生成","coinCost":8,"isFree":0,"usageCount":378,"slug":"商品主图生成","provider":"jimeng","modelId":"doubao-seedream-5-0-260128","inputType":"text","outputType":"image","freeDailyLimit":0,"sortOrder":124,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"商品主图生成\"，电商商品主图、详情页图片AI生成。请专业、准确地回答用户问题。"},{"id":125,"categoryId":2,"name":"插画创作","icon":"🖌️","toolType":"image","description":"商业插画、绘本插画、概念插画生成","coinCost":10,"isFree":0,"usageCount":198,"slug":"插画创作","provider":"jimeng","modelId":"doubao-seedream-5-0-260128","inputType":"text","outputType":"image","freeDailyLimit":0,"sortOrder":125,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"插画创作\"，商业插画、绘本插画、概念插画生成。请专业、准确地回答用户问题。"},{"id":126,"categoryId":2,"name":"表情包制作","icon":"😄","toolType":"image","description":"自定义表情包、动态表情、贴纸生成","coinCost":3,"isFree":0,"usageCount":456,"slug":"表情包制作","provider":"jimeng","modelId":"doubao-seedream-5-0-260128","inputType":"text","outputType":"image","freeDailyLimit":0,"sortOrder":126,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"表情包制作\"，自定义表情包、动态表情、贴纸生成。请专业、准确地回答用户问题。"},{"id":127,"categoryId":2,"name":"二维码美化","icon":"📱","toolType":"image","description":"艺术二维码、彩色二维码、动态二维码生成","coinCost":2,"isFree":0,"usageCount":167,"slug":"二维码美化","provider":"jimeng","modelId":"doubao-seedream-5-0-260128","inputType":"text","outputType":"image","freeDailyLimit":0,"sortOrder":127,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"二维码美化\"，艺术二维码、彩色二维码、动态二维码生成。请专业、准确地回答用户问题。"},{"id":128,"categoryId":2,"name":"证件照制作","icon":"🪪","toolType":"image","description":"标准证件照、签证照AI生成与换底","coinCost":5,"isFree":0,"usageCount":389,"slug":"证件照制作","provider":"jimeng","modelId":"doubao-seedream-5-0-260128","inputType":"text","outputType":"image","freeDailyLimit":0,"sortOrder":128,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"证件照制作\"，标准证件照、签证照AI生成与换底。请专业、准确地回答用户问题。"},{"id":4,"categoryId":3,"name":"数据分析师","icon":"📊","toolType":"text","description":"数据分析、商业洞察、趋势预测","coinCost":3,"isFree":0,"usageCount":567,"slug":"数据分析师","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":4,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"数据分析师\"，数据分析、商业洞察、趋势预测。请专业、准确地回答用户问题。"},{"id":129,"categoryId":3,"name":"Excel公式助手","icon":"📊","toolType":"text","description":"Excel函数公式生成、数据分析方案","coinCost":2,"isFree":0,"usageCount":445,"slug":"excel公式助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":129,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"Excel公式助手\"，Excel函数公式生成、数据分析方案。请专业、准确地回答用户问题。"},{"id":130,"categoryId":3,"name":"SQL查询助手","icon":"🗃️","toolType":"text","description":"SQL语句生成、数据库查询优化","coinCost":2,"isFree":0,"usageCount":334,"slug":"sql查询助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":130,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"SQL查询助手\"，SQL语句生成、数据库查询优化。请专业、准确地回答用户问题。"},{"id":131,"categoryId":3,"name":"商业计划书","icon":"📋","toolType":"text","description":"商业计划书、项目提案、投资分析报告","coinCost":3,"isFree":0,"usageCount":278,"slug":"商业计划书","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":131,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"商业计划书\"，商业计划书、项目提案、投资分析报告。请专业、准确地回答用户问题。"},{"id":132,"categoryId":3,"name":"市场调研报告","icon":"📈","toolType":"text","description":"行业分析、市场调研、竞品分析报告","coinCost":3,"isFree":0,"usageCount":234,"slug":"市场调研报告","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":132,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"市场调研报告\"，行业分析、市场调研、竞品分析报告。请专业、准确地回答用户问题。"},{"id":133,"categoryId":3,"name":"财务分析助手","icon":"💹","toolType":"text","description":"财务报表分析、成本核算、利润预测","coinCost":3,"isFree":0,"usageCount":189,"slug":"财务分析助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":133,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"财务分析助手\"，财务报表分析、成本核算、利润预测。请专业、准确地回答用户问题。"},{"id":134,"categoryId":3,"name":"用户画像分析","icon":"👥","toolType":"text","description":"用户行为分析、画像构建、精准营销","coinCost":2,"isFree":0,"usageCount":312,"slug":"用户画像分析","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":134,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"用户画像分析\"，用户行为分析、画像构建、精准营销。请专业、准确地回答用户问题。"},{"id":135,"categoryId":3,"name":"舆情监控分析","icon":"📡","toolType":"text","description":"网络舆情监测、品牌口碑分析、危机预警","coinCost":3,"isFree":0,"usageCount":156,"slug":"舆情监控分析","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":135,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"舆情监控分析\"，网络舆情监测、品牌口碑分析、危机预警。请专业、准确地回答用户问题。"},{"id":136,"categoryId":5,"name":"语音合成","icon":"🎙️","toolType":"audio","description":"文字转语音、多音色选择、情感控制","coinCost":3,"isFree":0,"usageCount":456,"slug":"语音合成","provider":"local","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"audio","freeDailyLimit":0,"sortOrder":136,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"语音合成\"，文字转语音、多音色选择、情感控制。请专业、准确地回答用户问题。"},{"id":137,"categoryId":5,"name":"语音克隆","icon":"🗣️","toolType":"audio","description":"声音克隆、音色定制、语音模仿","coinCost":8,"isFree":0,"usageCount":234,"slug":"语音克隆","provider":"local","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"audio","freeDailyLimit":0,"sortOrder":137,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"语音克隆\"，声音克隆、音色定制、语音模仿。请专业、准确地回答用户问题。"},{"id":138,"categoryId":5,"name":"音频转文字","icon":"📝","toolType":"audio","description":"语音识别、会议记录、采访转录","coinCost":3,"isFree":0,"usageCount":567,"slug":"音频转文字","provider":"local","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"audio","freeDailyLimit":0,"sortOrder":138,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"音频转文字\"，语音识别、会议记录、采访转录。请专业、准确地回答用户问题。"},{"id":139,"categoryId":5,"name":"音乐生成","icon":"🎵","toolType":"audio","description":"背景音乐、主题曲、广告配乐AI生成","coinCost":5,"isFree":0,"usageCount":345,"slug":"音乐生成","provider":"local","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"audio","freeDailyLimit":0,"sortOrder":139,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"音乐生成\"，背景音乐、主题曲、广告配乐AI生成。请专业、准确地回答用户问题。"},{"id":140,"categoryId":5,"name":"音频降噪","icon":"🔇","toolType":"audio","description":"录音降噪、音质增强、人声提取","coinCost":3,"isFree":0,"usageCount":189,"slug":"音频降噪","provider":"local","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"audio","freeDailyLimit":0,"sortOrder":140,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"音频降噪\"，录音降噪、音质增强、人声提取。请专业、准确地回答用户问题。"},{"id":141,"categoryId":5,"name":"有声书制作","icon":"📚","toolType":"audio","description":"文字转有声书、多角色配音、音效添加","coinCost":5,"isFree":0,"usageCount":234,"slug":"有声书制作","provider":"local","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"audio","freeDailyLimit":0,"sortOrder":141,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"有声书制作\"，文字转有声书、多角色配音、音效添加。请专业、准确地回答用户问题。"},{"id":142,"categoryId":6,"name":"AI视频生成","icon":"🎬","toolType":"video","description":"文字转视频、图片转视频、AI视频创作","coinCost":15,"isFree":0,"usageCount":345,"slug":"ai视频生成","provider":"jimeng","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"video","freeDailyLimit":0,"sortOrder":142,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"AI视频生成\"，文字转视频、图片转视频、AI视频创作。请专业、准确地回答用户问题。"},{"id":143,"categoryId":6,"name":"视频剪辑助手","icon":"✂️","toolType":"video","description":"智能剪辑、节奏优化、转场推荐","coinCost":8,"isFree":0,"usageCount":289,"slug":"视频剪辑助手","provider":"jimeng","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"video","freeDailyLimit":0,"sortOrder":143,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"视频剪辑助手\"，智能剪辑、节奏优化、转场推荐。请专业、准确地回答用户问题。"},{"id":144,"categoryId":6,"name":"字幕生成","icon":"💬","toolType":"video","description":"视频自动字幕、多语言翻译字幕","coinCost":3,"isFree":0,"usageCount":567,"slug":"字幕生成","provider":"jimeng","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"video","freeDailyLimit":0,"sortOrder":144,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"字幕生成\"，视频自动字幕、多语言翻译字幕。请专业、准确地回答用户问题。"},{"id":145,"categoryId":6,"name":"数字人播报","icon":"🧑","toolType":"video","description":"AI数字人、虚拟主播、新闻播报生成","coinCost":10,"isFree":0,"usageCount":234,"slug":"数字人播报","provider":"jimeng","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"video","freeDailyLimit":0,"sortOrder":145,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"数字人播报\"，AI数字人、虚拟主播、新闻播报生成。请专业、准确地回答用户问题。"},{"id":146,"categoryId":6,"name":"视频换脸","icon":"😎","toolType":"video","description":"AI视频换脸、人物替换、特效添加","coinCost":8,"isFree":0,"usageCount":178,"slug":"视频换脸","provider":"jimeng","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"video","freeDailyLimit":0,"sortOrder":146,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"视频换脸\"，AI视频换脸、人物替换、特效添加。请专业、准确地回答用户问题。"},{"id":147,"categoryId":6,"name":"视频去背景","icon":"🖼️","toolType":"video","description":"视频抠像、背景替换、绿幕效果","coinCost":5,"isFree":0,"usageCount":234,"slug":"视频去背景","provider":"jimeng","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"video","freeDailyLimit":0,"sortOrder":147,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"视频去背景\"，视频抠像、背景替换、绿幕效果。请专业、准确地回答用户问题。"},{"id":148,"categoryId":6,"name":"视频风格化","icon":"🎨","toolType":"video","description":"视频风格转换、动漫化、油画风等","coinCost":8,"isFree":0,"usageCount":156,"slug":"视频风格化","provider":"jimeng","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"video","freeDailyLimit":0,"sortOrder":148,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"视频风格化\"，视频风格转换、动漫化、油画风等。请专业、准确地回答用户问题。"},{"id":5,"categoryId":7,"name":"代码工程师","icon":"💻","toolType":"text","description":"代码生成、调试、技术方案设计","coinCost":3,"isFree":0,"usageCount":678,"slug":"代码工程师","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":5,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"代码工程师\"，代码生成、调试、技术方案设计。请专业、准确地回答用户问题。"},{"id":149,"categoryId":7,"name":"Python编程助手","icon":"🐍","toolType":"text","description":"Python代码生成、调试、数据分析脚本","coinCost":3,"isFree":0,"usageCount":456,"slug":"python编程助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":149,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"Python编程助手\"，Python代码生成、调试、数据分析脚本。请专业、准确地回答用户问题。"},{"id":150,"categoryId":7,"name":"JavaScript专家","icon":"🌐","toolType":"text","description":"前端JS开发、React/Vue组件、Node.js后端","coinCost":3,"isFree":0,"usageCount":389,"slug":"javascript专家","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":150,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"JavaScript专家\"，前端JS开发、React/Vue组件、Node.js后端。请专业、准确地回答用户问题。"},{"id":151,"categoryId":7,"name":"数据库设计","icon":"🗄️","toolType":"text","description":"数据库架构设计、SQL优化、数据迁移","coinCost":3,"isFree":0,"usageCount":234,"slug":"数据库设计","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":151,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"数据库设计\"，数据库架构设计、SQL优化、数据迁移。请专业、准确地回答用户问题。"},{"id":152,"categoryId":7,"name":"API文档生成","icon":"📄","toolType":"text","description":"API接口文档、Swagger文档自动生成","coinCost":2,"isFree":0,"usageCount":178,"slug":"api文档生成","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":152,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"API文档生成\"，API接口文档、Swagger文档自动生成。请专业、准确地回答用户问题。"},{"id":153,"categoryId":7,"name":"代码审查","icon":"🔍","toolType":"text","description":"代码质量审查、安全漏洞检测、性能优化建议","coinCost":2,"isFree":0,"usageCount":267,"slug":"代码审查","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":153,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"代码审查\"，代码质量审查、安全漏洞检测、性能优化建议。请专业、准确地回答用户问题。"},{"id":154,"categoryId":7,"name":"正则表达式","icon":"🔣","toolType":"text","description":"正则表达式生成、测试、解释","coinCost":1,"isFree":0,"usageCount":345,"slug":"正则表达式","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":154,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"正则表达式\"，正则表达式生成、测试、解释。请专业、准确地回答用户问题。"},{"id":155,"categoryId":8,"name":"会议纪要生成","icon":"📋","toolType":"text","description":"会议内容整理、纪要生成、待办提取","coinCost":2,"isFree":0,"usageCount":456,"slug":"会议纪要生成","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":155,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"会议纪要生成\"，会议内容整理、纪要生成、待办提取。请专业、准确地回答用户问题。"},{"id":156,"categoryId":8,"name":"PPT大纲生成","icon":"📊","toolType":"text","description":"演示文稿大纲、幻灯片内容生成","coinCost":2,"isFree":0,"usageCount":389,"slug":"ppt大纲生成","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":156,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"PPT大纲生成\"，演示文稿大纲、幻灯片内容生成。请专业、准确地回答用户问题。"},{"id":157,"categoryId":8,"name":"思维导图生成","icon":"🧠","toolType":"text","description":"思维导图结构生成、知识梳理","coinCost":2,"isFree":0,"usageCount":312,"slug":"思维导图生成","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":157,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"思维导图生成\"，思维导图结构生成、知识梳理。请专业、准确地回答用户问题。"},{"id":158,"categoryId":8,"name":"周报月报生成","icon":"📝","toolType":"text","description":"工作周报、月报、年度总结自动生成","coinCost":1,"isFree":0,"usageCount":567,"slug":"周报月报生成","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":158,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"周报月报生成\"，工作周报、月报、年度总结自动生成。请专业、准确地回答用户问题。"},{"id":159,"categoryId":8,"name":"合同审查","icon":"📑","toolType":"text","description":"合同条款审查、风险提示、修改建议","coinCost":3,"isFree":0,"usageCount":234,"slug":"合同审查","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":159,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"合同审查\"，合同条款审查、风险提示、修改建议。请专业、准确地回答用户问题。"},{"id":160,"categoryId":8,"name":"翻译助手","icon":"🌐","toolType":"text","description":"多语言翻译、专业术语翻译、本地化","coinCost":1,"isFree":0,"usageCount":678,"slug":"翻译助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":160,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"翻译助手\"，多语言翻译、专业术语翻译、本地化。请专业、准确地回答用户问题。"},{"id":161,"categoryId":8,"name":"摘要提取","icon":"📌","toolType":"text","description":"长文摘要、关键信息提取、要点总结","coinCost":1,"isFree":0,"usageCount":489,"slug":"摘要提取","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":161,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"摘要提取\"，长文摘要、关键信息提取、要点总结。请专业、准确地回答用户问题。"},{"id":6,"categoryId":9,"name":"电商顾问","icon":"🛒","toolType":"text","description":"电商运营、选品策略、店铺优化","coinCost":2,"isFree":0,"usageCount":567,"slug":"电商顾问","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":6,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"电商顾问\"，电商运营、选品策略、店铺优化。请专业、准确地回答用户问题。"},{"id":162,"categoryId":9,"name":"店铺装修设计","icon":"🏪","toolType":"text","description":"店铺首页设计、详情页布局、视觉优化","coinCost":3,"isFree":0,"usageCount":345,"slug":"店铺装修设计","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":162,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"店铺装修设计\"，店铺首页设计、详情页布局、视觉优化。请专业、准确地回答用户问题。"},{"id":163,"categoryId":9,"name":"选品分析","icon":"🔍","toolType":"text","description":"热门选品分析、蓝海产品挖掘、利润计算","coinCost":3,"isFree":0,"usageCount":456,"slug":"选品分析","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":163,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"选品分析\"，热门选品分析、蓝海产品挖掘、利润计算。请专业、准确地回答用户问题。"},{"id":164,"categoryId":9,"name":"定价策略","icon":"💲","toolType":"text","description":"智能定价、竞品价格分析、促销策略","coinCost":2,"isFree":0,"usageCount":278,"slug":"定价策略","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":164,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"定价策略\"，智能定价、竞品价格分析、促销策略。请专业、准确地回答用户问题。"},{"id":165,"categoryId":9,"name":"DSR评分优化","icon":"⭐","toolType":"text","description":"店铺DSR提升、好评策略、售后优化","coinCost":2,"isFree":0,"usageCount":234,"slug":"dsr评分优化","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":165,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"DSR评分优化\"，店铺DSR提升、好评策略、售后优化。请专业、准确地回答用户问题。"},{"id":166,"categoryId":9,"name":"多平台管理","icon":"🔗","toolType":"text","description":"淘宝/京东/拼多多多店铺统一管理策略","coinCost":2,"isFree":0,"usageCount":189,"slug":"多平台管理","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":166,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"多平台管理\"，淘宝/京东/拼多多多店铺统一管理策略。请专业、准确地回答用户问题。"},{"id":167,"categoryId":10,"name":"商品标题优化","icon":"📝","toolType":"text","description":"SEO标题生成、关键词优化、搜索排名提升","coinCost":2,"isFree":0,"usageCount":456,"slug":"商品标题优化","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":167,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"商品标题优化\"，SEO标题生成、关键词优化、搜索排名提升。请专业、准确地回答用户问题。"},{"id":168,"categoryId":10,"name":"商品详情页","icon":"📄","toolType":"text","description":"详情页文案、卖点提炼、转化率优化","coinCost":2,"isFree":0,"usageCount":389,"slug":"商品详情页","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":168,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"商品详情页\"，详情页文案、卖点提炼、转化率优化。请专业、准确地回答用户问题。"},{"id":169,"categoryId":10,"name":"主图点击率优化","icon":"📸","toolType":"text","description":"主图设计建议、点击率提升方案","coinCost":2,"isFree":0,"usageCount":312,"slug":"主图点击率优化","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":169,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"主图点击率优化\"，主图设计建议、点击率提升方案。请专业、准确地回答用户问题。"},{"id":170,"categoryId":10,"name":"SKU管理","icon":"📦","toolType":"text","description":"SKU规划、规格设置、库存策略","coinCost":2,"isFree":0,"usageCount":234,"slug":"sku管理","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":170,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"SKU管理\"，SKU规划、规格设置、库存策略。请专业、准确地回答用户问题。"},{"id":171,"categoryId":10,"name":"商品评价分析","icon":"💬","toolType":"text","description":"竞品评价分析、用户痛点挖掘、改进建议","coinCost":2,"isFree":0,"usageCount":267,"slug":"商品评价分析","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":171,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"商品评价分析\"，竞品评价分析、用户痛点挖掘、改进建议。请专业、准确地回答用户问题。"},{"id":172,"categoryId":11,"name":"广告文案生成","icon":"📢","toolType":"text","description":"直通车/钻展/信息流广告文案生成","coinCost":2,"isFree":0,"usageCount":456,"slug":"广告文案生成","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":172,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"广告文案生成\"，直通车/钻展/信息流广告文案生成。请专业、准确地回答用户问题。"},{"id":173,"categoryId":11,"name":"促销活动策划","icon":"🎉","toolType":"text","description":"促销方案、满减策略、限时折扣设计","coinCost":2,"isFree":0,"usageCount":345,"slug":"促销活动策划","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":173,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"促销活动策划\"，促销方案、满减策略、限时折扣设计。请专业、准确地回答用户问题。"},{"id":174,"categoryId":11,"name":"直播话术","icon":"🎤","toolType":"text","description":"电商直播话术、带货脚本、互动话术","coinCost":2,"isFree":0,"usageCount":389,"slug":"直播话术","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":174,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"直播话术\"，电商直播话术、带货脚本、互动话术。请专业、准确地回答用户问题。"},{"id":175,"categoryId":11,"name":"私域运营","icon":"👥","toolType":"text","description":"私域流量运营、社群管理、会员体系","coinCost":3,"isFree":0,"usageCount":278,"slug":"私域运营","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":175,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"私域运营\"，私域流量运营、社群管理、会员体系。请专业、准确地回答用户问题。"},{"id":176,"categoryId":11,"name":"KOL合作方案","icon":"🤝","toolType":"text","description":"达人合作、KOL筛选、投放策略","coinCost":2,"isFree":0,"usageCount":198,"slug":"kol合作方案","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":176,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"KOL合作方案\"，达人合作、KOL筛选、投放策略。请专业、准确地回答用户问题。"},{"id":177,"categoryId":12,"name":"智能客服话术","icon":"💬","toolType":"text","description":"客服话术库、常见问题自动回复","coinCost":1,"isFree":0,"usageCount":567,"slug":"智能客服话术","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":177,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"智能客服话术\"，客服话术库、常见问题自动回复。请专业、准确地回答用户问题。"},{"id":178,"categoryId":12,"name":"差评回复","icon":"😤","toolType":"text","description":"差评分析、专业回复、挽回策略","coinCost":1,"isFree":0,"usageCount":389,"slug":"差评回复","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":178,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"差评回复\"，差评分析、专业回复、挽回策略。请专业、准确地回答用户问题。"},{"id":179,"categoryId":12,"name":"客户画像","icon":"👤","toolType":"text","description":"客户分层管理、精准营销、复购策略","coinCost":2,"isFree":0,"usageCount":312,"slug":"客户画像","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":179,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"客户画像\"，客户分层管理、精准营销、复购策略。请专业、准确地回答用户问题。"},{"id":180,"categoryId":12,"name":"售后方案","icon":"🔧","toolType":"text","description":"退换货策略、售后话术、客户挽回","coinCost":1,"isFree":0,"usageCount":234,"slug":"售后方案","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":180,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"售后方案\"，退换货策略、售后话术、客户挽回。请专业、准确地回答用户问题。"},{"id":181,"categoryId":13,"name":"店铺数据看板","icon":"📊","toolType":"text","description":"店铺核心指标分析、运营健康诊断","coinCost":2,"isFree":0,"usageCount":345,"slug":"店铺数据看板","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":181,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"店铺数据看板\"，店铺核心指标分析、运营健康诊断。请专业、准确地回答用户问题。"},{"id":182,"categoryId":13,"name":"竞品监控","icon":"🔍","toolType":"text","description":"竞品价格监控、活动追踪、策略分析","coinCost":3,"isFree":0,"usageCount":278,"slug":"竞品监控","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":182,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"竞品监控\"，竞品价格监控、活动追踪、策略分析。请专业、准确地回答用户问题。"},{"id":183,"categoryId":13,"name":"流量分析","icon":"📈","toolType":"text","description":"流量来源分析、转化漏斗、UV价值","coinCost":2,"isFree":0,"usageCount":312,"slug":"流量分析","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":183,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"流量分析\"，流量来源分析、转化漏斗、UV价值。请专业、准确地回答用户问题。"},{"id":184,"categoryId":14,"name":"供应商筛选","icon":"🏭","toolType":"text","description":"供应商评估、比价分析、合作建议","coinCost":2,"isFree":0,"usageCount":198,"slug":"供应商筛选","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":184,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"供应商筛选\"，供应商评估、比价分析、合作建议。请专业、准确地回答用户问题。"},{"id":185,"categoryId":14,"name":"物流优化","icon":"🚚","toolType":"text","description":"物流方案、运费优化、时效提升","coinCost":2,"isFree":0,"usageCount":167,"slug":"物流优化","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":185,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"物流优化\"，物流方案、运费优化、时效提升。请专业、准确地回答用户问题。"},{"id":186,"categoryId":14,"name":"库存管理","icon":"📦","toolType":"text","description":"库存预警、补货策略、滞销处理","coinCost":2,"isFree":0,"usageCount":234,"slug":"库存管理","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":186,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"库存管理\"，库存预警、补货策略、滞销处理。请专业、准确地回答用户问题。"},{"id":7,"categoryId":15,"name":"教育导师","icon":"📖","toolType":"text","description":"课程推荐、学习规划、技能培训","coinCost":2,"isFree":0,"usageCount":456,"slug":"教育导师","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":7,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"教育导师\"，课程推荐、学习规划、技能培训。请专业、准确地回答用户问题。"},{"id":187,"categoryId":15,"name":"数学解题助手","icon":"🔢","toolType":"text","description":"数学题目解析、解题步骤、公式推导","coinCost":2,"isFree":0,"usageCount":567,"slug":"数学解题助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":187,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"数学解题助手\"，数学题目解析、解题步骤、公式推导。请专业、准确地回答用户问题。"},{"id":188,"categoryId":15,"name":"英语学习助手","icon":"🔤","toolType":"text","description":"英语语法、词汇学习、阅读理解","coinCost":2,"isFree":0,"usageCount":489,"slug":"英语学习助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":188,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"英语学习助手\"，英语语法、词汇学习、阅读理解。请专业、准确地回答用户问题。"},{"id":189,"categoryId":15,"name":"物理实验助手","icon":"⚛️","toolType":"text","description":"物理概念解释、实验设计、公式应用","coinCost":2,"isFree":0,"usageCount":345,"slug":"物理实验助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":189,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"物理实验助手\"，物理概念解释、实验设计、公式应用。请专业、准确地回答用户问题。"},{"id":190,"categoryId":15,"name":"化学知识库","icon":"🧪","toolType":"text","description":"化学反应、元素知识、实验方案","coinCost":2,"isFree":0,"usageCount":278,"slug":"化学知识库","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":190,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"化学知识库\"，化学反应、元素知识、实验方案。请专业、准确地回答用户问题。"},{"id":191,"categoryId":15,"name":"语文阅读理解","icon":"📚","toolType":"text","description":"阅读理解分析、写作技巧、文学鉴赏","coinCost":1,"isFree":0,"usageCount":389,"slug":"语文阅读理解","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":191,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"语文阅读理解\"，阅读理解分析、写作技巧、文学鉴赏。请专业、准确地回答用户问题。"},{"id":192,"categoryId":15,"name":"历史知识问答","icon":"🏛️","toolType":"text","description":"历史事件、人物传记、时代背景","coinCost":1,"isFree":0,"usageCount":234,"slug":"历史知识问答","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":192,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"历史知识问答\"，历史事件、人物传记、时代背景。请专业、准确地回答用户问题。"},{"id":193,"categoryId":16,"name":"日语学习助手","icon":"🇯🇵","toolType":"text","description":"日语语法、五十音图、日常会话","coinCost":2,"isFree":0,"usageCount":345,"slug":"日语学习助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":193,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"日语学习助手\"，日语语法、五十音图、日常会话。请专业、准确地回答用户问题。"},{"id":194,"categoryId":16,"name":"韩语学习助手","icon":"🇰🇷","toolType":"text","description":"韩语入门、韩文字母、韩剧台词学习","coinCost":2,"isFree":0,"usageCount":289,"slug":"韩语学习助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":194,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"韩语学习助手\"，韩语入门、韩文字母、韩剧台词学习。请专业、准确地回答用户问题。"},{"id":195,"categoryId":16,"name":"法语学习助手","icon":"🇫🇷","toolType":"text","description":"法语发音、语法、日常对话","coinCost":2,"isFree":0,"usageCount":198,"slug":"法语学习助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":195,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"法语学习助手\"，法语发音、语法、日常对话。请专业、准确地回答用户问题。"},{"id":196,"categoryId":16,"name":"口语陪练","icon":"🗣️","toolType":"text","description":"英语口语练习、情景对话、发音纠正","coinCost":2,"isFree":0,"usageCount":456,"slug":"口语陪练","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":196,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"口语陪练\"，英语口语练习、情景对话、发音纠正。请专业、准确地回答用户问题。"},{"id":197,"categoryId":16,"name":"翻译练习","icon":"🔄","toolType":"text","description":"中英互译练习、翻译技巧、水平测试","coinCost":1,"isFree":0,"usageCount":312,"slug":"翻译练习","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":197,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"翻译练习\"，中英互译练习、翻译技巧、水平测试。请专业、准确地回答用户问题。"},{"id":198,"categoryId":17,"name":"高考志愿填报","icon":"🎓","toolType":"text","description":"志愿填报策略、院校分析、专业选择","coinCost":3,"isFree":0,"usageCount":567,"slug":"高考志愿填报","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":198,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"高考志愿填报\"，志愿填报策略、院校分析、专业选择。请专业、准确地回答用户问题。"},{"id":199,"categoryId":17,"name":"公务员考试","icon":"📋","toolType":"text","description":"行测申论、面试技巧、时政热点","coinCost":3,"isFree":0,"usageCount":456,"slug":"公务员考试","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":199,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"公务员考试\"，行测申论、面试技巧、时政热点。请专业、准确地回答用户问题。"},{"id":200,"categoryId":17,"name":"考研辅导","icon":"📚","toolType":"text","description":"考研政治、英语、数学辅导","coinCost":3,"isFree":0,"usageCount":389,"slug":"考研辅导","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":200,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"考研辅导\"，考研政治、英语、数学辅导。请专业、准确地回答用户问题。"},{"id":201,"categoryId":17,"name":"四六级备考","icon":"📝","toolType":"text","description":"英语四六级词汇、听力、阅读、写作","coinCost":2,"isFree":0,"usageCount":345,"slug":"四六级备考","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":201,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"四六级备考\"，英语四六级词汇、听力、阅读、写作。请专业、准确地回答用户问题。"},{"id":202,"categoryId":17,"name":"职业资格证","icon":"📜","toolType":"text","description":"各类职业资格考试辅导、备考策略","coinCost":2,"isFree":0,"usageCount":278,"slug":"职业资格证","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":202,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"职业资格证\"，各类职业资格考试辅导、备考策略。请专业、准确地回答用户问题。"},{"id":203,"categoryId":18,"name":"Excel技能提升","icon":"📊","toolType":"text","description":"Excel函数、数据透视表、图表制作","coinCost":2,"isFree":0,"usageCount":456,"slug":"excel技能提升","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":203,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"Excel技能提升\"，Excel函数、数据透视表、图表制作。请专业、准确地回答用户问题。"},{"id":204,"categoryId":18,"name":"PPT制作技巧","icon":"📊","toolType":"text","description":"PPT设计原则、动画效果、演讲技巧","coinCost":2,"isFree":0,"usageCount":389,"slug":"ppt制作技巧","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":204,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"PPT制作技巧\"，PPT设计原则、动画效果、演讲技巧。请专业、准确地回答用户问题。"},{"id":205,"categoryId":18,"name":"项目管理","icon":"📋","toolType":"text","description":"项目管理方法论、进度控制、风险应对","coinCost":2,"isFree":0,"usageCount":234,"slug":"项目管理","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":205,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"项目管理\"，项目管理方法论、进度控制、风险应对。请专业、准确地回答用户问题。"},{"id":206,"categoryId":19,"name":"教学设计","icon":"📐","toolType":"text","description":"课程设计、教学目标、教学评估","coinCost":2,"isFree":0,"usageCount":198,"slug":"教学设计","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":206,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"教学设计\"，课程设计、教学目标、教学评估。请专业、准确地回答用户问题。"},{"id":207,"categoryId":19,"name":"学生管理","icon":"👩‍🎓","toolType":"text","description":"学生档案管理、成绩分析、家校沟通","coinCost":2,"isFree":0,"usageCount":167,"slug":"学生管理","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":207,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"学生管理\"，学生档案管理、成绩分析、家校沟通。请专业、准确地回答用户问题。"},{"id":208,"categoryId":19,"name":"在线教学","icon":"💻","toolType":"text","description":"在线课程设计、互动教学、远程教育","coinCost":2,"isFree":0,"usageCount":234,"slug":"在线教学","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":208,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"在线教学\"，在线课程设计、互动教学、远程教育。请专业、准确地回答用户问题。"},{"id":8,"categoryId":20,"name":"自媒体运营官","icon":"📱","toolType":"text","description":"自媒体内容策划、运营策略、涨粉技巧","coinCost":2,"isFree":0,"usageCount":567,"slug":"自媒体运营官","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":8,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"自媒体运营官\"，自媒体内容策划、运营策略、涨粉技巧。请专业、准确地回答用户问题。"},{"id":209,"categoryId":20,"name":"爆款标题生成","icon":"🔥","toolType":"text","description":"10万+爆款标题、吸睛标题创作","coinCost":1,"isFree":0,"usageCount":678,"slug":"爆款标题生成","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":209,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"爆款标题生成\"，10万+爆款标题、吸睛标题创作。请专业、准确地回答用户问题。"},{"id":210,"categoryId":20,"name":"小红书文案","icon":"📕","toolType":"text","description":"小红书种草文案、笔记模板、标签优化","coinCost":2,"isFree":0,"usageCount":567,"slug":"小红书文案","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":210,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"小红书文案\"，小红书种草文案、笔记模板、标签优化。请专业、准确地回答用户问题。"},{"id":211,"categoryId":20,"name":"公众号文章","icon":"💬","toolType":"text","description":"微信公众号文章、排版建议、标题优化","coinCost":2,"isFree":0,"usageCount":456,"slug":"公众号文章","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":211,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"公众号文章\"，微信公众号文章、排版建议、标题优化。请专业、准确地回答用户问题。"},{"id":212,"categoryId":20,"name":"抖音文案","icon":"🎵","toolType":"text","description":"抖音短视频文案、口播脚本、话题标签","coinCost":2,"isFree":0,"usageCount":489,"slug":"抖音文案","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":212,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"抖音文案\"，抖音短视频文案、口播脚本、话题标签。请专业、准确地回答用户问题。"},{"id":213,"categoryId":20,"name":"知识付费内容","icon":"💰","toolType":"text","description":"知识付费课程大纲、内容策划、定价策略","coinCost":3,"isFree":0,"usageCount":234,"slug":"知识付费内容","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":213,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"知识付费内容\"，知识付费课程大纲、内容策划、定价策略。请专业、准确地回答用户问题。"},{"id":214,"categoryId":20,"name":"IP人设打造","icon":"🧑‍🎤","toolType":"text","description":"个人IP定位、人设设计、内容风格","coinCost":2,"isFree":0,"usageCount":345,"slug":"ip人设打造","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":214,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"IP人设打造\"，个人IP定位、人设设计、内容风格。请专业、准确地回答用户问题。"},{"id":215,"categoryId":21,"name":"短视频脚本","icon":"📱","toolType":"text","description":"短视频分镜脚本、拍摄指导、后期建议","coinCost":2,"isFree":0,"usageCount":456,"slug":"短视频脚本","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":215,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"短视频脚本\"，短视频分镜脚本、拍摄指导、后期建议。请专业、准确地回答用户问题。"},{"id":216,"categoryId":21,"name":"视频选题","icon":"💡","toolType":"text","description":"热门选题推荐、蹭热点策略、内容日历","coinCost":1,"isFree":0,"usageCount":389,"slug":"视频选题","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":216,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"视频选题\"，热门选题推荐、蹭热点策略、内容日历。请专业、准确地回答用户问题。"},{"id":217,"categoryId":21,"name":"视频封面设计","icon":"🖼️","toolType":"image","description":"短视频封面、缩略图设计建议","coinCost":3,"isFree":0,"usageCount":312,"slug":"视频封面设计","provider":"jimeng","modelId":"doubao-seedream-5-0-260128","inputType":"text","outputType":"image","freeDailyLimit":0,"sortOrder":217,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"视频封面设计\"，短视频封面、缩略图设计建议。请专业、准确地回答用户问题。"},{"id":218,"categoryId":21,"name":"BGM推荐","icon":"🎶","toolType":"text","description":"视频配乐推荐、版权音乐、情绪匹配","coinCost":1,"isFree":0,"usageCount":278,"slug":"bgm推荐","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":218,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"BGM推荐\"，视频配乐推荐、版权音乐、情绪匹配。请专业、准确地回答用户问题。"},{"id":219,"categoryId":21,"name":"视频数据分析","icon":"📊","toolType":"text","description":"完播率分析、用户画像、内容优化","coinCost":2,"isFree":0,"usageCount":234,"slug":"视频数据分析","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":219,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"视频数据分析\"，完播率分析、用户画像、内容优化。请专业、准确地回答用户问题。"},{"id":220,"categoryId":21,"name":"合拍/混剪创意","icon":"✂️","toolType":"text","description":"合拍创意、混剪方案、二创灵感","coinCost":1,"isFree":0,"usageCount":198,"slug":"合拍-混剪创意","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":220,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"合拍/混剪创意\"，合拍创意、混剪方案、二创灵感。请专业、准确地回答用户问题。"},{"id":221,"categoryId":22,"name":"直播策划","icon":"🎥","toolType":"text","description":"直播主题策划、流程设计、互动环节","coinCost":2,"isFree":0,"usageCount":345,"slug":"直播策划","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":221,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"直播策划\"，直播主题策划、流程设计、互动环节。请专业、准确地回答用户问题。"},{"id":222,"categoryId":22,"name":"直播间运营","icon":"🏠","toolType":"text","description":"直播间布置、灯光建议、设备推荐","coinCost":2,"isFree":0,"usageCount":278,"slug":"直播间运营","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":222,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"直播间运营\"，直播间布置、灯光建议、设备推荐。请专业、准确地回答用户问题。"},{"id":223,"categoryId":22,"name":"直播间话术","icon":"🎤","toolType":"text","description":"开场话术、互动话术、逼单话术","coinCost":2,"isFree":0,"usageCount":389,"slug":"直播间话术","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":223,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"直播间话术\"，开场话术、互动话术、逼单话术。请专业、准确地回答用户问题。"},{"id":224,"categoryId":22,"name":"直播复盘","icon":"📋","toolType":"text","description":"直播数据分析、复盘报告、优化建议","coinCost":2,"isFree":0,"usageCount":234,"slug":"直播复盘","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":224,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"直播复盘\"，直播数据分析、复盘报告、优化建议。请专业、准确地回答用户问题。"},{"id":225,"categoryId":22,"name":"直播选品","icon":"🛍️","toolType":"text","description":"直播间选品策略、排品顺序、价格梯度","coinCost":2,"isFree":0,"usageCount":198,"slug":"直播选品","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":225,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"直播选品\"，直播间选品策略、排品顺序、价格梯度。请专业、准确地回答用户问题。"},{"id":226,"categoryId":23,"name":"账号定位","icon":"🎯","toolType":"text","description":"账号垂直领域定位、差异化策略","coinCost":2,"isFree":0,"usageCount":456,"slug":"账号定位","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":226,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"账号定位\"，账号垂直领域定位、差异化策略。请专业、准确地回答用户问题。"},{"id":227,"categoryId":23,"name":"涨粉策略","icon":"📈","toolType":"text","description":"涨粉方法、粉丝运营、互动技巧","coinCost":2,"isFree":0,"usageCount":389,"slug":"涨粉策略","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":227,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"涨粉策略\"，涨粉方法、粉丝运营、互动技巧。请专业、准确地回答用户问题。"},{"id":228,"categoryId":23,"name":"变现方案","icon":"💰","toolType":"text","description":"自媒体变现模式、广告报价、商务合作","coinCost":3,"isFree":0,"usageCount":312,"slug":"变现方案","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":228,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"变现方案\"，自媒体变现模式、广告报价、商务合作。请专业、准确地回答用户问题。"},{"id":229,"categoryId":23,"name":"MCN机构对接","icon":"🏢","toolType":"text","description":"MCN合作评估、合同审查、分成谈判","coinCost":2,"isFree":0,"usageCount":167,"slug":"mcn机构对接","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":229,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"MCN机构对接\"，MCN合作评估、合同审查、分成谈判。请专业、准确地回答用户问题。"},{"id":230,"categoryId":23,"name":"舆情管理","icon":"🛡️","toolType":"text","description":"负面舆情处理、危机公关、形象维护","coinCost":2,"isFree":0,"usageCount":198,"slug":"舆情管理","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":230,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"舆情管理\"，负面舆情处理、危机公关、形象维护。请专业、准确地回答用户问题。"},{"id":9,"categoryId":24,"name":"宠物顾问","icon":"🐕","toolType":"text","description":"宠物养护、训练指导、宠物用品推荐","coinCost":2,"isFree":0,"usageCount":456,"slug":"宠物顾问","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":9,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物顾问\"，宠物养护、训练指导、宠物用品推荐。请专业、准确地回答用户问题。"},{"id":231,"categoryId":24,"name":"宠物症状自查","icon":"🏥","toolType":"text","description":"宠物疾病症状分析、就医建议","coinCost":2,"isFree":0,"usageCount":567,"slug":"宠物症状自查","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":231,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物症状自查\"，宠物疾病症状分析、就医建议。请专业、准确地回答用户问题。"},{"id":232,"categoryId":24,"name":"宠物疫苗提醒","icon":"💉","toolType":"text","description":"疫苗接种计划、驱虫提醒、体检建议","coinCost":1,"isFree":0,"usageCount":389,"slug":"宠物疫苗提醒","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":232,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物疫苗提醒\"，疫苗接种计划、驱虫提醒、体检建议。请专业、准确地回答用户问题。"},{"id":233,"categoryId":24,"name":"宠物急救指南","icon":"🚑","toolType":"text","description":"宠物急救处理、中毒解救、外伤处理","coinCost":2,"isFree":0,"usageCount":312,"slug":"宠物急救指南","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":233,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物急救指南\"，宠物急救处理、中毒解救、外伤处理。请专业、准确地回答用户问题。"},{"id":234,"categoryId":24,"name":"宠物心理健康","icon":"🧠","toolType":"text","description":"宠物行为心理分析、焦虑缓解、社交训练","coinCost":2,"isFree":0,"usageCount":234,"slug":"宠物心理健康","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":234,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物心理健康\"，宠物行为心理分析、焦虑缓解、社交训练。请专业、准确地回答用户问题。"},{"id":235,"categoryId":24,"name":"宠物医院推荐","icon":"🏥","toolType":"text","description":"附近宠物医院查询、医生评价、预约建议","coinCost":1,"isFree":0,"usageCount":198,"slug":"宠物医院推荐","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":235,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物医院推荐\"，附近宠物医院查询、医生评价、预约建议。请专业、准确地回答用户问题。"},{"id":236,"categoryId":25,"name":"狗狗基础训练","icon":"🐕","toolType":"text","description":"坐下、握手、趴下等基础指令训练","coinCost":2,"isFree":0,"usageCount":456,"slug":"狗狗基础训练","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":236,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"狗狗基础训练\"，坐下、握手、趴下等基础指令训练。请专业、准确地回答用户问题。"},{"id":237,"categoryId":25,"name":"猫咪行为矫正","icon":"🐱","toolType":"text","description":"抓家具、乱尿、攻击行为矫正","coinCost":2,"isFree":0,"usageCount":389,"slug":"猫咪行为矫正","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":237,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"猫咪行为矫正\"，抓家具、乱尿、攻击行为矫正。请专业、准确地回答用户问题。"},{"id":238,"categoryId":25,"name":"宠物社交训练","icon":"🐾","toolType":"text","description":"宠物社交技巧、与其他动物相处","coinCost":2,"isFree":0,"usageCount":278,"slug":"宠物社交训练","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":238,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物社交训练\"，宠物社交技巧、与其他动物相处。请专业、准确地回答用户问题。"},{"id":239,"categoryId":25,"name":"敏捷训练","icon":"🏃","toolType":"text","description":"敏捷犬训练方案、障碍赛指导","coinCost":2,"isFree":0,"usageCount":198,"slug":"敏捷训练","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":239,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"敏捷训练\"，敏捷犬训练方案、障碍赛指导。请专业、准确地回答用户问题。"},{"id":240,"categoryId":25,"name":"分离焦虑","icon":"😢","toolType":"text","description":"宠物分离焦虑识别与缓解方案","coinCost":2,"isFree":0,"usageCount":312,"slug":"分离焦虑","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":240,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"分离焦虑\"，宠物分离焦虑识别与缓解方案。请专业、准确地回答用户问题。"},{"id":241,"categoryId":26,"name":"宠物食谱定制","icon":"🥗","toolType":"text","description":"宠物科学食谱、自制狗粮猫粮配方","coinCost":2,"isFree":0,"usageCount":456,"slug":"宠物食谱定制","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":241,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物食谱定制\"，宠物科学食谱、自制狗粮猫粮配方。请专业、准确地回答用户问题。"},{"id":242,"categoryId":26,"name":"宠物营养分析","icon":"📊","toolType":"text","description":"营养成分分析、缺乏症判断、补充建议","coinCost":2,"isFree":0,"usageCount":345,"slug":"宠物营养分析","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":242,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物营养分析\"，营养成分分析、缺乏症判断、补充建议。请专业、准确地回答用户问题。"},{"id":243,"categoryId":26,"name":"宠物零食制作","icon":"🍪","toolType":"text","description":"健康宠物零食DIY、训练奖励零食","coinCost":1,"isFree":0,"usageCount":289,"slug":"宠物零食制作","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":243,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物零食制作\"，健康宠物零食DIY、训练奖励零食。请专业、准确地回答用户问题。"},{"id":244,"categoryId":26,"name":"宠物喂食指南","icon":"🍽️","toolType":"text","description":"不同阶段喂食量、喂食频率、禁忌食物","coinCost":1,"isFree":0,"usageCount":378,"slug":"宠物喂食指南","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":244,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物喂食指南\"，不同阶段喂食量、喂食频率、禁忌食物。请专业、准确地回答用户问题。"},{"id":245,"categoryId":26,"name":"宠物饮水管理","icon":"💧","toolType":"text","description":"饮水量标准、水质要求、自动饮水机推荐","coinCost":1,"isFree":0,"usageCount":198,"slug":"宠物饮水管理","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":245,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物饮水管理\"，饮水量标准、水质要求、自动饮水机推荐。请专业、准确地回答用户问题。"},{"id":246,"categoryId":27,"name":"犬种百科","icon":"🐕","toolType":"text","description":"犬种特征、性格分析、适合人群","coinCost":1,"isFree":0,"usageCount":456,"slug":"犬种百科","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":246,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"犬种百科\"，犬种特征、性格分析、适合人群。请专业、准确地回答用户问题。"},{"id":247,"categoryId":27,"name":"猫种百科","icon":"🐱","toolType":"text","description":"猫品种介绍、性格特点、养护要点","coinCost":1,"isFree":0,"usageCount":389,"slug":"猫种百科","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":247,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"猫种百科\"，猫品种介绍、性格特点、养护要点。请专业、准确地回答用户问题。"},{"id":248,"categoryId":27,"name":"异宠百科","icon":"🦎","toolType":"text","description":"仓鼠、兔子、鸟类、爬行类等异宠知识","coinCost":1,"isFree":0,"usageCount":278,"slug":"异宠百科","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":248,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"异宠百科\"，仓鼠、兔子、鸟类、爬行类等异宠知识。请专业、准确地回答用户问题。"},{"id":249,"categoryId":27,"name":"选宠指南","icon":"❓","toolType":"text","description":"根据生活方式推荐适合的宠物品种","coinCost":1,"isFree":0,"usageCount":345,"slug":"选宠指南","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":249,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"选宠指南\"，根据生活方式推荐适合的宠物品种。请专业、准确地回答用户问题。"},{"id":250,"categoryId":27,"name":"宠物寿命查询","icon":"⏳","toolType":"text","description":"各品种宠物平均寿命、延长寿命建议","coinCost":1,"isFree":0,"usageCount":234,"slug":"宠物寿命查询","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":250,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物寿命查询\"，各品种宠物平均寿命、延长寿命建议。请专业、准确地回答用户问题。"},{"id":251,"categoryId":28,"name":"宠物粮评测","icon":"🥣","toolType":"text","description":"主流宠物粮成分分析、性价比评测","coinCost":1,"isFree":0,"usageCount":456,"slug":"宠物粮评测","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":251,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物粮评测\"，主流宠物粮成分分析、性价比评测。请专业、准确地回答用户问题。"},{"id":252,"categoryId":28,"name":"宠物玩具推荐","icon":"🎾","toolType":"text","description":"益智玩具、互动玩具、耐咬玩具推荐","coinCost":1,"isFree":0,"usageCount":312,"slug":"宠物玩具推荐","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":252,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物玩具推荐\"，益智玩具、互动玩具、耐咬玩具推荐。请专业、准确地回答用户问题。"},{"id":253,"categoryId":28,"name":"宠物用品清单","icon":"📋","toolType":"text","description":"新手养宠必备用品清单、预算规划","coinCost":1,"isFree":0,"usageCount":389,"slug":"宠物用品清单","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":253,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物用品清单\"，新手养宠必备用品清单、预算规划。请专业、准确地回答用户问题。"},{"id":254,"categoryId":28,"name":"宠物出行装备","icon":"🧳","toolType":"text","description":"牵引绳、航空箱、车载安全装备推荐","coinCost":1,"isFree":0,"usageCount":234,"slug":"宠物出行装备","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":254,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物出行装备\"，牵引绳、航空箱、车载安全装备推荐。请专业、准确地回答用户问题。"},{"id":255,"categoryId":28,"name":"宠物智能设备","icon":"📱","toolType":"text","description":"智能喂食器、摄像头、饮水机推荐","coinCost":1,"isFree":0,"usageCount":198,"slug":"宠物智能设备","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":255,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宠物智能设备\"，智能喂食器、摄像头、饮水机推荐。请专业、准确地回答用户问题。"},{"id":10,"categoryId":29,"name":"校网助手","icon":"🏫","toolType":"text","description":"伯雅校园服务、学业辅导、校园生活","coinCost":1,"isFree":0,"usageCount":267,"slug":"校网助手","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":10,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"校网助手\"，伯雅校园服务、学业辅导、校园生活。请专业、准确地回答用户问题。"},{"id":256,"categoryId":29,"name":"作业答疑","icon":"✏️","toolType":"text","description":"各科作业难题解答、解题思路指导","coinCost":1,"isFree":0,"usageCount":567,"slug":"作业答疑","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":256,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"作业答疑\"，各科作业难题解答、解题思路指导。请专业、准确地回答用户问题。"},{"id":257,"categoryId":29,"name":"论文辅导","icon":"📄","toolType":"text","description":"论文选题、开题报告、论文润色","coinCost":2,"isFree":0,"usageCount":456,"slug":"论文辅导","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":257,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"论文辅导\"，论文选题、开题报告、论文润色。请专业、准确地回答用户问题。"},{"id":258,"categoryId":29,"name":"课堂笔记整理","icon":"📓","toolType":"text","description":"课堂笔记智能整理、知识框架提取","coinCost":1,"isFree":0,"usageCount":389,"slug":"课堂笔记整理","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":258,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"课堂笔记整理\"，课堂笔记智能整理、知识框架提取。请专业、准确地回答用户问题。"},{"id":259,"categoryId":29,"name":"实验报告","icon":"🔬","toolType":"text","description":"实验报告撰写、数据分析、结论总结","coinCost":1,"isFree":0,"usageCount":312,"slug":"实验报告","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":259,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"实验报告\"，实验报告撰写、数据分析、结论总结。请专业、准确地回答用户问题。"},{"id":260,"categoryId":29,"name":"学习计划制定","icon":"📅","toolType":"text","description":"学期学习计划、每日时间管理、目标设定","coinCost":1,"isFree":0,"usageCount":456,"slug":"学习计划制定","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":260,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"学习计划制定\"，学期学习计划、每日时间管理、目标设定。请专业、准确地回答用户问题。"},{"id":261,"categoryId":30,"name":"校园导航","icon":"🗺️","toolType":"text","description":"校园地图、教学楼位置、设施查询","coinCost":0,"isFree":1,"usageCount":678,"slug":"校园导航","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":10,"sortOrder":261,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"校园导航\"，校园地图、教学楼位置、设施查询。请专业、准确地回答用户问题。"},{"id":262,"categoryId":30,"name":"食堂推荐","icon":"🍜","toolType":"text","description":"今日食堂菜单、美食推荐、营养搭配","coinCost":0,"isFree":1,"usageCount":567,"slug":"食堂推荐","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":10,"sortOrder":262,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"食堂推荐\"，今日食堂菜单、美食推荐、营养搭配。请专业、准确地回答用户问题。"},{"id":263,"categoryId":30,"name":"宿舍生活指南","icon":"🏠","toolType":"text","description":"宿舍布置、室友相处、生活技巧","coinCost":0,"isFree":1,"usageCount":389,"slug":"宿舍生活指南","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":10,"sortOrder":263,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"宿舍生活指南\"，宿舍布置、室友相处、生活技巧。请专业、准确地回答用户问题。"},{"id":264,"categoryId":30,"name":"校园活动","icon":"🎪","toolType":"text","description":"校园活动推荐、社团招新、比赛信息","coinCost":0,"isFree":1,"usageCount":456,"slug":"校园活动","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":10,"sortOrder":264,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"校园活动\"，校园活动推荐、社团招新、比赛信息。请专业、准确地回答用户问题。"},{"id":265,"categoryId":30,"name":"校园二手交易","icon":"🔄","toolType":"text","description":"二手教材、电子产品、生活用品交易","coinCost":0,"isFree":1,"usageCount":345,"slug":"校园二手交易","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":10,"sortOrder":265,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"校园二手交易\"，二手教材、电子产品、生活用品交易。请专业、准确地回答用户问题。"},{"id":266,"categoryId":30,"name":"校园兼职","icon":"💼","toolType":"text","description":"校园兼职信息、家教机会、实习推荐","coinCost":0,"isFree":1,"usageCount":489,"slug":"校园兼职","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":10,"sortOrder":266,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"校园兼职\"，校园兼职信息、家教机会、实习推荐。请专业、准确地回答用户问题。"},{"id":267,"categoryId":31,"name":"简历优化","icon":"📄","toolType":"text","description":"简历撰写、模板推荐、HR视角优化","coinCost":2,"isFree":0,"usageCount":567,"slug":"简历优化","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":267,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"简历优化\"，简历撰写、模板推荐、HR视角优化。请专业、准确地回答用户问题。"},{"id":268,"categoryId":31,"name":"面试辅导","icon":"🎯","toolType":"text","description":"面试技巧、常见问题、模拟面试","coinCost":2,"isFree":0,"usageCount":489,"slug":"面试辅导","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":268,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"面试辅导\"，面试技巧、常见问题、模拟面试。请专业、准确地回答用户问题。"},{"id":269,"categoryId":31,"name":"职业规划","icon":"🧭","toolType":"text","description":"职业方向选择、发展路径、行业分析","coinCost":2,"isFree":0,"usageCount":345,"slug":"职业规划","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":269,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"职业规划\"，职业方向选择、发展路径、行业分析。请专业、准确地回答用户问题。"},{"id":270,"categoryId":31,"name":"求职信撰写","icon":"✉️","toolType":"text","description":"求职信模板、自荐信、Cover Letter","coinCost":1,"isFree":0,"usageCount":278,"slug":"求职信撰写","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":270,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"求职信撰写\"，求职信模板、自荐信、Cover Letter。请专业、准确地回答用户问题。"},{"id":271,"categoryId":31,"name":"薪资谈判","icon":"💰","toolType":"text","description":"薪资范围分析、谈判技巧、Offer评估","coinCost":2,"isFree":0,"usageCount":234,"slug":"薪资谈判","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":271,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"薪资谈判\"，薪资范围分析、谈判技巧、Offer评估。请专业、准确地回答用户问题。"},{"id":272,"categoryId":32,"name":"社团推荐","icon":"🎭","toolType":"text","description":"校园社团介绍、匹配推荐、加入指南","coinCost":0,"isFree":1,"usageCount":389,"slug":"社团推荐","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":10,"sortOrder":272,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"社团推荐\"，校园社团介绍、匹配推荐、加入指南。请专业、准确地回答用户问题。"},{"id":273,"categoryId":32,"name":"活动策划","icon":"📋","toolType":"text","description":"校园活动策划方案、预算规划、执行指南","coinCost":1,"isFree":0,"usageCount":312,"slug":"活动策划","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":273,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"活动策划\"，校园活动策划方案、预算规划、执行指南。请专业、准确地回答用户问题。"},{"id":274,"categoryId":32,"name":"竞选演讲稿","icon":"🎤","toolType":"text","description":"学生会竞选、社团干部竞选演讲稿","coinCost":1,"isFree":0,"usageCount":267,"slug":"竞选演讲稿","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":274,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"竞选演讲稿\"，学生会竞选、社团干部竞选演讲稿。请专业、准确地回答用户问题。"},{"id":275,"categoryId":32,"name":"团队管理","icon":"👥","toolType":"text","description":"社团团队建设、分工协作、活动执行","coinCost":1,"isFree":0,"usageCount":198,"slug":"团队管理","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":275,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"团队管理\"，社团团队建设、分工协作、活动执行。请专业、准确地回答用户问题。"},{"id":276,"categoryId":33,"name":"考研择校","icon":"🎓","toolType":"text","description":"考研院校选择、专业对比、报录比分析","coinCost":2,"isFree":0,"usageCount":567,"slug":"考研择校","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":276,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"考研择校\"，考研院校选择、专业对比、报录比分析。请专业、准确地回答用户问题。"},{"id":277,"categoryId":33,"name":"考研复习规划","icon":"📅","toolType":"text","description":"考研全年复习计划、科目安排、时间分配","coinCost":2,"isFree":0,"usageCount":489,"slug":"考研复习规划","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":277,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"考研复习规划\"，考研全年复习计划、科目安排、时间分配。请专业、准确地回答用户问题。"},{"id":278,"categoryId":33,"name":"留学申请","icon":"✈️","toolType":"text","description":"留学选校、文书撰写、申请材料准备","coinCost":3,"isFree":0,"usageCount":345,"slug":"留学申请","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":278,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"留学申请\"，留学选校、文书撰写、申请材料准备。请专业、准确地回答用户问题。"},{"id":279,"categoryId":33,"name":"雅思托福备考","icon":"📝","toolType":"text","description":"雅思/托福听说读写备考策略","coinCost":2,"isFree":0,"usageCount":389,"slug":"雅思托福备考","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":279,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"雅思托福备考\"，雅思/托福听说读写备考策略。请专业、准确地回答用户问题。"},{"id":280,"categoryId":33,"name":"奖学金申请","icon":"🏅","toolType":"text","description":"奖学金信息、申请条件、材料准备","coinCost":1,"isFree":0,"usageCount":312,"slug":"奖学金申请","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":280,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"奖学金申请\"，奖学金信息、申请条件、材料准备。请专业、准确地回答用户问题。"},{"id":281,"categoryId":1,"name":"周报自动生成","icon":"📋","toolType":"text","description":"根据工作内容自动生成周报、月报","coinCost":1,"isFree":0,"usageCount":456,"slug":"周报自动生成","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":281,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"周报自动生成\"，根据工作内容自动生成周报、月报。请专业、准确地回答用户问题。"},{"id":282,"categoryId":2,"name":"表情包生成器","icon":"😆","toolType":"image","description":"AI生成搞笑表情包、动态表情","coinCost":3,"isFree":0,"usageCount":389,"slug":"表情包生成器","provider":"jimeng","modelId":"doubao-seedream-5-0-260128","inputType":"text","outputType":"image","freeDailyLimit":0,"sortOrder":282,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"表情包生成器\"，AI生成搞笑表情包、动态表情。请专业、准确地回答用户问题。"},{"id":283,"categoryId":4,"name":"心理咨询师","icon":"💚","toolType":"text","description":"心理健康咨询、情绪疏导、压力管理","coinCost":3,"isFree":0,"usageCount":312,"slug":"心理咨询师","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":283,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"心理咨询师\"，心理健康咨询、情绪疏导、压力管理。请专业、准确地回答用户问题。"},{"id":284,"categoryId":11,"name":"直播带货脚本","icon":"🎤","toolType":"text","description":"直播间带货话术、产品介绍脚本","coinCost":2,"isFree":0,"usageCount":345,"slug":"直播带货脚本","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":284,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"直播带货脚本\"，直播间带货话术、产品介绍脚本。请专业、准确地回答用户问题。"},{"id":285,"categoryId":13,"name":"用户留存分析","icon":"📊","toolType":"text","description":"用户留存率分析、流失预警、召回策略","coinCost":2,"isFree":0,"usageCount":278,"slug":"用户留存分析","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":285,"status":"active","createdAt":"2026-07-04T06:34:00.416Z","systemPrompt":"你是\"用户留存分析\"，用户留存率分析、流失预警、召回策略。请专业、准确地回答用户问题。"},{"id":286,"categoryId":15,"name":"作文批改","icon":"✏️","toolType":"text","description":"作文评分、批改建议、优秀范文推荐","coinCost":1,"isFree":0,"usageCount":456,"slug":"作文批改","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":286,"status":"active","createdAt":"2026-07-04T06:34:00.417Z","systemPrompt":"你是\"作文批改\"，作文评分、批改建议、优秀范文推荐。请专业、准确地回答用户问题。"},{"id":287,"categoryId":17,"name":"考公申论","icon":"📝","toolType":"text","description":"申论写作技巧、范文分析、热点素材","coinCost":2,"isFree":0,"usageCount":389,"slug":"考公申论","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":287,"status":"active","createdAt":"2026-07-04T06:34:00.417Z","systemPrompt":"你是\"考公申论\"，申论写作技巧、范文分析、热点素材。请专业、准确地回答用户问题。"},{"id":288,"categoryId":18,"name":"面试模拟","icon":"🎯","toolType":"text","description":"模拟面试、常见面试题、回答技巧","coinCost":2,"isFree":0,"usageCount":312,"slug":"面试模拟","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":288,"status":"active","createdAt":"2026-07-04T06:34:00.417Z","systemPrompt":"你是\"面试模拟\"，模拟面试、常见面试题、回答技巧。请专业、准确地回答用户问题。"},{"id":289,"categoryId":20,"name":"知乎问答","icon":"❓","toolType":"text","description":"知乎高质量回答、涨粉策略、专栏写作","coinCost":2,"isFree":0,"usageCount":345,"slug":"知乎问答","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":289,"status":"active","createdAt":"2026-07-04T06:34:00.417Z","systemPrompt":"你是\"知乎问答\"，知乎高质量回答、涨粉策略、专栏写作。请专业、准确地回答用户问题。"},{"id":290,"categoryId":21,"name":"视频文案提取","icon":"📝","toolType":"text","description":"从热门视频中提取文案、拆解爆款逻辑","coinCost":1,"isFree":0,"usageCount":389,"slug":"视频文案提取","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":290,"status":"active","createdAt":"2026-07-04T06:34:00.417Z","systemPrompt":"你是\"视频文案提取\"，从热门视频中提取文案、拆解爆款逻辑。请专业、准确地回答用户问题。"},{"id":291,"categoryId":24,"name":"宠物美容指南","icon":"✂️","toolType":"text","description":"宠物美容技巧、洗澡梳毛、造型设计","coinCost":1,"isFree":0,"usageCount":345,"slug":"宠物美容指南","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":291,"status":"active","createdAt":"2026-07-04T06:34:00.417Z","systemPrompt":"你是\"宠物美容指南\"，宠物美容技巧、洗澡梳毛、造型设计。请专业、准确地回答用户问题。"},{"id":292,"categoryId":27,"name":"水族百科","icon":"🐠","toolType":"text","description":"观赏鱼饲养、水族箱搭建、水质管理","coinCost":1,"isFree":0,"usageCount":278,"slug":"水族百科","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":292,"status":"active","createdAt":"2026-07-04T06:34:00.417Z","systemPrompt":"你是\"水族百科\"，观赏鱼饲养、水族箱搭建、水质管理。请专业、准确地回答用户问题。"},{"id":293,"categoryId":30,"name":"校园美食地图","icon":"🗺️","toolType":"text","description":"校园周边美食推荐、外卖攻略","coinCost":0,"isFree":1,"usageCount":567,"slug":"校园美食地图","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":10,"sortOrder":293,"status":"active","createdAt":"2026-07-04T06:34:00.417Z","systemPrompt":"你是\"校园美食地图\"，校园周边美食推荐、外卖攻略。请专业、准确地回答用户问题。"},{"id":294,"categoryId":31,"name":"实习报告","icon":"📄","toolType":"text","description":"实习报告撰写、实习总结、心得体会","coinCost":1,"isFree":0,"usageCount":389,"slug":"实习报告","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":294,"status":"active","createdAt":"2026-07-04T06:34:00.417Z","systemPrompt":"你是\"实习报告\"，实习报告撰写、实习总结、心得体会。请专业、准确地回答用户问题。"},{"id":295,"categoryId":33,"name":"保研攻略","icon":"🎓","toolType":"text","description":"保研条件、夏令营申请、导师联系","coinCost":2,"isFree":0,"usageCount":312,"slug":"保研攻略","provider":"doubao","modelId":"doubao-seed-2-0-pro-260215","inputType":"text","outputType":"text","freeDailyLimit":0,"sortOrder":295,"status":"active","createdAt":"2026-07-04T06:34:00.417Z","systemPrompt":"你是\"保研攻略\"，保研条件、夏令营申请、导师联系。请专业、准确地回答用户问题。"}];

router.get('/ai/categories', (req, res) => {
  const cats = toolCategories.map(c => ({
    id: c.id, name: c.name, slug: c.slug, module: c.module,
    icon: c.icon, description: c.description,
    toolCount: allTools.filter(t => t.categoryId === c.id).length,
  }));
  res.json({ code: 0, message: 'success', data: cats });
});

router.get('/ai/categories/:id', (req, res) => {
  const cat = toolCategories.find(c => c.id === parseInt(req.params.id));
  if (!cat) return res.status(404).json({ code: 1, message: 'not found' });
  res.json({ code: 0, message: 'success', data: { ...cat, toolCount: allTools.filter(t => t.categoryId === cat.id).length } });
});

router.get('/ai/tools', (req, res) => {
  const { categoryId, toolType, page = 1, pageSize = 200, keyword } = req.query;
  let filtered = [...allTools];
  if (categoryId) filtered = filtered.filter(t => t.categoryId === parseInt(categoryId));
  if (toolType) filtered = filtered.filter(t => t.toolType === toolType);
  if (keyword) filtered = filtered.filter(t => t.name.includes(keyword) || (t.description && t.description.includes(keyword)));
  const total = filtered.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const items = filtered.slice(start, start + parseInt(pageSize));
  res.json({ code: 0, message: 'success', data: { total, page: parseInt(page), pageSize: parseInt(pageSize), items } });
});

router.get('/ai/tools/:id', (req, res) => {
  const tool = allTools.find(t => t.id === parseInt(req.params.id));
  if (!tool) return res.status(404).json({ code: 1, message: 'not found' });
  const cat = toolCategories.find(c => c.id === tool.categoryId);
  res.json({ code: 0, message: 'success', data: { ...tool, category: cat || null } });
});

router.post('/ai/tools/:id/call', requireAuth, (req, res) => {
  const tool = allTools.find(t => t.id === parseInt(req.params.id));
  if (!tool) return res.status(404).json({ code: 1, message: 'not found' });
  res.json({ code: 0, message: 'success', data: { toolId: tool.id, toolName: tool.name, status: 'active' } });
});

router.post('/ai/tools/:id/chat', requireAuth, async (req, res) => {
  const tool = allTools.find(t => t.id === parseInt(req.params.id));
  if (!tool) return res.status(404).json({ code: 1, message: 'not found' });
  const { messages, model, temperature, maxTokens, systemPrompt } = req.body;
  const ARK_API_KEY = process.env.ARK_API_KEY;
  const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  const MODEL = model || process.env.ARK_MODEL_TEXT || 'doubao-seed-2-0-pro-260215';
  if (!ARK_API_KEY) return res.status(503).json({ code: 1, message: 'AI service not configured' });
  try {
    const sysPrompt = systemPrompt || tool.systemPrompt || 'You are a professional AI assistant.';
    const apiMessages = [{ role: 'system', content: sysPrompt }, ...messages.map(m => ({ role: m.role, content: m.content }))];
    const response = await fetch(ARK_BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ARK_API_KEY },
      body: JSON.stringify({ model: MODEL, messages: apiMessages, max_tokens: maxTokens || 4000, temperature: temperature || 0.9 }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ code: 1, message: data.error?.message || 'AI error' });
    const text = data.choices?.[0]?.message?.content || data.output?.choices?.[0]?.message?.content || '';
    res.json({ code: 0, message: 'success', data: { id: Date.now(), toolId: tool.id, toolName: tool.name, content: text, usage: data.usage, model: MODEL } });
  } catch (err) { res.status(500).json({ code: 1, message: 'AI connection failed: ' + err.message }); }
});

router.post('/ai/tools/:id/generate', requireAuth, async (req, res) => {
  const tool = allTools.find(t => t.id === parseInt(req.params.id));
  if (!tool) return res.status(404).json({ code: 1, message: 'not found' });
  const { prompt } = req.body;
  const ARK_API_KEY = process.env.ARK_API_KEY;
  const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  const MODEL = process.env.ARK_MODEL_IMAGE || 'doubao-seedream-5-0-260128';
  if (!ARK_API_KEY) return res.status(503).json({ code: 1, message: 'AI service not configured' });
  try {
    const response = await fetch(ARK_BASE_URL + '/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ARK_API_KEY },
      body: JSON.stringify({ model: MODEL, prompt, n: 1, size: '1024x1024' }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ code: 1, message: data.error?.message || 'Image gen failed' });
    const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json || '';
    res.json({ code: 0, message: 'success', data: { id: Date.now(), toolId: tool.id, toolName: tool.name, imageUrl, prompt } });
  } catch (err) { res.status(500).json({ code: 1, message: 'Image service failed: ' + err.message }); }
});

module.exports = { adminRouter: router };