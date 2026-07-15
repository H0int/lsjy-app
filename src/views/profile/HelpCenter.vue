<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold" style="color: var(--cyber-cyan); font-family: 'JetBrains Mono', monospace; text-shadow: 0 0 10px var(--cyber-cyan), 0 0 20px rgba(0,240,255,0.25);">
        ❓ 帮助中心
      </h1>
      <p class="mt-1" style="color: var(--cyber-text-dim); font-size: 13px;">常见问题解答与平台使用指南</p>
    </div>

    <!-- 分类标签 -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button v-for="cat in categories" :key="cat.value"
        @click="activeCategory = cat.value"
        class="cyber-cat-btn" :class="{ active: activeCategory === cat.value }">
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>

    <!-- FAQ列表 -->
    <div class="space-y-3">
      <div v-for="item in filteredFaqs" :key="item.id" class="cyber-faq-card">
        <div class="faq-header" @click="toggleFaq(item.id)">
          <div class="flex items-center gap-3">
            <span class="faq-icon">{{ item.icon }}</span>
            <span class="faq-question">{{ item.question }}</span>
          </div>
          <span class="faq-arrow" :class="{ expanded: expandedFaqs.has(item.id) }">▼</span>
        </div>
        <div v-if="expandedFaqs.has(item.id)" class="faq-answer">
          <p v-html="item.answer"></p>
        </div>
      </div>
    </div>

    <!-- 联系客服 -->
    <div class="cyber-contact-card mt-8">
      <div class="text-xl mb-2">💬 没有找到答案？</div>
      <p class="text-sm mb-4" style="color: var(--cyber-text-dim);">联系客服获取一对一帮助</p>
      <div class="flex gap-3">
        <div class="cyber-contact-item">
          <div class="text-2xl mb-1">📞</div>
          <div class="text-sm font-medium">客服电话</div>
          <div class="text-xs" style="color: var(--cyber-cyan);">188-9000-0368</div>
        </div>
        <div class="cyber-contact-item cyber-contact-clickable" @click="showQrcode = true">
          <div class="text-2xl mb-1">💬</div>
          <div class="text-sm font-medium">技术交流群</div>
          <div class="text-xs" style="color: var(--cyber-cyan);">点击查看群二维码</div>
        </div>
        <div class="cyber-contact-item">
          <div class="text-2xl mb-1">📧</div>
          <div class="text-sm font-medium">意见反馈</div>
          <div class="text-xs" style="color: var(--cyber-cyan);">3196542376@qq.com</div>
        </div>
      </div>
    </div>

    <!-- 二维码弹窗 -->
    <div v-if="showQrcode" class="cyber-modal-overlay" @click.self="showQrcode = false">
      <div class="cyber-modal-card">
        <div class="cyber-modal-header">
          <span>💬 技术交流群</span>
          <button class="cyber-modal-close" @click="showQrcode = false">✕</button>
        </div>
        <div class="cyber-modal-body">
          <p class="text-sm mb-3" style="color: var(--cyber-text-dim);">罗圣纪元AIGC-Agent技术核心班</p>
          <div class="cyber-qrcode-wrapper">
            <img src="/qrcode-tech-group.png" alt="技术交流群二维码" class="cyber-qrcode-img" />
          </div>
          <p class="text-xs mt-3" style="color: var(--cyber-text-dim);">用微信或企业微信扫码加入</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeCategory = ref('all')
const expandedFaqs = ref<Set<number>>(new Set())
const showQrcode = ref(false)

const categories = [
  { label: '全部', value: 'all', icon: '📦' },
  { label: '新手入门', value: 'beginner', icon: '🌟' },
  { label: '工具使用', value: 'tools', icon: '🛠️' },
  { label: '充值说明', value: 'payment', icon: '💰' },
  { label: '会员权益', value: 'vip', icon: '👑' },
  { label: '账号安全', value: 'account', icon: '🔐' },
  { label: '算力&虚拟员工', value: 'computing', icon: '⚡' },
]

