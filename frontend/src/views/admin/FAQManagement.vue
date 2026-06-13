<template>
  <div>
    <!-- 操作栏 -->
    <div class="cyber-toolbar">
      <div class="toolbar-left">
        <select v-model="filterCategory" class="cyber-select">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <input v-model="searchKeyword" type="text" placeholder="搜索问题..." class="cyber-text-input" />
      </div>
      <button @click="showDialog = true" class="cyber-btn cyber-btn-cyan">+ 添加FAQ</button>
    </div>

    <!-- 分类统计 -->
    <div class="cyber-grid-6 mb-4">
      <div v-for="cat in categories" :key="cat" class="cyber-cat-card" :class="{ 'cat-active': filterCategory === cat }" @click="filterCategory = filterCategory === cat ? '' : cat">
        <p class="cat-num">{{ getCategoryCount(cat) }}</p>
        <p class="cat-label">{{ cat }}</p>
      </div>
    </div>

    <!-- FAQ列表 -->
    <div class="space-y-3">
      <div v-for="item in filteredList" :key="item.id" class="cyber-card faq-card">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="cyber-tag tag-category">{{ item.category }}</span>
              <span class="cyber-badge" :class="item.status === 'active' ? 'badge-active' : 'badge-disabled'">{{ item.status === 'active' ? '启用' : '禁用' }}</span>
              <span class="text-xs text-[#4a4a6a]">🔍 搜索热度: {{ item.searchCount }}</span>
            </div>
            <h3 class="font-semibold text-white mb-1">Q: {{ item.question }}</h3>
            <p class="text-sm text-[#6a6a8a]">A: {{ item.answer }}</p>
          </div>
          <div class="flex gap-2 ml-4">
            <button @click="handleEdit(item)" class="cyber-btn-xs cyber-btn-ghost">编辑</button>
            <button @click="toggleStatus(item)" class="cyber-btn-xs" :class="item.status === 'active' ? 'cyber-btn-amber' : 'cyber-btn-green'">{{ item.status === 'active' ? '禁用' : '启用' }}</button>
            <button @click="handleDelete(item)" class="cyber-btn-xs cyber-btn-magenta">删除</button>
          </div>
        </div>
      </div>
      <div v-if="filteredList.length === 0" class="text-center py-12 text-[#4a4a6a] cyber-card">暂无FAQ</div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <div v-if="showDialog" class="cyber-overlay">
      <div class="cyber-dialog">
        <h3 class="dialog-title">{{ editingId ? '编辑FAQ' : '添加FAQ' }}</h3>
        <div class="space-y-4">
          <div><label class="cyber-label">分类</label>
            <select v-model="form.category" class="cyber-select w-full">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div><label class="cyber-label">问题</label><input v-model="form.question" class="cyber-text-input w-full" /></div>
          <div><label class="cyber-label">答案</label><textarea v-model="form.answer" rows="4" class="cyber-text-input w-full"></textarea></div>
          <div><label class="cyber-label">排序权重</label><input v-model.number="form.sortOrder" type="number" class="cyber-text-input w-32" /></div>
        </div>
        <div class="dialog-footer">
          <button @click="showDialog = false" class="cyber-btn cyber-btn-ghost">取消</button>
          <button @click="handleSave" class="cyber-btn cyber-btn-cyan">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FAQItem } from '@/types'

const filterCategory = ref('')
const searchKeyword = ref('')
const showDialog = ref(false)
const editingId = ref<number | null>(null)
const categories = ['账号相关', '支付充值', 'AI工具', '电商购物', '课程学习', '宠物服务']

const form = ref({ category: '账号相关', question: '', answer: '', sortOrder: 0 })

const list = ref<FAQItem[]>([
  { id: 1, category: '支付充值', question: '圣点充值后多久到账？', answer: '正常情况下圣点充值即时到账。如超过10分钟未到账，请检查支付是否成功，或提交工单联系客服处理。', searchCount: 1256, sortOrder: 1, status: 'active', createdAt: '2025-06-01 10:00', updatedAt: '2025-06-01 10:00' },
  { id: 2, category: 'AI工具', question: 'AI工具调用失败会扣圣点吗？', answer: '不会。如果AI工具调用失败（状态为failed），系统会自动退还消耗的圣点。一般会在5分钟内退还到您的账户。', searchCount: 980, sortOrder: 2, status: 'active', createdAt: '2025-06-01 10:00', updatedAt: '2025-06-01 10:00' },
  { id: 3, category: '账号相关', question: '如何修改绑定手机号？', answer: '进入个人中心 -> 安全设置 -> 修改手机号，需要验证原手机号后即可绑定新手机号。如原手机号已无法接收验证码，请提交工单进行人工审核。', searchCount: 756, sortOrder: 3, status: 'active', createdAt: '2025-06-01 10:00', updatedAt: '2025-06-01 10:00' },
  { id: 4, category: '电商购物', question: '商品退换货流程是什么？', answer: '在订单详情页点击"申请退换货"，填写原因并上传凭证图片。商家将在48小时内处理。如商家拒绝，可申请平台介入。', searchCount: 634, sortOrder: 4, status: 'active', createdAt: '2025-06-05 14:00', updatedAt: '2025-06-05 14:00' },
  { id: 5, category: '课程学习', question: '课程购买后可以退款吗？', answer: '课程购买后7天内且学习进度不超过20%可申请退款。超过退款条件则不支持退款，建议先试看再购买。', searchCount: 520, sortOrder: 5, status: 'active', createdAt: '2025-06-10 09:00', updatedAt: '2025-06-10 09:00' },
  { id: 6, category: '宠物服务', question: '宠物健康档案如何创建？', answer: '进入宠物模块 -> 点击"添加宠物"，填写宠物基本信息后即可自动创建健康档案。后续可在档案中记录疫苗、体检、就诊等信息。', searchCount: 310, sortOrder: 6, status: 'active', createdAt: '2025-06-15 11:00', updatedAt: '2025-06-15 11:00' },
  { id: 7, category: 'AI工具', question: '如何成为AI工具创作者？', answer: '在工具中心页面点击"成为创作者"，填写个人介绍和技能特长，审核通过后即可上传自己开发的AI工具并获得收益分成。', searchCount: 445, sortOrder: 7, status: 'disabled', createdAt: '2025-06-20 16:00', updatedAt: '2025-06-20 16:00' },
])

