<template>
  <div>
    <!-- 操作栏 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-3">
        <select v-model="filterCategory" class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <input v-model="searchKeyword" type="text" placeholder="搜索问题..." class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200 w-48" />
      </div>
      <button @click="showDialog = true" class="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">+ 添加FAQ</button>
    </div>

    <!-- 分类统计 -->
    <div class="grid grid-cols-6 gap-3 mb-4">
      <div v-for="cat in categories" :key="cat" class="bg-white dark:bg-dark-100 rounded-xl p-3 shadow-sm text-center cursor-pointer hover:ring-2 hover:ring-primary" @click="filterCategory = filterCategory === cat ? '' : cat">
        <p class="text-lg font-bold text-gray-800 dark:text-gray-200">{{ getCategoryCount(cat) }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ cat }}</p>
      </div>
    </div>

    <!-- FAQ列表 -->
    <div class="space-y-3">
      <div v-for="item in filteredList" :key="item.id" class="bg-white dark:bg-dark-100 rounded-xl p-5 shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">{{ item.category }}</span>
              <span class="px-2 py-0.5 rounded-full text-xs" :class="item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">{{ item.status === 'active' ? '启用' : '禁用' }}</span>
              <span class="text-xs text-gray-400">🔍 搜索热度: {{ item.searchCount }}</span>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-1">Q: {{ item.question }}</h3>
            <p class="text-sm text-gray-500">A: {{ item.answer }}</p>
          </div>
          <div class="flex gap-2 ml-4">
            <button @click="handleEdit(item)" class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 dark:bg-dark-300 dark:text-gray-300">编辑</button>
            <button @click="toggleStatus(item)" class="px-3 py-1.5 rounded-lg text-xs" :class="item.status === 'active' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'">{{ item.status === 'active' ? '禁用' : '启用' }}</button>
            <button @click="handleDelete(item)" class="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs">删除</button>
          </div>
        </div>
      </div>
      <div v-if="filteredList.length === 0" class="text-center py-12 text-gray-400 bg-white dark:bg-dark-100 rounded-xl">暂无FAQ</div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <div v-if="showDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-dark-100 rounded-2xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">{{ editingId ? '编辑FAQ' : '添加FAQ' }}</h3>
        <div class="space-y-4">
          <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">分类</label>
            <select v-model="form.category" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">问题</label><input v-model="form.question" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200" /></div>
          <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">答案</label><textarea v-model="form.answer" rows="4" class="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200"></textarea></div>
          <div><label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">排序权重</label><input v-model.number="form.sortOrder" type="number" class="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-200 w-32" /></div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button @click="showDialog = false" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">取消</button>
          <button @click="handleSave" class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90">保存</button>
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
  { id: 1, category: '支付充值', question: '圣力充值后多久到账？', answer: '正常情况下圣力充值即时到账。如超过10分钟未到账，请检查支付是否成功，或提交工单联系客服处理。', searchCount: 1256, sortOrder: 1, status: 'active', createdAt: '2025-06-01 10:00', updatedAt: '2025-06-01 10:00' },
  { id: 2, category: 'AI工具', question: 'AI工具调用失败会扣圣力吗？', answer: '不会。如果AI工具调用失败（状态为failed），系统会自动退还消耗的圣力。一般会在5分钟内退还到您的账户。', searchCount: 980, sortOrder: 2, status: 'active', createdAt: '2025-06-01 10:00', updatedAt: '2025-06-01 10:00' },
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