const faqs = ref([
  { id: 1, icon: '🌟', question: '罗圣纪元是什么平台？', answer: '罗圣纪元是一个AI赋能实体经济的SaaS平台，集成了<b>262+个AI工具</b>，涵盖内容创作、AI智能、电商运营、教育培训、宠物服务、校园助手六大领域。支持AI对话、AI绘画、AI视频生成、文案创作等多种功能，帮助企业和个人提升效率。', category: 'beginner' },
  { id: 2, icon: '🚀', question: '如何开始使用平台？', answer: '1. 注册账号并登录<br>2. 进入「AI工具中心」浏览262+个AI工具<br>3. 选择需要的工具，输入需求即可使用<br>4. 部分工具免费使用，部分需要消耗圣力（平台虚拟货币）', category: 'beginner' },
  { id: 3, icon: '🛠️', question: '如何使用AI绘画功能？', answer: '1. 在AI工具中心找到「AI绘画」类工具<br>2. 输入您想要的图片描述（如"一只可爱的猫咪在花园里"）<br>3. 选择风格（写实/动漫/油画等）和尺寸<br>4. 点击生成，等待AI绘制完成<br>5. 生成的图片可以下载保存', category: 'tools' },
  { id: 4, icon: '🎬', question: '如何使用AI视频生成？', answer: '1. 在AI工具中心找到「视频生成」类工具<br>2. 输入视频描述文案<br>3. 选择风格（电影感/动漫/写实等）<br>4. 视频生成通常需要1-3分钟<br>5. 生成完成后可预览和下载', category: 'tools' },
  { id: 5, icon: '💬', question: '如何与AI智能体对话？', answer: '1. 点击导航栏「AI智能体」进入对话页面<br>2. 选择或创建一个AI智能体<br>3. 在对话框中输入您的问题<br>4. AI会实时回复，支持多轮对话<br>5. 可以创建自定义智能体，设定专属人设', category: 'tools' },
  { id: 6, icon: '💰', question: '什么是圣力？如何获取？', answer: '<b>圣力</b>是罗圣纪元平台的虚拟货币，用于使用付费AI工具。<br><br>获取方式：<br>• <b>充值购买</b>：在「圣力中心」选择套餐充值<br>• <b>Boss充值卡</b>：使用实体充值卡兑换<br>• <b>活动赠送</b>：参与平台活动获取免费圣力<br>• <b>每日签到</b>：部分活动期间可签到领取', category: 'payment' },
  { id: 7, icon: '💳', question: '支持哪些支付方式？', answer: '目前支持以下支付方式：<br>• <b>微信支付</b>：扫描二维码完成支付<br>• <b>支付宝</b>：扫描二维码完成支付<br>• <b>人工充值</b>：联系客服转账后上传截图<br><br>充值后圣力实时到账，如有延迟请联系客服处理。', category: 'payment' },
  { id: 8, icon: '👑', question: '会员有哪些权益？', answer: '<b>VIP会员</b>享有以下权益：<br>• 所有AI工具使用享受 <b>8折优惠</b><br>• 优先使用最新上线的AI工具<br>• 更高的并发调用次数<br>• 专属客服通道<br>• 不定期会员专属活动<br><br>开通方式：在「圣力中心」查看会员套餐。', category: 'vip' },
  { id: 9, icon: '🔐', question: '如何修改密码？', answer: '1. 点击右上角头像进入「个人中心」<br>2. 找到「账号安全」相关设置<br>3. 输入旧密码和新密码<br>4. 确认修改即可<br><br>建议定期修改密码，确保账号安全。', category: 'account' },
  { id: 10, icon: '🔒', question: '忘记密码怎么办？', answer: '如果忘记密码，请通过以下方式找回：<br>• <b>联系客服</b>：拨打 188-9000-0368<br>• <b>官方群</b>：在官方技术交流群中联系管理员<br>• <b>邮箱</b>：发送邮件至 support@lsjyapp.cn<br><br>提供注册时使用的账号信息即可重置密码。', category: 'account' },
  { id: 11, icon: '⭐', question: '如何收藏常用工具？', answer: '在AI工具中心，每个工具卡片左上角都有 <b>★ 收藏按钮</b>：<br>• 点击 ★ 即可收藏该工具<br>• 再次点击可取消收藏<br>• 在「个人中心 → 收藏工具」查看所有收藏<br>• 收藏数据保存在本地，换设备需重新收藏', category: 'tools' },
  { id: 12, icon: '📊', question: '如何查看使用记录？', answer: '在控制台首页的「快捷入口」中点击「📝 创作记录」：<br>• 查看所有AI工具的使用历史<br>• 按类型筛选（文本/图片/视频）<br>• 查看输入内容和生成结果<br>• 支持清空历史记录', category: 'tools' },
  { id: 13, icon: '⚡', question: '什么是全域智能算力调度引擎？', answer: '全域智能算力调度引擎是罗圣纪元平台<b>自研的核心技术</b>，主要功能：<br>• <b>自动监测</b>豆包、DeepSeek等接入模型的余量，额度不足时<b>无缝切换</b>模型，任务全程不中断<br>• <b>智能分配</b>算力，整体Token损耗降低<b>35%以上</b>，大幅节省圣点消耗<br>• <b>多任务并行</b>处理，单人办公效率提升2-3倍<br>• 调度核心算法<b>私有加密存储</b>，形成平台独家技术壁垒，可直接用于大学生创新创业省赛、国赛项目答辩创新亮点<br><br>入口：控制台首页 →「算力调度 & 行业虚拟数字员工中心」', category: 'computing' },
  { id: 14, icon: '🤖', question: '如何创建行业虚拟AI员工？', answer: '1. 进入控制台首页，点击「算力调度 & 行业虚拟数字员工中心」<br>2. 切换至「行业虚拟AI员工」板块<br>3. 选择企业所属<b>行业</b>（电商运营、宠物门店、教育培训、自媒体运营、校园创业、技术开发等）<br>4. 选择需要的<b>工作岗位</b>（客服代表、内容运营、营销策划、数据分析等）<br>5. 填写员工名称和描述<br>6. 点击「生成专属AI员工」<br>7. 系统自动匹配并生成AI员工，可自定义工作流程和企业专属知识库<br><br>AI员工7×24小时全自动运行，可替代5-10名线下员工，企业人力成本降低50%-80%。', category: 'computing' },
  { id: 15, icon: '💎', question: '增值服务套餐有哪些？', answer: '平台提供<b>四类增值付费项目</b>：<br>• <b>虚拟员工年度会员</b>（¥999/年）：不限量创建行业AI员工，7×24小时运行<br>• <b>高阶算力调度专属权限</b>（¥599/年）：解锁全部调度策略，跨模型无缝切换<br>• <b>行业定制智能体</b>（¥1299/次）：根据企业需求定制专属AI智能体<br>• <b>创业赛事项目技术咨询</b>（¥1999/次）：大学生创新创业比赛全程技术指导<br><br>购买方式：进入「算力调度中心 → 增值服务」选择套餐，支持圣力支付。', category: 'computing' },
  { id: 16, icon: '📄', question: '如何一键导出创新创业比赛材料？', answer: '1. 进入「算力调度 & 行业虚拟数字员工中心」<br>2. 切换至「增值服务」板块<br>3. 在「一键导出」区域选择需要的文档类型：<br>   • <b>创赛答辩稿</b>：自动生成项目介绍、技术创新点、商业模式等答辩内容<br>   • <b>商业计划书</b>：包含市场分析、盈利模式、团队介绍等完整框架<br>   • <b>竞品分析文档</b>：自动生成行业竞品对比、SWOT分析、差异化优势<br>4. 点击导出，系统自动生成文档供下载', category: 'computing' },
  { id: 17, icon: '🔧', question: '如何配置多智能体协同任务？', answer: '1. 创建虚拟AI员工后，点击员工卡片进入工作流配置<br>2. 在「工作流可视化面板」中设置任务节点：<br>   • <b>接收任务</b>：定义任务触发条件<br>   • <b>内容生成</b>：配置AI生成规则和模板<br>   • <b>质量审核</b>：设置自动审核标准<br>   • <b>发布/推送</b>：配置输出渠道（如社交媒体、邮件等）<br>   • <b>数据反馈</b>：收集效果数据用于优化<br>3. 支持多个AI员工协同工作，可用于日常生意运营或一键导出创新创业比赛全套材料', category: 'computing' },
])

