<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">增值套餐管理</h2>
      <el-button type="primary" @click="openDialog()">+ 新增套餐</el-button>
    </div>

    <!-- 加载错误兜底 -->
    <div v-if="loadError" class="mb-4 p-4 rounded" style="background:#ff2d9520;border:1px solid #ff2d95;color:#ff2d95;">
      <div class="font-bold">数据加载失败</div>
      <div class="text-sm mt-1">请稍后重试，或检查后端服务是否正常。</div>
      <el-button size="small" class="mt-2" @click="loadPackages">重试</el-button>
    </div>

    <!-- 套餐卡片网格 2x2 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div v-for="pkg in packageList" :key="pkg.id"
        class="rounded-xl p-6 relative overflow-hidden transition-all hover:border-opacity-40"
        style="background:#1a1a2eee;border:1px solid #00f0ff25;">
        <!-- 角标 -->
        <div v-if="pkg.isHot" class="absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg" style="background:linear-gradient(135deg,#ff4d4f,#f59e0b);color:#fff;">
          HOT
        </div>
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold" style="color:#e0e0ff;">{{ pkg.name }}</h3>
            <div class="flex items-center gap-2 mt-1">
              <el-tag size="small" :type="pkg.type === 'monthly' ? '' : 'warning'">
                {{ pkg.type === 'monthly' ? '月度' : pkg.type === 'yearly' ? '年度' : pkg.type === 'onetime' ? '一次性' : pkg.type }}
              </el-tag>
              <el-tag size="small" :type="pkg.isActive ? 'success' : 'info'">
                {{ pkg.isActive ? '上架' : '下架' }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 价格 -->
        <div class="flex items-baseline gap-2 mb-4">
          <span class="text-3xl font-bold" style="color:#00f0ff;">¥{{ pkg.price }}</span>
          <span v-if="pkg.originalPrice > pkg.price" class="text-sm line-through" style="color:#808099;">¥{{ pkg.originalPrice }}</span>
          <span v-if="pkg.originalPrice > pkg.price" class="text-xs px-2 py-0.5 rounded-full" style="background:#00f0ff20;color:#00f0ff;">
            省¥{{ (pkg.originalPrice - pkg.price).toFixed(0) }}
          </span>
        </div>

        <!-- 功能列表 -->
        <div class="space-y-2 mb-5">
          <div v-for="feat in pkg.features" :key="feat" class="flex items-center gap-2 text-sm">
            <span style="color:#00ff88;">&#10003;</span>
            <span style="color:#e0e0ff;">{{ feat }}</span>
          </div>
        </div>

        <!-- 操作 -->
        <div class="flex gap-2 pt-4" style="border-top:1px solid #00f0ff15;">
          <el-button size="small" type="primary" plain @click="openDialog(pkg)">编辑</el-button>
          <el-button size="small" :type="pkg.isActive ? 'warning' : 'success'" plain @click="toggleStatus(pkg)">
            {{ pkg.isActive ? '下架' : '上架' }}
          </el-button>
          <el-button size="small" type="danger" plain @click="handleDelete(pkg)">删除</el-button>
        </div>
      </div>

      <!-- 空状态占位 -->
      <div v-if="packageList.length === 0 && !loading" class="col-span-2 text-center py-12" style="color:#808099;">
        <p class="text-4xl mb-2">📦</p>
        <p>暂无套餐，点击右上角新增</p>
      </div>
    </div>

    <!-- 新增/编辑 Dialog -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑套餐' : '新增套餐'" width="550px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="套餐名称">
          <el-input v-model="form.name" placeholder="例如：算力畅享月卡" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width:100%;">
            <el-option label="月度" value="monthly" />
            <el-option label="年度" value="yearly" />
            <el-option label="一次性" value="onetime" />
          </el-select>
        </el-form-item>
        <el-form-item label="售价(元)">
          <el-input-number v-model="form.price" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="原价(元)">
          <el-input-number v-model="form.originalPrice" :min="0" :precision="2" class="w-full" />
        </el-form-item>
        <el-form-item label="功能列表">
          <div class="w-full space-y-2">
            <div v-for="(feat, idx) in form.features" :key="idx" class="flex gap-2">
              <el-input v-model="form.features[idx]" size="small" />
              <el-button size="small" type="danger" link @click="form.features.splice(idx, 1)">移除</el-button>
            </div>
            <el-button size="small" @click="form.features.push('')">+ 添加功能</el-button>
          </div>
        </el-form-item>
        <el-form-item label="热门标记">
          <el-switch v-model="form.isHot" />
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
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computingApi } from '@/api/computing'

// ===== 状态 =====
const loading = ref(false)
const loadError = ref(false)
const packageList = ref<any[]>([])
const dialogVisible = ref(false)

// ===== 表单 =====
const form = reactive<any>({
  id: null,
  name: '',
  type: 'monthly',
  price: 0,
  originalPrice: 0,
  features: [''] as string[],
  isHot: false,
  status: 'active',
})

// ===== 加载（从管理API获取全部套餐，包含上架/下架状态） =====
async function loadPackages() {
  loading.value = true
  loadError.value = false
  try {
    const res = await computingApi.adminGetPackages()
    const data = res.data || []
    packageList.value = Array.isArray(data) ? data : []
  } catch (e: any) {
    loadError.value = true
    ElMessage.error(e.message || '加载套餐失败')
    packageList.value = []
  } finally {
    loading.value = false
  }
}

// ===== 新增/编辑 =====
function openDialog(pkg?: any) {
  if (pkg) {
    Object.assign(form, JSON.parse(JSON.stringify(pkg)))
    form.features = [...(pkg.features || [])]
    form.status = pkg.isActive ? 'active' : 'inactive'
  } else {
    Object.assign(form, {
      id: null, name: '', type: 'monthly', price: 0, originalPrice: 0,
      features: [''], isHot: false, status: 'active',
    })
  }
  dialogVisible.value = true
}

async function submitForm() {
  // 过滤空功能项
  form.features = form.features.filter((f: string) => f.trim())
  if (!form.name) {
    ElMessage.warning('请输入套餐名称')
    return
  }
  try {
    const payload = {
      name: form.name,
      type: form.type,
      description: form.name,
      price: form.price,
      originalPrice: form.originalPrice,
      features: form.features,
      duration: form.type === 'yearly' ? 'year' : 'once',
      isActive: form.status === 'active',
    }
    if (form.id) {
      await computingApi.adminUpdatePackage(form.id, payload)
    } else {
      await computingApi.adminCreatePackage(payload)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadPackages()
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  }
}

// ===== 上架/下架（调真实API） =====
async function toggleStatus(pkg: any) {
  const newActive = !pkg.isActive
  const action = newActive ? '上架' : '下架'
  try {
    await ElMessageBox.confirm(`确认${action}套餐「${pkg.name}」？`)
    await computingApi.adminUpdatePackage(pkg.id, { isActive: newActive })
    ElMessage.success(`${action}成功`)
    loadPackages()
  } catch {
    // cancelled or error
  }
}

// ===== 删除（调真实API） =====
async function handleDelete(pkg: any) {
  try {
    await ElMessageBox.confirm(`确认删除套餐「${pkg.name}」？此操作不可恢复。`)
    await computingApi.adminDeletePackage(pkg.id)
    ElMessage.success('删除成功')
    loadPackages()
  } catch {
    // cancelled or error
  }
}

onMounted(loadPackages)
</script>
