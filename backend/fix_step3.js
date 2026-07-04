const fs = require('fs');
let content = fs.readFileSync('routes/admin.js', 'utf8');

// Add api-errors, payment-failures, and feedbacks endpoints before module.exports
const newEndpoints = `
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

`;

content = content.replace("module.exports = { adminRouter: router };", newEndpoints + "module.exports = { adminRouter: router };");

fs.writeFileSync('routes/admin.js', content, 'utf8');
console.log('Step 3 done: api-errors, payment-failures, feedbacks endpoints added');
