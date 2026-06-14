<template>
  <div class="max-w-4xl">
    <div class="cyber-card mb-6">
      <h3 class="card-title mb-4">⚙️ 基础配置</h3>
      <el-form label-position="top">
        <div class="cyber-grid-2">
          <el-form-item label="平台名称">
            <el-input v-model="settings.platformName" />
          </el-form-item>
          <el-form-item label="平台域名">
            <el-input v-model="settings.domain" />
          </el-form-item>
          <el-form-item label="管理员邮箱">
            <el-input v-model="settings.adminEmail" />
          </el-form-item>
          <el-form-item label="新用户注册赠送算力">
            <el-input-number v-model="settings.newUserBonus" :min="0" :max="1000" class="w-full" />
          </el-form-item>
        </div>
      </el-form>
    </div>

    <div class="cyber-card mb-6">
      <h3 class="card-title mb-4">💰 计费配置</h3>
      <el-form label-position="top">
        <div class="cyber-grid-2">
          <el-form-item label="默认算力单价（元）">
            <el-input-number v-model="settings.unitPrice" :min="0.1" :step="0.1" class="w-full" />
          </el-form-item>
          <el-form-item label="企业版折扣">
            <el-select v-model="settings.enterpriseDiscount" class="w-full">
              <el-option label="9折" value="0.9" />
              <el-option label="8折" value="0.8" />
              <el-option label="7折" value="0.7" />
            </el-select>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <div class="cyber-card mb-6">
      <h3 class="card-title mb-4">🔔 通知配置</h3>
      <el-form label-position="top">
        <el-form-item label="开启邮件通知">
          <el-switch v-model="settings.emailNotify" />
        </el-form-item>
        <el-form-item label="开启短信通知">
          <el-switch v-model="settings.smsNotify" />
        </el-form-item>
      </el-form>
    </div>

    <button @click="saveSettings" class="cyber-btn cyber-btn-cyan cyber-btn-save" :disabled="saving">
      {{ saving ? '保存中...' : '💾 保存配置' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { adminApi } from '@/api'
import { ElMessage } from 'element-plus'

const saving = ref(false)
const settings = reactive({
  platformName: '罗圣纪元SaaS平台',
  domain: 'lsjyapp.cn',
  adminEmail: 'admin@lsjyapp.cn',
  newUserBonus: 50,
  unitPrice: 0.6,
  enterpriseDiscount: '0.8',
  emailNotify: true,
  smsNotify: false
})

async function loadSettings() {
  try {
    const res = await adminApi.getSystemSettings()
    Object.assign(settings, res.data)
  } catch { /* use defaults */ }
}

async function saveSettings() {
  saving.value = true
  try {
    await adminApi.saveSystemSettings({ ...settings })
    ElMessage.success('配置已保存')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => loadSettings())
</script>

<style scoped>
.max-w-4xl { max-width: 900px; }
.cyber-card { background: #12121f; border: 1px solid #1a1a2e; border-radius: 12px; padding: 24px; }
.card-title { font-size: 14px; font-weight: 700; color: #e0e0ff; }
.cyber-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.cyber-btn { padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; }
.cyber-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.cyber-btn-cyan { background: rgba(0,240,255,0.1); color: #00f0ff; border-color: #00f0ff55; }
.cyber-btn-cyan:hover:not(:disabled) { background: rgba(0,240,255,0.2); box-shadow: 0 0 20px rgba(0,240,255,0.3); }
.cyber-btn-save { font-size: 15px; padding: 14px 32px; }
.mb-6 { margin-bottom: 24px; }
.mb-4 { margin-bottom: 16px; }
.w-full { width: 100%; }
</style>
