<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">圣力套餐</h2>
      <el-button type="primary" @click="openDialog()">+ 新增套餐</el-button>
    </div>
    <div class="cyber-card p-4">
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="coinAmount" label="圣力数" width="100" />
        <el-table-column prop="bonusCoins" label="赠送" width="100" />
        <el-table-column prop="price" label="售价(元)" width="100" />
        <el-table-column prop="originalPrice" label="原价" width="100" />
        <el-table-column label="推荐" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isRecommended" type="warning">推荐</el-tag>
            <span v-else style="color:#808099;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status === 'active' ? '上架' : '下架' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑套餐' : '新增套餐'" width="450px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="圣力数"><el-input-number v-model="form.coinAmount" :min="1" class="w-full" /></el-form-item>
        <el-form-item label="赠送"><el-input-number v-model="form.bonusCoins" :min="0" class="w-full" /></el-form-item>
        <el-form-item label="售价"><el-input-number v-model="form.price" :min="0" :precision="2" class="w-full" /></el-form-item>
        <el-form-item label="原价"><el-input-number v-model="form.originalPrice" :min="0" :precision="2" class="w-full" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" class="w-full" /></el-form-item>
        <el-form-item label="推荐">
          <el-switch v-model="form.isRecommended" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="active">上架</el-radio>
            <el-radio label="inactive">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api'

const loading = ref(false)
const list = ref<any[]>([])
const dialogVisible = ref(false)
const form = reactive<any>({ id: null, name: '', coinAmount: 100, bonusCoins: 0, price: 0, originalPrice: 0, sortOrder: 0, isRecommended: 0, status: 'active' })

async function loadData() {
  loading.value = true
  try {
    const res = await adminApi.getCoinPackages()
    list.value = res.data || []
  } catch (e: any) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function openDialog(row?: any) {
  if (row) {
    Object.assign(form, JSON.parse(JSON.stringify(row)))
  } else {
    Object.assign(form, { id: null, name: '', coinAmount: 100, bonusCoins: 0, price: 0, originalPrice: 0, sortOrder: list.value.length + 1, isRecommended: 0, status: 'active' })
  }
  dialogVisible.value = true
}

async function submit() {
  try {
    if (form.id) {
      await adminApi.updateCoinPackage(form.id, form)
    } else {
      await adminApi.createCoinPackage(form)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  }
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除套餐「${row.name}」？`)
    await adminApi.deleteCoinPackage(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch { /* cancelled */ }
}

onMounted(loadData)
</script>
