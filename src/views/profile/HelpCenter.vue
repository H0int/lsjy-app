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
        <div class="cyber-contact-item">
          <div class="text-2xl mb-1">💬</div>
          <div class="text-sm font-medium">技术交流群</div>
          <div class="text-xs" style="color: var(--cyber-cyan);">扫码加入官方群</div>
        </div>
        <div class="cyber-contact-item">
          <div class="text-2xl mb-1">📧</div>
          <div class="text-sm font-medium">意见反馈</div>
          <div class="text-xs" style="color: var(--cyber-cyan);">support@lsjyapp.cn</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeCategory = ref('all')
const expandedFaqs = ref<Set<number>>(new Set())

const categories = [
  { label: '全部', value: 'all', icon: '📦' },
  { label: '新手入门', value: 'beginner', icon: '🌟' },
  { label: '工具使用', value: 'tools', icon: '🛠️' },
  { label: '充值说明', value: 'payment', icon: '💰' },
  { label: '会员权益', value: 'vip', icon: '👑' },
  { label: '账号安全', value: 'account', icon: '🔐' },
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
</style>
