const fs = require('fs');
let content = fs.readFileSync('routes/admin.js', 'utf8');

// Replace the entire dashboard route
const oldStart = "router.get('/admin/dashboard', requireAdmin, (req, res) => {";
const oldEnd = "res.json({ code: 0, message: 'success', data });\n});";
const startIdx = content.indexOf(oldStart);
const endIdx = content.indexOf(oldEnd, startIdx) + oldEnd.length;

const newDashboard = `router.get('/admin/dashboard', requireAdmin, (req, res) => {
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
});`;

content = content.substring(0, startIdx) + newDashboard + content.substring(endIdx);

fs.writeFileSync('routes/admin.js', content, 'utf8');
console.log('Step 2 done: dashboard data structure replaced');
