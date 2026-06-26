<template>
  <div class="cyber-page">
    <div class="page-header"><h1>🔗 分销管理</h1><p class="subtitle">分销体系与佣金规则配置</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-info"><div class="stat-value">{{ stats.distributors }}</div><div class="stat-label">分销商</div></div></div>
      <div class="stat-card"><div class="stat-icon">🔗</div><div class="stat-info"><div class="stat-value">{{ stats.totalLinks }}</div><div class="stat-label">推广链接</div></div></div>
      <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="stat-value">¥{{ stats.totalCommission }}</div><div class="stat-label">累计佣金</div></div></div>
      <div class="stat-card"><div class="stat-icon">📈</div><div class="stat-info"><div class="stat-value">{{ stats.conversionRate }}</div><div class="stat-label">转化率</div></div></div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>分销规则</h2><el-button type="primary" size="small" @click="openRulesDialog">编辑规则</el-button></div>
      <div style="display: flex; gap: 2rem; flex-wrap: wrap; padding: 0.5rem 0;">
        <div><span style="color: #8888aa;">默认佣金比例：</span><span style="color: #00f0ff;">{{ rules.defaultRate }}%</span></div>
        <div><span style="color: #8888aa;">VIP佣金比例：</span><span style="color: #00f0ff;">{{ rules.vipRate }}%</span></div>
        <div><span style="color: #8888aa;">最低提现：</span><span style="color: #00ff88;">¥{{ rules.minWithdraw }}</span></div>
        <div><span style="color: #8888aa;">结算周期：</span><span style="color: #e0e0ff;">{{ rules.settleCycle }}</span></div>
      </div>
    </div>
    <div class="cyber-card">
      <div class="card-header"><h2>推广链接列表</h2></div>
      <el-table :data="links" style="width: 100%" class="cyber-table" v-loading="loading">
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="link" label="推广链接" min-width="200" />
        <el-table-column prop="referrals" label="推荐人数" width="100" />
        <el-table-column prop="totalSales" label="累计销售" width="120" />
        <el-table-column prop="commission" label="累计佣金" width="120">
          <template #default="{ row }"><span style="color:#00ff88">¥{{ row.commission }}</span></template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }"><el-tag :type="row.status === '活跃' ? 'success' : 'info'" size="small" effect="dark">{{ row.status }}</el-tag></template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default><el-button size="small" type="primary" link>详情</el-button></template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑规则弹窗 -->
    <el-dialog v-model="rulesDialogVisible" title="编辑分销规则" width="500px" destroy-on-close>
      <el-form label-width="110px" class="cyber-form" style="padding: 0 20px;">
        <el-form-item label="默认佣金比例(%)">
          <el-input-number v-model="rulesForm.defaultRate" :min="0" :max="100" :step="0.1" class="w-full" />
        </el-form-item>
        <el-form-item label="VIP佣金比例(%)">
          <el-input-number v-model="rulesForm.vipRate" :min="0" :max="100" :step="0.1" class="w-full" />
        </el-form-item>
        <el-form-item label="最低提现金额(¥)">
          <el-input-number v-model="rulesForm.minWithdraw" :min="0" :step="10" class="w-full" />
        </el-form-item>
        <el-form-item label="结算周期">
          <el-select v-model="rulesForm.settleCycle" class="w-full">
            <el-option label="实时结算" value="实时" />
            <el-option label="日结" value="日结" />
            <el-option label="周结" value="周结" />
            <el-option label="月结" value="月结" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rulesDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRules">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import service from '@/api/request'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const stats = ref({ distributors: 0, totalLinks: 0, totalCommission: '0', conversionRate: '0%' })
const links = ref<any[]>([])
const rules = ref({ defaultRate: 0, vipRate: 0, minWithdraw: 0, settleCycle: '' })

// 编辑规则弹窗
const rulesDialogVisible = ref(false)
const rulesForm = ref({ defaultRate: 0, vipRate: 0, minWithdraw: 0, settleCycle: '' })

async function fetchData() {
  loading.value = true
  try {
    const res = await service.get('/admin/distribution')
    if (res.data.code === 0) {
      const data = res.data.data
      links.value = data.links || []
      const s = data.stats || {}
      stats.value = {
        distributors: s.distributors || 0,
        totalLinks: s.totalLinks || 0,
        totalCommission: s.totalCommission || '0',
        conversionRate: s.conversionRate || '0%'
      }
      if (data.rules) {
        rules.value = { ...data.rules }
      }
    }
  } catch (e) {
    ElMessage.error('加载分销数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

function openRulesDialog() {
  rulesForm.value = { ...rules.value }
  rulesDialogVisible.value = true
}

async function saveRules() {
  try {
    const res = await service.put('/admin/distribution/rules', rulesForm.value)
    if (res.data.code === 0) {
      rules.value = { ...rulesForm.value }
      ElMessage.success('规则保存成功')
      rulesDialogVisible.value = false
    }
  } catch (e) {
    ElMessage.error('保存规则失败')
  }
}
</script>
<style scoped>
.cyber-page { padding: 1.5rem; min-height: 100vh; background: #0a0a0f; color: #e0e0ff; }
.page-header { margin-bottom: 1.5rem; }
.page-header h1 { font-size: 1.5rem; font-weight: bold; color: #00f0ff; margin: 0 0 0.25rem 0; }
.subtitle { color: #8888aa; font-size: 0.875rem; margin: 0; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.stat-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; }
.stat-icon { font-size: 2rem; }
.stat-value { font-size: 1.5rem; font-weight: bold; color: #00f0ff; font-family: 'JetBrains Mono', monospace; }
.stat-label { font-size: 0.75rem; color: #8888aa; }
.cyber-card { background: rgba(15,15,25,0.8); border: 1px solid rgba(0,240,255,0.15); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1.5rem; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.card-header h2 { font-size: 1rem; font-weight: bold; color: #e0e0ff; margin: 0; }
.cyber-table { --el-table-bg-color: transparent; --el-table-tr-bg-color: transparent; --el-table-header-bg-color: rgba(0,240,255,0.05); --el-table-row-hover-bg-color: rgba(0,240,255,0.08); --el-table-border-color: rgba(0,240,255,0.1); --el-table-text-color: #e0e0ff; --el-table-header-text-color: #00f0ff; }
.w-full { width: 100%; }
</style>