const filteredFaqs = computed(() => {
  if (activeCategory.value === 'all') return faqs.value
  return faqs.value.filter(f => f.category === activeCategory.value)
})

function toggleFaq(id: number) {
  if (expandedFaqs.value.has(id)) {
    expandedFaqs.value.delete(id)
  } else {
    expandedFaqs.value.add(id)
  }
}
</script>

<style scoped>
.cyber-cat-btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  background: rgba(0,240,255,0.03);
  border: 1px solid rgba(0,240,255,0.1);
  color: var(--cyber-text-dim);
  cursor: pointer;
  transition: all 0.2s;
}
.cyber-cat-btn:hover { border-color: rgba(0,240,255,0.3); color: var(--cyber-text); }
.cyber-cat-btn.active {
  background: rgba(0,240,255,0.1);
  border-color: rgba(0,240,255,0.4);
  color: var(--cyber-cyan);
  box-shadow: 0 0 8px rgba(0,240,255,0.15);
}

.cyber-faq-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}
.cyber-faq-card:hover { border-color: rgba(0,240,255,0.2); }
.faq-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 18px;
  cursor: pointer;
  transition: background 0.2s;
}
.faq-header:hover { background: rgba(0,240,255,0.03); }
.faq-icon { font-size: 20px; }
.faq-question {
  font-size: 14px; font-weight: 600;
  color: var(--cyber-text);
  font-family: 'JetBrains Mono', monospace;
}
.faq-arrow {
  font-size: 12px;
  color: var(--cyber-text-dim);
  transition: transform 0.3s;
}
.faq-arrow.expanded { transform: rotate(180deg); }
.faq-answer {
  padding: 0 18px 16px 50px;
  font-size: 13px;
  color: var(--cyber-text-dim);
  line-height: 1.8;
}
.faq-answer b { color: var(--cyber-cyan); }
.faq-answer br { display: block; margin: 4px 0; }

