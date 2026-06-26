<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold" style="color: #e0e0ff;">💰 圣力套餐管理</h2>
      <button @click="openCreate" class="px-4 py-2 rounded-lg text-sm font-bold"
        style="background: linear-gradient(135deg, #00f0ff, #7c3aed); color: #000;">
        + 新建套餐
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="pkg in packages" :key="pkg.id"
        class="rounded-xl p-5 transition-all hover:-translate-y-1"
        :style="{ background: 'rgba(13,13,26,0.8)', border: `1px solid ${pkg.highlight ? '#00f0ff' : '#1a1a2e'}` }">
        <div v-if="pkg.highlight" class="text-xs font-bold mb-2 px-2 py-0.5 rounded inline-block"
          style="background: rgba(0,240,255,0.1); color: #00f0ff;">推荐</div>
        <div class="text-3xl font-bold mb-1" style="color: #e0e0ff;">{{ pkg.coins }}</div>
        <div class="text-sm mb-3" style="color: #5a5a7a;">圣力</div>
        <div class="text-2xl font-bold mb-1" style="color: #ffb800;">¥{{ pkg.price }}</div>
        <div class="text-xs mb-4" style="color: #5a5a7a;">原价 ¥{{ pkg.originalPrice }}</div>
        <div class="text-xs mb-4 p-2 rounded" style="background: rgba(0,240,255,0.05); color: #00f0ff;">
          {{ pkg.bonus }}
        </div>
        <div class="flex items-center justify-between text-xs" style="color: #5a5a7a;">
          <span>已售 {{ pkg.sold }}</span>
          <span :style="pkg.status === 'active' ? 'color: #00ff88;' : 'color: #ff4444;'">
            {{ pkg.status === 'active' ? '上架中' : '已下架' }}
          </span>
        </div>
        <div class="flex gap-2 mt-3 pt-3" style="border-top: 1px solid #1a1a2e;">
          <button @click="openEdit(pkg)" class="flex-1 py-1.5 rounded text-xs" style="background: rgba(0,240,255,0.08); color: #00f0ff;">编辑</button>
          <button @click="toggleStatus(pkg)" class="flex-1 py-1.5 rounded text-xs" :style="pkg.status === 'active' ? 'background:rgba(255,184,0,0.08);color:#ffb800;' : 'background:rgba(0,255,136,0.08);color:#00ff88;'">
            {{ pkg.status === 'active' ? '下架' : '上架' }}
          </button>
          <button @click="deletePackage(pkg)" class="flex-1 py-1.5 rounded text-xs" style="background: rgba(255,68,68,0.08); color: #ff4444;">删除</button>
        </div>
      </div>
    </div>

    <el-dialog v-model="showForm" :title="editingId ? '编辑套餐' : '新建套餐'" width="480px" :close-on-click-modal="false">
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div><label style="color:#8888aa;font-size:12px;">套餐名称</label>
          <input v-model="form.name" placeholder="如: 50圣力套餐" style="width:100%;padding:8px 12px;background:#12121f;border:1px solid #1a1a2e;color:#e0e0ff;border-radius:8px;margin-top:4px;" /></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div><label style="color:#8888aa;font-size:12px;">圣力数量</label>
            <input v-model.number="form.coins" type="number" style="width:100%;padding:8px 12px;background:#12121f;border:1px solid #1a1a2e;color:#e0e0ff;border-radius:8px;margin-top:4px;" /></div>
          <div><label style="color:#8888aa;font-size:12px;">价格(元)</label>
            <input v-model.number="form.price" type="number" step="0.1" style="width:100%;padding:8px 12px;background:#12121f;border:1px solid #1a1a2e;color:#e0e0ff;border-radius:8px;margin-top:4px;" /></div>
        </div>
        <div><label style="color:#8888aa;font-size:12px;">赠送说明</label>
          <input v-model="form.bonus" placeholder="如: 送10圣力" style="width:100%;padding:8px 12px;background:#12121f;border:1px solid #1a1a2e;color:#e0e0ff;border-radius:8px;margin-top:4px;" /></div>
      </div>
      <template #footer>
        <button @click="showForm = false" style="padding:8px 20px;background:transparent;border:1px solid #1a1a2e;color:#8888aa;border-radius:8px;">取消</button>
        <button @click="savePackage" style="padding:8px 20px;background:linear-gradient(135deg,#00f0ff,#7c3aed);color:#000;border:none;border-radius:8px;font-weight:bold;">保存</button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import service from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const packages = ref<any[]>([])
const showForm = ref(false)
const editingId = ref<number | null>(null)
const form = ref({ name: '', coins: 0, price: 0, bonus: '', status: 'active' })

async function fetchPackages() {
  loading.value = true
  try {
    const res = await service.get('/admin/coin-packages')
    if (res.data.code === 0) {
      packages.value = res.data.data
    }
  } catch (e) {
    ElMessage.error('加载套餐失败')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { name: '', coins: 0, price: 0, bonus: '', status: 'active' }
  showForm.value = true
}

function openEdit(pkg: any) {
  editingId.value = pkg.id
  form.value = { name: pkg.name, coins: pkg.coins, price: pkg.price, bonus: pkg.bonus, status: pkg.status }
  showForm.value = true
}

async function savePackage() {
  try {
    if (editingId.value) {
      await service.put(`/admin/coin-packages/${editingId.value}`, form.value)
      ElMessage.success('更新成功')
    } else {
      await service.post('/admin/coin-packages', form.value)
      ElMessage.success('创建成功')
    }
    showForm.value = false
    fetchPackages()
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

async function deletePackage(pkg: any) {
  try {
    await ElMessageBox.confirm(`确定删除套餐「${pkg.name}」？`, '确认删除', { type: 'warning' })
    await service.delete(`/admin/coin-packages/${pkg.id}`)
    ElMessage.success('删除成功')
    fetchPackages()
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

async function toggleStatus(pkg: any) {
  try {
    const newStatus = pkg.status === 'active' ? 'inactive' : 'active'
    await service.put(`/admin/coin-packages/${pkg.id}`, { ...pkg, status: newStatus })
    ElMessage.success(newStatus === 'active' ? '已上架' : '已下架')
    fetchPackages()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

onMounted(fetchPackages)
</script>

<style scoped>
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.p-2 { padding: 8px; }
.p-5 { padding: 20px; }
.px-2 { padding-left: 8px; padding-right: 8px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-0\.5 { padding-top: 2px; padding-bottom: 2px; }
.py-1\.5 { padding-top: 6px; padding-bottom: 6px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.pt-3 { padding-top: 12px; }
.text-xs { font-size: 11px; }
.text-sm { font-size: 13px; }
.text-xl { font-size: 20px; }
.text-2xl { font-size: 24px; }
.text-3xl { font-size: 30px; }
.font-bold { font-weight: 700; }
.inline-block { display: inline-block; }
.rounded { border-radius: 4px; }
.rounded-xl { border-radius: 12px; }
.rounded-lg { border-radius: 8px; }
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.flex-1 { flex: 1; }
.transition-all { transition: all 0.2s; }
.hover\:-translate-y-1:hover { transform: translateY(-4px); }
@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
</style>
