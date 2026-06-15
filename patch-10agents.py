#!/usr/bin/env python3
"""
罗圣纪元 - 10 Agent Integration Patch
首席技术架构师 ozeClaw 出品
功能：将10个AI员工能力接入前端罗圣AI智能体，统一算力扣费
"""
import re

SERVER_PATH = 'backend/server.js'

with open(SERVER_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# ============================================================
# 1. Fix: tool id:1 isFree=true → false
# ============================================================
content = content.replace(
    "{ id: 1, name: '罗圣AI智能体', toolType: 'text', categoryId: 4, status: 'active', description: '全能AI助手，支持多轮对话', isFree: true, systemPrompt: CONFIG.SYSTEM_PROMPT, usageCount: 1256, coinCost: 0 }",
    "{ id: 1, name: '罗圣AI智能体', toolType: 'text', categoryId: 4, status: 'active', description: '全能AI助手，支持多轮对话、调用全部AI员工能力', isFree: false, systemPrompt: CONFIG.SYSTEM_PROMPT, usageCount: 1256, coinCost: 1 }"
)

# ============================================================
# 2. Add: 10 Agent Definitions (after aiToolsStore)
# ============================================================
AGENT_DEFINITIONS = '''

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
'''

# Find the end of aiToolsStore definition and insert after it
tools_end_pattern = r"(const aiToolsStore = \[.*?\];)"
match = re.search(tools_end_pattern, content, re.DOTALL)
if match:
    insert_pos = match.end()
    content = content[:insert_pos] + AGENT_DEFINITIONS + content[insert_pos:]
    print("✅ 10 Agent definitions inserted after aiToolsStore")
else:
    print("❌ Could not find aiToolsStore")
    exit(1)

# ============================================================
# 3. Modify: Chat endpoint to use agent-specific config
# ============================================================
# Replace the hardcoded CHAT_COIN_COST = 1 with agent-aware logic
OLD_CHAT_HEADER = '''// AI对话（消耗1圣点/次）
app.post('/api/v1/ai/tools/:toolId/chat', authCheck, async (req, res) => {
  const { toolId } = req.params;
  const { messages, model, temperature, maxTokens, systemPrompt } = req.body;
  const userId = req.user?.id;
  const CHAT_COIN_COST = 1;'''

NEW_CHAT_HEADER = '''// AI对话（根据Agent定价扣费，支持10个AI员工）
app.post('/api/v1/ai/tools/:toolId/chat', authCheck, async (req, res) => {
  const { toolId } = req.params;
  const { messages, model, temperature, maxTokens, systemPrompt } = req.body;
  const userId = req.user?.id;
  
  // Agent路由：优先查agentsStore（10个AI员工），fallback到aiToolsStore
  const agentId = Number(toolId);
  const agent = (typeof agentsStore !== 'undefined') ? agentsStore.find(a => a.id === agentId) : null;
  const tool = aiToolsStore.find(t => t.id === agentId);
  const CHAT_COIN_COST = agent ? agent.coinCost : (tool ? (tool.coinCost || 1) : 1);
  const effectiveSystemPrompt = systemPrompt || (agent ? agent.systemPrompt : null) || (tool ? tool.systemPrompt : null) || CONFIG.SYSTEM_PROMPT;
  const effectiveProvider = agent ? (agent.provider || CONFIG.AI_PROVIDER) : (CONFIG.AI_PROVIDER);'''

content = content.replace(OLD_CHAT_HEADER, NEW_CHAT_HEADER)
print("✅ Chat endpoint upgraded to agent-aware routing")

# ============================================================
# 4. Modify: callAI to use agent's systemPrompt and provider
# ============================================================
# Replace the first callAI in chat endpoint to pass effectiveSystemPrompt
OLD_CALL1 = "const result = await callAI(messages, { model, temperature, maxTokens, systemPrompt });"
NEW_CALL1 = "const result = await callAI(messages, { model, temperature, maxTokens, systemPrompt: effectiveSystemPrompt, provider: effectiveProvider });"
content = content.replace(OLD_CALL1, NEW_CALL1, 1)
print("✅ First callAI now uses agent's systemPrompt and provider")

# ============================================================
# 5. Add: Agent list API endpoint
# ============================================================
AGENT_LIST_API = '''

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
'''

# Insert before the AI history endpoint
HISTORY_MARKER = "// AI调用历史\napp.get('/api/v1/ai/history'"
if HISTORY_MARKER in content:
    content = content.replace(HISTORY_MARKER, AGENT_LIST_API + "\n" + HISTORY_MARKER)
    print("✅ Agent list API endpoints added")
else:
    # Fallback: insert before AI image generation section
    IMG_MARKER = "// 图片生成（消耗10圣点/次）"
    if IMG_MARKER in content:
        content = content.replace(IMG_MARKER, AGENT_LIST_API + "\n" + IMG_MARKER)
        print("✅ Agent list API endpoints added (fallback position)")
    else:
        print("⚠️ Could not find insertion point for Agent API")

# ============================================================
# 6. Modify: /api/v1/ai/tools to include agents in the list
# ============================================================
# Find the tools list endpoint and add agents to the response
OLD_TOOLS_LIST = "app.get('/api/v1/ai/tools', (req, res) => {"
if OLD_TOOLS_LIST in content:
    # We need to find this and modify the response to include agents
    # Find the response line
    old_tools_response = "res.json({ code: 0, data: aiToolsStore });"
    new_tools_response = "const allTools = [...aiToolsStore, ...(typeof agentsStore !== 'undefined' ? agentsStore.map(a => ({ id: a.id, name: a.name, toolType: 'agent', categoryId: 4, status: a.status, description: a.description, isFree: false, coinCost: a.coinCost, usageCount: 0, icon: a.icon, category: a.category, isAgent: true })) : [])];\n    res.json({ code: 0, data: allTools });"
    if old_tools_response in content:
        content = content.replace(old_tools_response, new_tools_response)
        print("✅ Tools list now includes all 10 agents")
    else:
        print("⚠️ Could not find tools list response to modify")
else:
    print("⚠️ Could not find /api/v1/ai/tools endpoint")

# ============================================================
# Write patched file
# ============================================================
with open(SERVER_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("\n🎉 Patch complete! 10 agents integrated.")
print(f"   File: {SERVER_PATH} ({len(content)} bytes)")