.cyber-contact-card {
  background: linear-gradient(135deg, rgba(0,240,255,0.05), rgba(124,58,237,0.05));
  border: 1px solid rgba(0,240,255,0.12);
  border-radius: 14px;
  padding: 24px;
  text-align: center;
}
.cyber-contact-item {
  flex: 1;
  padding: 12px;
  background: rgba(0,240,255,0.03);
  border: 1px solid rgba(0,240,255,0.08);
  border-radius: 10px;
  color: var(--cyber-text);
}
.cyber-contact-clickable {
  cursor: pointer;
  transition: all 0.25s;
}
.cyber-contact-clickable:hover {
  border-color: rgba(0,240,255,0.3);
  background: rgba(0,240,255,0.08);
  box-shadow: 0 0 12px rgba(0,240,255,0.1);
  transform: translateY(-2px);
}

/* 二维码弹窗 */
.cyber-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.cyber-modal-card {
  background: linear-gradient(135deg, #0d0d2b, #1a0a3a);
  border: 1px solid rgba(0,240,255,0.2);
  border-radius: 16px;
  width: 340px;
  max-width: 90vw;
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0,240,255,0.1), 0 20px 60px rgba(0,0,0,0.5);
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.cyber-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0,240,255,0.1);
  font-size: 16px;
  font-weight: 600;
  color: var(--cyber-text);
}
.cyber-modal-close {
  background: none;
  border: 1px solid rgba(0,240,255,0.15);
  border-radius: 6px;
  color: var(--cyber-text-dim);
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}
.cyber-modal-close:hover {
  border-color: rgba(0,240,255,0.4);
  color: var(--cyber-cyan);
  background: rgba(0,240,255,0.08);
}
.cyber-modal-body {
  padding: 20px;
  text-align: center;
}
.cyber-qrcode-wrapper {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  display: inline-block;
  box-shadow: 0 0 15px rgba(0,240,255,0.08);
}
.cyber-qrcode-img {
  width: 220px;
  height: 220px;
  object-fit: contain;
  border-radius: 4px;
}
</style>