const filteredList = computed(() => {
  let result = list.value
  if (filterCategory.value) result = result.filter(i => i.category === filterCategory.value)
  if (searchKeyword.value) { const kw = searchKeyword.value.toLowerCase(); result = result.filter(i => i.question.toLowerCase().includes(kw) || i.answer.toLowerCase().includes(kw)) }
  return result
})

function getCategoryCount(cat: string) { return list.value.filter(i => i.category === cat).length }
function toggleStatus(item: FAQItem) { item.status = item.status === 'active' ? 'disabled' : 'active' }
function handleEdit(item: FAQItem) { editingId.value = item.id; form.value = { category: item.category, question: item.question, answer: item.answer, sortOrder: item.sortOrder }; showDialog.value = true }
function handleDelete(item: FAQItem) { const i = list.value.findIndex(x => x.id === item.id); if (i >= 0) list.value.splice(i, 1) }
function handleSave() {
  if (editingId.value) {
    const item = list.value.find(i => i.id === editingId.value)
    if (item) Object.assign(item, { category: form.value.category, question: form.value.question, answer: form.value.answer, sortOrder: form.value.sortOrder })
  } else {
    list.value.unshift({ id: Date.now(), category: form.value.category, question: form.value.question, answer: form.value.answer, searchCount: 0, sortOrder: form.value.sortOrder, status: 'active', createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '), updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') })
  }
  showDialog.value = false; editingId.value = null
}
</script>

<style scoped>
.cyber-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.toolbar-left { display: flex; gap: 12px; }

.cyber-grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }

.cyber-cat-card {
  background: #12121f; border: 1px solid #1a1a2e; border-radius: 10px; padding: 12px;
  text-align: center; cursor: pointer; transition: all 0.2s;
}
.cyber-cat-card:hover { border-color: #00f0ff44; }
.cat-active { border-color: #00f0ff !important; box-shadow: 0 0 12px rgba(0,240,255,0.15); }
.cat-num { font-size: 18px; font-weight: 800; color: #e0e0ff; font-family: 'Courier New', monospace; }
.cat-label { font-size: 11px; color: #6a6a8a; margin-top: 4px; }

.space-y-3 > * + * { margin-top: 12px; }

.cyber-card { background: #12121f; border: 1px solid #1a1a2e; border-radius: 12px; padding: 20px; transition: border-color 0.2s; }
.faq-card:hover { border-color: #2a2a4e; }

.cyber-select { background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #a0a0cc; outline: none; }
.cyber-select:focus { border-color: #00f0ff; }
.cyber-select option { background: #12121f; }

.cyber-text-input { background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #e0e0ff; outline: none; width: 180px; resize: vertical; }
.cyber-text-input:focus { border-color: #00f0ff; }
.cyber-text-input::placeholder { color: #4a4a6a; }

.cyber-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.cyber-btn-cyan { background: rgba(0,240,255,0.1); color: #00f0ff; border-color: #00f0ff44; }
.cyber-btn-cyan:hover { background: rgba(0,240,255,0.2); box-shadow: 0 0 12px rgba(0,240,255,0.3); }
.cyber-btn-ghost { background: rgba(100,100,140,0.1); color: #8888aa; border-color: #2a2a4e; }
.cyber-btn-ghost:hover { color: #c0c0ff; }

.cyber-btn-xs { padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.cyber-btn-green { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.cyber-btn-green:hover { background: rgba(0,255,136,0.2); box-shadow: 0 0 8px rgba(0,255,136,0.3); }
.cyber-btn-amber { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
.cyber-btn-amber:hover { background: rgba(245,158,11,0.2); }
.cyber-btn-magenta { background: rgba(255,0,255,0.1); color: #ff00ff; border: 1px solid rgba(255,0,255,0.2); }
.cyber-btn-magenta:hover { background: rgba(255,0,255,0.2); box-shadow: 0 0 8px rgba(255,0,255,0.3); }

.cyber-tag { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
.tag-category { background: rgba(0,240,255,0.1); color: #00f0ff; }

.cyber-badge { padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-active { background: rgba(0,255,136,0.1); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
.badge-disabled { background: rgba(100,100,140,0.1); color: #6a6a8a; border: 1px solid #2a2a4e; }

/* Dialog */
.cyber-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; }
.cyber-dialog { background: #12121f; border: 1px solid #1a1a2e; border-radius: 16px; padding: 24px; width: 100%; max-width: 520px; }
.dialog-title { font-size: 18px; font-weight: 700; color: #e0e0ff; margin-bottom: 20px; }
.cyber-label { display: block; font-size: 12px; color: #6a6a8a; margin-bottom: 6px; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
.space-y-4 > * + * { margin-top: 16px; }
.w-full { width: 100%; }
.w-32 { width: 128px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-4 { margin-bottom: 16px; }
.ml-4 { margin-left: 16px; }
.gap-2 { gap: 8px; }
.flex { display: flex; }
.flex-1 { flex: 1; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-between { justify-content: space-between; }
.font-semibold { font-weight: 600; }
.text-sm { font-size: 13px; }
.text-xs { font-size: 11px; }
.text-white { color: #fff; }
</style>
