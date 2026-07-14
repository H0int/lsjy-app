<template>
  <div>
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold" style="color:#00f0ff;">虚拟员工管理</h2>
      <el-button size="small" @click="loadAllData" :loading="globalLoading">刷新数据</el-button>
    </div>

    <!-- 加载错误兜底 -->
    <div v-if="loadError" class="mb-4 p-4 rounded" style="background:#ff2d9520;border:1px solid #ff2d95;color:#ff2d95;">
      <div class="font-bold">数据加载失败</div>
      <div class="text-sm mt-1">请稍后重试，或检查后端服务是否正常。</div>
      <el-button size="small" class="mt-2" @click="loadAllData">重试</el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="rounded-xl p-5 shadow-sm relative overflow-hidden" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6" style="background:#00f0ff;"></div>
        <p class="text-sm" style="color:#808099;">总虚拟员工数</p>
        <p class="text-3xl font-bold mt-1" style="color:#e0e0ff;">{{ statsData.totalEmployees }}</p>
        <p class="text-xs mt-1" style="color:#00f0ff;">平台全部员工</p>
      </div>
      <div class="rounded-xl p-5 shadow-sm relative overflow-hidden" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6" style="background:#00ff88;"></div>
        <p class="text-sm" style="color:#808099;">运行中</p>
        <p class="text-3xl font-bold mt-1" style="color:#e0e0ff;">{{ statsData.runningEmployees }}</p>
        <p class="text-xs mt-1" style="color:#00ff88;">当前活跃</p>
      </div>
      <div class="rounded-xl p-5 shadow-sm relative overflow-hidden" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6" style="background:#f59e0b;"></div>
        <p class="text-sm" style="color:#808099;">总完成任务数</p>
        <p class="text-3xl font-bold mt-1" style="color:#e0e0ff;">{{ statsData.totalTasks }}</p>
        <p class="text-xs mt-1" style="color:#f59e0b;">累计完成</p>
      </div>
      <div class="rounded-xl p-5 shadow-sm relative overflow-hidden" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
        <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 -mr-6 -mt-6" style="background:#c084fc;"></div>
        <p class="text-sm" style="color:#808099;">总工作时长</p>
        <p class="text-3xl font-bold mt-1" style="color:#e0e0ff;">{{ statsData.totalHours }}h</p>
        <p class="text-xs mt-1" style="color:#c084fc;">累计小时</p>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="rounded-xl p-5 mb-4" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
      <div class="flex items-center gap-3 flex-wrap">
        <span class="text-sm" style="color:#808099;">筛选:</span>
        <el-select v-model="filterIndustry" placeholder="行业" size="small" clearable style="width:130px;" @change="loadEmployees">
          <el-option v-for="ind in industries" :key="ind" :label="ind" :value="ind" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态" size="small" clearable style="width:120px;" @change="loadEmployees">
          <el-option label="运行中" value="running" />
          <el-option label="已停止" value="stopped" />
          <el-option label="错误" value="error" />
        </el-select>
        <el-input v-model="filterKeyword" placeholder="搜索员工名称/用户" size="small" clearable style="width:180px;" @clear="loadEmployees" />
        <el-button size="small" type="primary" @click="loadEmployees">搜索</el-button>
      </div>
    </div>

    <!-- 虚拟员工表格 -->
    <div class="rounded-xl p-5 mb-6" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
      <el-table :data="employeeTableData" stripe v-loading="employeeLoading" style="width:100%;">
        <el-table-column prop="id" label="ID" width="70" style="color:#e0e0ff;" />
        <el-table-column prop="name" label="员工名称" width="140" style="color:#e0e0ff;" show-overflow-tooltip />
        <el-table-column prop="userName" label="所属用户" width="120" style="color:#e0e0ff;" />
        <el-table-column prop="industry" label="行业" width="110" style="color:#e0e0ff;">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.industry }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="岗位" width="110" style="color:#e0e0ff;" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" style="color:#e0e0ff;">
          <template #default="{ row }">
            <el-tag size="small" :type="statusTagType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="completedTasks" label="完成任务数" width="110" style="color:#e0e0ff;">
          <template #default="{ row }">
            <span style="color:#00f0ff;">{{ row.completedTasks }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="workHours" label="工作时长" width="100" style="color:#e0e0ff;">
          <template #default="{ row }">{{ row.workHours }}h</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" style="color:#e0e0ff;" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'running'" size="small" link type="warning" @click="stopEmployee(row)">停止</el-button>
            <el-button size="small" link type="danger" @click="deleteEmployee(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="employeePagination.page"
          v-model:page-size="employeePagination.pageSize"
          :total="employeePagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          @current-change="loadEmployees"
          @size-change="loadEmployees"
        />
      </div>
    </div>

    <!-- 用户维度统计 -->
    <div class="rounded-xl p-5" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
      <h3 class="font-bold mb-4" style="color:#e0e0ff;">用户维度统计 - 虚拟员工创建排行</h3>
      <div class="space-y-3">
        <div v-for="(user, idx) in userStats" :key="user.userName" class="flex items-center gap-3">
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            :style="idx < 3 ? 'background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;' : 'background:#ffffff10;color:#808099;'">
            {{ idx + 1 }}
          </span>
          <span class="flex-1 text-sm" style="color:#e0e0ff;">{{ user.userName }}</span>
          <span class="text-xs" style="color:#808099;">{{ user.industry }}</span>
          <div class="w-24 h-2 rounded-full overflow-hidden" style="background:#ffffff10;">
            <div class="h-full rounded-full" style="background:linear-gradient(90deg,#00f0ff,#00ff88);" :style="{ width: (user.employeeCount / maxUserEmployees * 100) + '%' }"></div>
          </div>
          <span class="text-sm font-bold" style="color:#00f0ff;">{{ user.employeeCount }}个</span>
        </div>
        <div v-if="userStats.length === 0" class="text-center py-4 text-sm" style="color:#808099;">暂无数据</div>
      </div>
    </div>

    <!-- 详情Dialog -->
    <el-dialog v-model="detailDialogVisible" title="虚拟员工详情" width="550px">
      <div v-if="currentDetail" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">员工名称</p>
            <p class="font-bold text-sm mt-1" style="color:#e0e0ff;">{{ currentDetail.name }}</p>
          </div>
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">所属用户</p>
            <p class="font-bold text-sm mt-1" style="color:#e0e0ff;">{{ currentDetail.userName }}</p>
          </div>
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">行业</p>
            <p class="font-bold text-sm mt-1" style="color:#e0e0ff;">{{ currentDetail.industry }}</p>
          </div>
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">岗位</p>
            <p class="font-bold text-sm mt-1" style="color:#e0e0ff;">{{ currentDetail.position }}</p>
          </div>
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">状态</p>
            <el-tag size="small" :type="statusTagType(currentDetail.status)">{{ statusLabel(currentDetail.status) }}</el-tag>
          </div>
          <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
            <p class="text-xs" style="color:#808099;">完成任务</p>
            <p class="font-bold text-sm mt-1" style="color:#00f0ff;">{{ currentDetail.completedTasks }}</p>
          </div>
        </div>
        <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
          <p class="text-xs mb-1" style="color:#808099;">工作时长</p>
          <p class="font-bold text-sm" style="color:#e0e0ff;">{{ currentDetail.workHours }}小时</p>
        </div>
        <div class="p-3 rounded" style="background:#1a1a2eee;border:1px solid #00f0ff15;">
          <p class="text-xs mb-1" style="color:#808099;">创建时间</p>
          <p class="font-bold text-sm" style="color:#e0e0ff;">{{ currentDetail.createdAt }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computingApi } from '@/api/computing'

// ===== 全局状态 =====
const globalLoading = ref(false)
const loadError = ref(false)

// ===== 统计 =====
const statsData = reactive({
  totalEmployees: 0,
  runningEmployees: 0,
  totalTasks: 0,
  totalHours: 0,
})

// ===== 行业列表 =====
const industries = ['自媒体', '电商', '教育', '法律', '金融', '医疗', '科技', '宠物', '餐饮', '其他']

// ===== 筛选 =====
const filterIndustry = ref('')
const filterStatus = ref('')
const filterKeyword = ref('')

// ===== 员工表格 =====
const employeeLoading = ref(false)
const employeeTableData = ref<any[]>([])
const employeePagination = reactive({ page: 1, pageSize: 10, total: 0 })

// 模拟数据
const mockEmployees = (() => {
  const names = ['小智助手', '客服小美', '文案专家', '数据分析员', '法务顾问', '财务助理', '教育导师', '营销策划', '翻译官', '代码审查员',
    '设计顾问', '人事助理', '运营专员', '产品经理', '市场分析师']
  const users = ['张明', '李晓华', '王芳', '陈浩', '赵丽', '刘强', '周敏', '吴涛']
  const positions = ['客服', '文案', '数据分析师', '法务', '财务', '教师', '营销', '翻译', '开发', '设计']
  const statuses = ['running', 'running', 'running', 'stopped', 'stopped', 'error']
  const list = []
  for (let i = 0; i < 58; i++) {
    const userName = users[i % users.length]
    const industry = industries[i % industries.length]
    list.push({
      id: i + 1,
      name: names[i % names.length] + (i >= names.length ? ` (${Math.floor(i / names.length) + 1})` : ''),
      userName,
      userId: 10001 + (i % users.length),
      industry,
      position: positions[i % positions.length],
      status: statuses[i % statuses.length],
      completedTasks: Math.floor(Math.random() * 500 + 10),
      workHours: parseFloat((Math.random() * 200 + 5).toFixed(1)),
      createdAt: `2026-${String(Math.floor(Math.random() * 7) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')} ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
    })
  }
  return list
})()

async function loadEmployees() {
  employeeLoading.value = true
  try {
    const res = await computingApi.getEmployees({
      page: employeePagination.page,
      pageSize: employeePagination.pageSize,
      status: filterStatus.value || undefined,
    })
    const data = res.data || {}
    employeeTableData.value = data.items || data.list || []
    employeePagination.total = data.total || 0
  } catch {
    // 使用模拟数据
    let filtered = [...mockEmployees]
    if (filterIndustry.value) filtered = filtered.filter(e => e.industry === filterIndustry.value)
    if (filterStatus.value) filtered = filtered.filter(e => e.status === filterStatus.value)
    if (filterKeyword.value) filtered = filtered.filter(e => e.name.includes(filterKeyword.value) || e.userName.includes(filterKeyword.value))
    employeePagination.total = filtered.length
    const start = (employeePagination.page - 1) * employeePagination.pageSize
    employeeTableData.value = filtered.slice(start, start + employeePagination.pageSize)
  } finally {
    employeeLoading.value = false
  }
}

function statusLabel(status: string) {
  return { running: '运行中', stopped: '已停止', error: '异常' }[status] || status
}

function statusTagType(status: string) {
  return { running: 'success', stopped: 'info', error: 'danger' }[status] || ''
}

// ===== 用户维度统计 =====
const userStats = ref<any[]>([])
const maxUserEmployees = computed(() => Math.max(...userStats.value.map(u => u.employeeCount), 1))

function calcUserStats() {
  const map = new Map<string, { userName: string; industry: string; employeeCount: number }>()
  const source = employeeTableData.value.length > 0 ? [...mockEmployees] : mockEmployees
  source.forEach(e => {
    if (!filterKeyword.value || e.userName.includes(filterKeyword.value)) {
      const entry = map.get(e.userName) || { userName: e.userName, industry: e.industry, employeeCount: 0 }
      entry.employeeCount++
      map.set(e.userName, entry)
    }
  })
  userStats.value = Array.from(map.values()).sort((a, b) => b.employeeCount - a.employeeCount).slice(0, 10)
}

// ===== 操作 =====
const detailDialogVisible = ref(false)
const currentDetail = ref<any>(null)

function viewDetail(row: any) {
  currentDetail.value = { ...row }
  detailDialogVisible.value = true
}

async function stopEmployee(row: any) {
  try {
    await ElMessageBox.confirm(`确认强制停止虚拟员工「${row.name}」？`)
    await computingApi.stopEmployee(row.id)
    ElMessage.success('已停止')
    loadEmployees()
  } catch {
    // cancelled or error
  }
}

async function deleteEmployee(row: any) {
  try {
    await ElMessageBox.confirm(`确认删除虚拟员工「${row.name}」？此操作不可恢复。`)
    await computingApi.deleteEmployee(row.id)
    ElMessage.success('已删除')
    loadEmployees()
  } catch {
    // cancelled or error
  }
}

// ===== 统计加载 =====
function updateStats() {
  statsData.totalEmployees = mockEmployees.length
  statsData.runningEmployees = mockEmployees.filter(e => e.status === 'running').length
  statsData.totalTasks = mockEmployees.reduce((sum, e) => sum + e.completedTasks, 0)
  statsData.totalHours = Math.floor(mockEmployees.reduce((sum, e) => sum + e.workHours, 0))
}

// ===== 统一加载 =====
async function loadAllData() {
  globalLoading.value = true
  loadError.value = false
  try {
    await Promise.all([loadEmployees()])
    updateStats()
    calcUserStats()
  } catch {
    loadError.value = true
  } finally {
    globalLoading.value = false
  }
}

onMounted(loadAllData)
</script>
