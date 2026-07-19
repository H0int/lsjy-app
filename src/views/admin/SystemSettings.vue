<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">系统配置</h2>
      <div class="flex gap-2">
        <el-button @click="loadData">刷新</el-button>
        <el-button type="primary" @click="save">保存配置</el-button>
      </div>
    </div>
    <div class="cyber-card p-6">
      <el-form :model="form" label-width="160px">
        <h3 class="text-sm font-bold mb-4" style="color:#00f0ff;">基础配置</h3>
        <el-form-item label="平台名称"><el-input v-model="form.siteName" /></el-form-item>
        <el-form-item label="Logo URL"><el-input v-model="form.logo" /></el-form-item>
        <el-form-item label="客服联系方式"><el-input v-model="form.contact" /></el-form-item>
        <el-form-item label="注册开关">
          <el-switch v-model="form.registrationEnabled" />
        </el-form-item>
        <el-form-item label="邀请奖励开关">
          <el-switch v-model="form.inviteEnabled" />
        </el-form-item>

        <h3 class="text-sm font-bold mb-4 mt-6" style="color:#00f0ff;">AI 配置</h3>
        <el-form-item label="默认模型"><el-input v-model="form.defaultModel" /></el-form-item>
        <el-form-item label="每日免费次数"><el-input-number v-model="form.freeDailyQuota" :min="0" class="w-full" /></el-form-item>
        <el-form-item label="新用户赠送圣力"><el-input-number v-model="form.newUserCoins" :min="0" class="w-full" /></el-form-item>

        <h3 class="text-sm font-bold mb-4 mt-6" style="color:#00f0ff;">安全策略</h3>
        <el-form-item label="登录失败锁定次数"><el-input-number v-model="form.loginLockAttempts" :min="0" class="w-full" /></el-form-item>
        <el-form-item label="Token 有效期(小时)"><el-input-number v-model="form.tokenExpireHours" :min="1" class="w-full" /></el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import service from '@/api/request'

const loading = ref(false)
const form = reactive<any>({
  siteName: '罗圣纪元',
  logo: '',
  contact: '',
  registrationEnabled: true,
  inviteEnabled: true,
  defaultModel: 'deepseek-chat',
  freeDailyQuota: 5,
  newUserCoins: 100,
  loginLockAttempts: 5,
  tokenExpireHours: 168
})

async function loadData() {
  try {
    const res = await service.get('/system/settings')
    Object.assign(form, res.data?.data || res.data || {})
  } catch (e: any) { console.warn('[API] 加载失败:', e?.message) }
}

async function save() {
  try {
    await service.post('/system/settings', form)
    ElMessage.success('保存成功')
  } catch (e: any) { console.warn('[API] 保存失败:', e?.message) }
}

onMounted(loadData)
</script>
