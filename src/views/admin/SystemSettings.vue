<template>
  <div class="max-w-4xl">
    <div class="bg-white dark:bg-dark-100 rounded-xl p-6 shadow-sm mb-6">
      <h3 class="font-bold text-gray-900 dark:text-white mb-4">⚙️ 基础配置</h3>
      <el-form label-position="top">
        <div class="grid sm:grid-cols-2 gap-4">
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

    <div class="bg-white dark:bg-dark-100 rounded-xl p-6 shadow-sm mb-6">
      <h3 class="font-bold text-gray-900 dark:text-white mb-4">💰 计费配置</h3>
      <el-form label-position="top">
        <div class="grid sm:grid-cols-2 gap-4">
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

    <div class="bg-white dark:bg-dark-100 rounded-xl p-6 shadow-sm mb-6">
      <h3 class="font-bold text-gray-900 dark:text-white mb-4">🔔 通知配置</h3>
      <el-form label-position="top">
        <el-form-item label="开启邮件通知">
          <el-switch v-model="settings.emailNotify" />
        </el-form-item>
        <el-form-item label="开启短信通知">
          <el-switch v-model="settings.smsNotify" />
        </el-form-item>
      </el-form>
    </div>

    <el-button type="primary" size="large" @click="saveSettings">保存配置</el-button>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

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

function saveSettings() {
  ElMessage.success('配置已保存')
}
</script>
