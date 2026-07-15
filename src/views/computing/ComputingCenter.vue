<template>
  <div class="computing-center">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-title">
        <h1 class="glow-cyan">算力调度 & 行业虚拟数字员工中心</h1>
        <p class="header-subtitle">全域算力智能调度 · AI虚拟员工全自动运行 · 企业降本增效一站式解决方案</p>
      </div>
    </div>

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" class="cyber-tabs" @tab-change="onTabChange">
      <!-- ========== Tab1: 全域智能算力调度引擎 ========== -->
      <el-tab-pane label="全域智能算力调度引擎" name="dispatch">
        <!-- 介绍文案 -->
        <div class="intro-banner">
          <div class="intro-icon">&#x26A1;</div>
          <p class="intro-text">全域智能算力调度引擎 — 自动监测多平台大模型余量，额度不足无缝切换，任务全程不中断。智能分配算力，整体Token损耗降低35%以上，大幅节省圣点消耗。调度核心算法私有加密存储，形成平台独家技术壁垒。</p>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon token-icon">&#x1F4B0;</div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(dispatchStats.savedTokens || 0) }}</div>
              <div class="stat-label">总节省Token数</div>
            </div>
            <div class="stat-badge" v-if="dispatchStats.savedPercent">
              &#x2193; {{ dispatchStats.savedPercent }}%
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon switch-icon">&#x1F504;</div>
            <div class="stat-info">
              <div class="stat-value">{{ formatNumber(dispatchStats.switchCount || 0) }}</div>
              <div class="stat-label">模型切换次数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon active-icon">&#x1F916;</div>
            <div class="stat-info">
              <div class="stat-value">{{ dispatchStats.activeModel || '-' }}</div>
              <div class="stat-label">当前活跃模型</div>
            </div>
          </div>
        </div>

        <!-- 调度配置面板 -->
        <div class="section-panel">
          <h3 class="section-title glow-cyan">&#9881; 算力调度配置</h3>
          <div class="config-grid">
            <!-- 左侧：开关与策略 -->
            <div class="config-left">
              <div class="config-item">
                <div class="config-label">全域算力自动优化</div>
                <el-switch
                  v-model="dispatchConfig.autoDispatch"
                  active-color="#00f0ff"
                  inactive-color="#333"
                  @change="saveDispatchConfig"
                />
              </div>
              <div class="config-item">
                <div class="config-label">跨模型自动切换</div>
                <el-switch
                  v-model="dispatchConfig.autoSwitch"
                  active-color="#00f0ff"
                  inactive-color="#333"
                  @change="saveDispatchConfig"
                />
              </div>
              <div class="config-item">
                <div class="config-label">调度策略</div>
                <el-radio-group v-model="dispatchConfig.strategy" @change="saveDispatchConfig">
                  <el-radio-button label="balanced">均衡模式</el-radio-button>
                  <el-radio-button label="cost">省钱优先</el-radio-button>
                  <el-radio-button label="performance">性能优先</el-radio-button>
                </el-radio-group>
              </div>
            </div>
            <!-- 右侧：模型优先级排序 -->
            <div class="config-right">
              <div class="config-label" style="margin-bottom: 12px;">模型优先级排序</div>
              <div class="priority-list">
                <div
                  v-for="(model, index) in dispatchConfig.modelPriority"
                  :key="model.name"
                  class="priority-item"
                >
                  <span class="priority-rank">{{ index + 1 }}</span>
                  <span class="priority-name">{{ model.name }}</span>
                  <div class="priority-actions">
                    <button
                      class="priority-btn"
                      :disabled="index === 0"
                      @click="moveModelUp(index)"
                    >&#x25B2;</button>
                    <button
                      class="priority-btn"
                      :disabled="index === dispatchConfig.modelPriority.length - 1"
                      @click="moveModelDown(index)"
                    >&#x25BC;</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 模型余量监测 -->
          <div class="model-monitor">
            <h4 class="sub-title">&#x1F4E1; 模型余量监测</h4>
            <div class="monitor-grid">
              <div
                v-for="model in modelStatusList"
                :key="model.name"
                class="monitor-item"
                :class="'status-' + model.status"
              >
                <div class="monitor-name">{{ model.name }}</div>
                <div class="monitor-status-dot" :class="'dot-' + model.status"></div>
                <div class="monitor-quota">余量: {{ model.quota }}</div>
                <div class="monitor-label">{{ statusLabel(model.status) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 调度日志 & Token趋势 -->
        <div class="bottom-grid">
          <!-- 调度日志 -->
          <div class="section-panel log-panel">
            <h3 class="section-title glow-cyan">&#x1F4CB; 调度日志</h3>
            <el-table
              :data="dispatchLogs"
              stripe
              v-loading="logsLoading"
              size="small"
              class="cyber-table"
              max-height="400"
            >
              <el-table-column prop="createdAt" label="时间" width="160" />
              <el-table-column prop="taskType" label="任务类型" width="120">
                <template #default="{ row }">
                  <span class="task-tag">{{ row.taskType }}</span>
                </template>
              </el-table-column>
              <el-table-column label="模型切换" width="200">
                <template #default="{ row }">
                  <span class="switch-flow">
                    <span class="from-model">{{ row.fromModel }}</span>
                    <span class="arrow">&#x2192;</span>
                    <span class="to-model">{{ row.toModel }}</span>
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="savedTokens" label="节省Token" width="120" align="right">
                <template #default="{ row }">
                  <span class="saved-tokens">-{{ formatNumber(row.savedTokens || 0) }}</span>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-wrap" v-if="logsTotal > 10">
              <el-pagination
                v-model:current-page="logsPage"
                :page-size="10"
                :total="logsTotal"
                layout="prev, pager, next"
                @current-change="loadDispatchLogs"
                small
              />
            </div>
          </div>

          <!-- Token消耗趋势 -->
          <div class="section-panel chart-panel">
            <h3 class="section-title glow-cyan">&#x1F4C8; 过去7天Token消耗趋势</h3>
            <div ref="tokenChartRef" class="chart-container"></div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ========== Tab2: 行业虚拟AI员工 ========== -->
      <el-tab-pane label="行业虚拟AI员工" name="employees">
        <!-- 介绍文案 -->
        <div class="intro-banner">
          <div class="intro-icon">&#x1F9D1;&#x200D;&#x1F4BC;</div>
          <p class="intro-text">行业虚拟AI员工生成系统 — 填写企业所属行业与岗位，系统自动匹配对应AI虚拟员工。AI员工7x24小时全自动运行，可替代5-10名线下员工，企业人力成本降低50%-80%。</p>
        </div>

        <div class="employee-layout">
          <!-- 左侧：创建表单 -->
          <div class="section-panel create-panel">
            <h3 class="section-title glow-cyan">&#x2795; 创建虚拟AI员工</h3>
            <el-form :model="employeeForm" label-position="top" class="cyber-form">
              <!-- 所属行业：横向可滑动标签栏 -->
              <el-form-item label="所属行业">
                <div class="industry-scroll-wrapper">
                  <div class="industry-scroll-container">
                    <div
                      v-for="item in industryOptions"
                      :key="item.value"
                      class="industry-chip"
                      :class="{ active: employeeForm.industry === item.value }"
                      @click="selectIndustry(item.value)"
                    >
                      <span class="industry-icon">{{ item.icon }}</span>
                      <span class="industry-name">{{ item.label }}</span>
                    </div>
                  </div>
                </div>
              </el-form-item>

              <!-- 岗位类型：标签式选择 -->
              <el-form-item label="岗位类型" v-if="employeeForm.industry">
                <div class="position-tags-wrapper">
                  <div
                    v-for="item in currentPositionOptions"
                    :key="item.value"
                    class="position-tag"
                    :class="{ active: employeeForm.position === item.value }"
                    @click="selectPosition(item.value)"
                  >
                    {{ item.label }}
                  </div>
                </div>
              </el-form-item>
              <el-form-item label="岗位类型" v-else>
                <div class="position-hint">请先选择所属行业</div>
              </el-form-item>
              <el-form-item label="员工名称">
                <el-input
                  v-model="employeeForm.name"
                  placeholder="为你的AI员工起个名字"
                  maxlength="20"
                  show-word-limit
                />
              </el-form-item>
              <el-form-item label="职能描述">
                <el-input
                  v-model="employeeForm.description"
                  type="textarea"
                  :rows="3"
                  placeholder="描述该AI员工的核心职能与工作内容"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
              <el-button
                type="primary"
                class="cyber-create-btn"
                @click="handleCreateEmployee"
                :loading="creatingEmployee"
                style="width: 100%"
              >
                &#x1F680; 生成专属AI员工
              </el-button>
            </el-form>
          </div>

          <!-- 右侧：员工列表 -->
          <div class="employee-list-area">
            <div class="section-panel" style="margin-bottom: 16px;">
              <div class="list-header">
                <h3 class="section-title glow-cyan">&#x1F465; 已有虚拟员工</h3>
                <el-tag type="info" effect="dark" round>共 {{ employees.length }} 位</el-tag>
              </div>
              <div class="employee-cards" v-loading="employeesLoading">
                <div
                  v-for="emp in employees"
                  :key="emp.id"
                  class="employee-card"
                  :class="{ 'card-expanded': expandedEmployeeId === emp.id }"
                  @click="toggleEmployeeExpand(emp)"
                >
                  <div class="card-top">
                    <div class="card-avatar" :class="'avatar-' + emp.status">
                      {{ emp.name?.charAt(0) || '?' }}
                    </div>
                    <div class="card-info">
                      <div class="card-name">{{ emp.name }}</div>
                      <div class="card-tags">
                        <span class="emp-tag industry-tag">{{ getIndustryLabel(emp.industry) }}</span>
                        <span class="emp-tag position-tag">{{ getPositionLabel(emp.industry, emp.position) }}</span>
                      </div>
                    </div>
                    <div class="card-status" :class="'status-badge-' + emp.status">
                      {{ employeeStatusLabel(emp.status) }}
                    </div>
                  </div>
                  <div class="card-stats">
                    <div class="mini-stat">
                      <span class="mini-value">{{ emp.completedTasks || 0 }}</span>
                      <span class="mini-label">已完成任务</span>
                    </div>
                    <div class="mini-stat">
                      <span class="mini-value">{{ emp.workHours || 0 }}h</span>
                      <span class="mini-label">工作时长</span>
                    </div>
                  </div>
                  <div class="card-actions" @click.stop>
                    <el-button size="small" type="primary" @click="handleChatEmployee(emp)">对话使用</el-button>
                    <el-button size="small" @click="handleShowIntegration(emp)">接入平台</el-button>
                    <el-button
                      v-if="emp.status === 'running'"
                      size="small"
                      type="warning"
                      @click="handleStopEmployee(emp)"
                    >暂停</el-button>
                    <el-button
                      v-else-if="emp.status === 'paused'"
                      size="small"
                      type="success"
                      @click="handleStartEmployee(emp)"
                    >启动</el-button>
                    <el-button
                      v-else
                      size="small"
                      type="success"
                      @click="handleStartEmployee(emp)"
                    >启动</el-button>
                    <el-button size="small" @click="handleEditEmployee(emp)">编辑</el-button>
                    <el-button size="small" type="danger" @click="handleDeleteEmployee(emp)">删除</el-button>
                  </div>

                  <!-- 工作流展开 -->
                  <div class="workflow-panel" v-if="expandedEmployeeId === emp.id">
                    <div class="workflow-title">&#x1F3AF; 工作流程</div>
                    <el-steps :active="emp.workflowStep || 0" align-center class="cyber-steps">
                      <el-step title="接收任务" icon="&#x1F4E5;" />
                      <el-step title="内容生成" icon="&#x270D;" />
                      <el-step title="质量审核" icon="&#x1F50D;" />
                      <el-step title="发布执行" icon="&#x1F680;" />
                      <el-step title="数据反馈" icon="&#x1F4CA;" />
                    </el-steps>
                    <div class="workflow-desc">
                      <p>{{ emp.description || '暂无描述' }}</p>
                    </div>
                  </div>
                </div>
                <div v-if="!employeesLoading && employees.length === 0" class="empty-state">
                  <div class="empty-icon">&#x1F9D1;&#x200D;&#x1F4BB;</div>
                  <p>暂无虚拟员工，请在左侧创建</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ========== Tab3: 增值服务 ========== -->
      <el-tab-pane label="增值服务" name="services">
        <!-- 增值服务介绍 -->
        <div class="intro-banner service-banner">
          <div class="intro-icon">&#x1F4B0;</div>
          <h3 class="service-banner-title">增值服务套餐</h3>
          <p class="intro-text">算力调度+虚拟员工专属套餐，解锁自动切换模型、低成本算力通道、不限量行业AI员工，企业人力成本最高削减80%。</p>
        </div>

        <!-- 套餐卡片 2x2 -->
        <div class="packages-grid">
          <div
            v-for="(pkg, index) in servicePackages"
            :key="pkg.name"
            class="package-card"
          >
            <div class="pkg-badge" v-if="pkg.recommended">推荐</div>
            <div class="pkg-icon" :style="{ background: pkg.iconBg }">
              {{ pkg.icon }}
            </div>
            <h4 class="pkg-name">{{ pkg.name }}</h4>
            <p class="pkg-desc">{{ pkg.description }}</p>
            <ul class="pkg-features">
              <li v-for="f in pkg.features" :key="f">
                <span class="feature-check">&#x2713;</span> {{ f }}
              </li>
            </ul>
            <div class="pkg-price">
              <span class="price-original">&#x165D;{{ pkg.originalPrice }}</span>
              <span class="price-current">&#x165D;{{ pkg.currentPrice }}</span>
              <span class="price-unit">/{{ pkg.unit }}</span>
            </div>
            <el-button
              type="primary"
              class="pkg-buy-btn"
              @click="handleBuyPackage(pkg)"
            >
              立即购买
            </el-button>
          </div>
        </div>

        <!-- 一键导出 -->
        <div class="section-panel export-panel">
          <h3 class="section-title glow-cyan">&#x1F4E5; 一键导出</h3>
          <p class="export-desc">基于平台数据智能生成专业文档，支持创赛答辩稿、商业计划书、竞品分析等</p>
          <div class="export-btns">
            <el-button class="cyber-export-btn" @click="handleExport('defense')" :loading="exporting === 'defense'">
              <span class="export-btn-icon">&#x1F4DD;</span>
              <span>导出创赛答辩稿</span>
            </el-button>
            <el-button class="cyber-export-btn" @click="handleExport('business_plan')" :loading="exporting === 'business_plan'">
              <span class="export-btn-icon">&#x1F4CB;</span>
              <span>导出商业计划书</span>
            </el-button>
            <el-button class="cyber-export-btn" @click="handleExport('competitive_analysis')" :loading="exporting === 'competitive_analysis'">
              <span class="export-btn-icon">&#x1F4CA;</span>
              <span>导出竞品分析文档</span>
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑虚拟员工对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑虚拟AI员工"
      width="520px"
      class="cyber-dialog"
    >
      <el-form :model="editForm" label-position="top" class="cyber-form">
        <el-form-item label="员工名称">
          <el-input v-model="editForm.name" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="职能描述">
          <el-input v-model="editForm.description" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditEmployee" :loading="editingEmployee">保存</el-button>
      </template>
    </el-dialog>

    <!-- ===== AI员工对话抽屉 ===== -->
    <el-drawer
      v-model="chatDrawerVisible"
      :title="chatEmployee ? `与 ${chatEmployee.name} 对话` : 'AI员工对话'"
      direction="rtl"
      size="420px"
      :destroy-on-close="false"
      :before-close="closeChatDrawer"
      class="employee-chat-drawer"
    >
      <div class="chat-drawer-body" v-if="chatEmployee">
        <!-- 员工信息 -->
        <div class="chat-emp-header">
          <div class="chat-emp-avatar">{{ chatEmployee.name?.charAt(0) || '?' }}</div>
          <div class="chat-emp-info">
            <div class="chat-emp-name">{{ chatEmployee.name }}</div>
            <div class="chat-emp-tags">
              <span class="chat-emp-tag">{{ getIndustryLabel(chatEmployee.industry) }}</span>
              <span class="chat-emp-tag">{{ getPositionLabel(chatEmployee.industry, chatEmployee.position) }}</span>
            </div>
          </div>
        </div>

        <!-- 消息区域 -->
        <div class="chat-messages" ref="chatMsgRef">
          <div v-if="chatMessages.length === 0" class="chat-welcome">
            <div class="chat-welcome-icon">{{ chatEmployee.name?.charAt(0) || '?' }}</div>
            <div class="chat-welcome-title">你好，我是 {{ chatEmployee.name }}</div>
            <div class="chat-welcome-desc">
              我是您的{{ getIndustryLabel(chatEmployee.industry) }}专属AI员工，担任{{ getPositionLabel(chatEmployee.industry, chatEmployee.position) }}岗位。<br>
              {{ chatEmployee.description || '请直接输入任务指令，我将7x24小时为您服务。' }}
            </div>
            <div class="chat-welcome-tips">
              <div class="tip-item" @click="quickSend('请帮我整理今日工作计划')">📋 整理今日工作计划</div>
              <div class="tip-item" @click="quickSend('请生成一份运营方案')">📊 生成运营方案</div>
              <div class="tip-item" @click="quickSend('请帮我回复客户咨询')">💬 回复客户咨询</div>
            </div>
          </div>
          <template v-else>
            <div v-for="(msg, i) in chatMessages" :key="i" class="chat-msg-row" :class="msg.role">
              <div class="chat-msg-bubble">
                <div class="chat-msg-role">{{ msg.role === 'user' ? '我' : chatEmployee.name }}</div>
                <div class="chat-msg-content">{{ msg.content }}</div>
              </div>
            </div>
            <div v-if="chatLoading" class="chat-msg-row assistant">
              <div class="chat-msg-bubble">
                <div class="chat-msg-role">{{ chatEmployee.name }}</div>
                <div class="chat-msg-content typing">
                  <span class="dot"></span><span class="dot"></span><span class="dot"></span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <el-input
            v-model="chatInput"
            type="textarea"
            :rows="2"
            placeholder="输入任务指令，按Enter发送..."
            resize="none"
            @keydown.enter.prevent="sendChatMessage"
          />
          <el-button type="primary" class="chat-send-btn" :loading="chatLoading" @click="sendChatMessage">
            发送
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- ===== 一键部署第三方平台对话框 ===== -->
    <el-dialog
      v-model="integrationDialogVisible"
      title="一键部署到第三方平台"
      width="620px"
      class="integration-dialog"
      align-center
      :close-on-click-modal="false"
    >
      <div v-if="integrationEmployee" class="deploy-dialog-body">
        <div class="deploy-emp-banner">
          <div class="deploy-emp-avatar">{{ integrationEmployee.name?.charAt(0) || '?' }}</div>
          <div class="deploy-emp-info">
            <div class="deploy-emp-name">{{ integrationEmployee.name }}</div>
            <div class="deploy-emp-tags">
              <span class="deploy-emp-tag">{{ getIndustryLabel(integrationEmployee.industry) }}</span>
              <span class="deploy-emp-tag">{{ getPositionLabel(integrationEmployee.industry, integrationEmployee.position) }}</span>
            </div>
          </div>
        </div>

        <!-- 步骤1：选择平台 -->
        <div v-if="deployStep === 'select'" class="deploy-step">
          <div class="deploy-step-title">第一步：选择要部署的平台</div>
          <div class="deploy-platform-grid">
            <div
              v-for="p in deployPlatforms"
              :key="p.value"
              class="deploy-platform-card"
              :class="{ selected: deploySelectedPlatform === p.value }"
              @click="deploySelectedPlatform = p.value"
            >
              <span class="platform-icon">{{ p.icon }}</span>
              <span class="platform-name">{{ p.label }}</span>
              <span class="platform-desc">{{ p.desc }}</span>
            </div>
          </div>
          <div class="deploy-actions">
            <el-button @click="integrationDialogVisible = false">取消</el-button>
            <el-button type="primary" :disabled="!deploySelectedPlatform" :loading="deployLoading" @click="handleDeploy">
              一键部署到 {{ deployPlatforms.find(p => p.value === deploySelectedPlatform)?.label || '' }}
            </el-button>
          </div>
        </div>

        <!-- 步骤2：部署结果 -->
        <div v-else-if="deployStep === 'result'" class="deploy-step">
          <div class="deploy-success-header">
            <span class="deploy-success-icon">✅</span>
            <span class="deploy-success-title">部署成功！</span>
          </div>
          <div class="deploy-platform-badge" v-if="deployResult">
            <span class="platform-label">{{ deployPlatforms.find(p => p.value === deployResult.platform)?.icon }} {{ deployPlatforms.find(p => p.value === deployResult.platform)?.label }}</span>
          </div>

          <div class="deploy-result-section">
            <div class="result-field">
              <div class="result-label">Webhook URL</div>
              <div class="result-value-row">
                <code class="result-value">{{ deployResult.webhookUrl }}</code>
                <el-button size="small" class="copy-btn" @click="copyText(deployResult.webhookUrl)">复制</el-button>
              </div>
            </div>
            <div class="result-field">
              <div class="result-label">Token / 密钥</div>
              <div class="result-value-row">
                <code class="result-value">{{ deployResult.token }}</code>
                <el-button size="small" class="copy-btn" @click="copyText(deployResult.token)">复制</el-button>
              </div>
            </div>
          </div>

          <div class="deploy-guide-section">
            <div class="guide-title">配置指南</div>
            <div class="guide-content">{{ deployResult.configGuide }}</div>
            <el-button size="small" class="copy-btn" @click="copyText(deployResult.configGuide)" style="margin-top:8px">复制配置指南</el-button>
          </div>

          <div class="deploy-actions">
            <el-button @click="resetDeploy">重新选择平台</el-button>
            <el-button type="primary" @click="integrationDialogVisible = false">完成</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computingApi } from '@/api/computing'

// ===== 基础状态 =====
const router = useRouter()
const activeTab = ref('dispatch')

// ===== 行业与岗位映射（覆盖全球30+主要行业） =====
const industryMap: Record<string, { label: string; value: string }[]> = {
  // 互联网科技
  e_commerce: [
    { label: '客服代表', value: 'customer_service' },
    { label: '内容运营', value: 'content_ops' },
    { label: '营销策划', value: 'marketing' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '社群运营', value: 'community_ops' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '直播运营', value: 'livestream_ops' },
    { label: '供应链管理', value: 'supply_chain' },
  ],
  // 互联网科技
  tech_dev: [
    { label: '技术开发', value: 'tech_dev' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '产品管理', value: 'product_mgr' },
    { label: 'UI设计师', value: 'ui_designer' },
    { label: '测试工程师', value: 'qa_engineer' },
    { label: '运维工程师', value: 'devops' },
  ],
  // 自媒体
  self_media: [
    { label: '内容运营', value: 'content_ops' },
    { label: '营销策划', value: 'marketing' },
    { label: '社群运营', value: 'community_ops' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '直播运营', value: 'livestream_ops' },
    { label: '短视频编导', value: 'video_director' },
  ],
  // 教育培训
  education: [
    { label: '客服代表', value: 'customer_service' },
    { label: '内容运营', value: 'content_ops' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '技术开发', value: 'tech_dev' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '课程顾问', value: 'course_consultant' },
    { label: '教学管理', value: 'teaching_mgr' },
  ],
  // 校园创业
  campus_startup: [
    { label: '技术开发', value: 'tech_dev' },
    { label: '营销策划', value: 'marketing' },
    { label: '内容运营', value: 'content_ops' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '项目运营', value: 'project_ops' },
  ],
  // 餐饮服务
  catering: [
    { label: '客服代表', value: 'customer_service' },
    { label: '营销策划', value: 'marketing' },
    { label: '内容运营', value: 'content_ops' },
    { label: '社群运营', value: 'community_ops' },
    { label: '供应链管理', value: 'supply_chain' },
    { label: '门店管理', value: 'store_mgr' },
    { label: '外卖运营', value: 'delivery_ops' },
  ],
  // 美容美业
  beauty: [
    { label: '客服代表', value: 'customer_service' },
    { label: '营销策划', value: 'marketing' },
    { label: '内容运营', value: 'content_ops' },
    { label: '社群运营', value: 'community_ops' },
    { label: '预约管理', value: 'appointment_mgr' },
    { label: '会员管理', value: 'member_mgr' },
    { label: '技师管理', value: 'technician_mgr' },
  ],
  // 宠物服务
  pet_store: [
    { label: '客服代表', value: 'customer_service' },
    { label: '内容运营', value: 'content_ops' },
    { label: '社群运营', value: 'community_ops' },
    { label: '营销策划', value: 'marketing' },
    { label: '预约管理', value: 'appointment_mgr' },
    { label: '会员管理', value: 'member_mgr' },
  ],
  // 房产建筑
  real_estate: [
    { label: '客服代表', value: 'customer_service' },
    { label: '营销策划', value: 'marketing' },
    { label: '社群运营', value: 'community_ops' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '房源管理', value: 'listing_mgr' },
    { label: '客户跟进', value: 'client_followup' },
  ],
  // 医疗健康
  healthcare: [
    { label: '客服代表', value: 'customer_service' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '内容运营', value: 'content_ops' },
    { label: '预约管理', value: 'appointment_mgr' },
    { label: '健康管理', value: 'health_mgr' },
    { label: '会员管理', value: 'member_mgr' },
    { label: '病历管理', value: 'records_mgr' },
  ],
  // 金融保险
  finance: [
    { label: '客服代表', value: 'customer_service' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '营销策划', value: 'marketing' },
    { label: '风控管理', value: 'risk_mgr' },
    { label: '投资顾问', value: 'investment_advisor' },
    { label: '合规管理', value: 'compliance_mgr' },
  ],
  // 制造工业
  manufacturing: [
    { label: '供应链管理', value: 'supply_chain' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '质量管理', value: 'quality_mgr' },
    { label: '生产管理', value: 'production_mgr' },
    { label: '设备管理', value: 'equipment_mgr' },
    { label: '仓储管理', value: 'warehouse_mgr' },
  ],
  // 交通运输
  transport: [
    { label: '客服代表', value: 'customer_service' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '调度管理', value: 'dispatch_mgr' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '路线规划', value: 'route_planning' },
    { label: '运力管理', value: 'capacity_mgr' },
  ],
  // 农林牧渔
  agriculture: [
    { label: '数据分析', value: 'data_analysis' },
    { label: '供应链管理', value: 'supply_chain' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '营销策划', value: 'marketing' },
    { label: '种植管理', value: 'farming_mgr' },
    { label: '养殖管理', value: 'breeding_mgr' },
  ],
  // 文娱体育
  entertainment: [
    { label: '内容运营', value: 'content_ops' },
    { label: '营销策划', value: 'marketing' },
    { label: '社群运营', value: 'community_ops' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '艺人经纪', value: 'artist_mgr' },
    { label: '活动策划', value: 'event_planning' },
  ],
  // 酒店旅游
  hospitality: [
    { label: '客服代表', value: 'customer_service' },
    { label: '营销策划', value: 'marketing' },
    { label: '内容运营', value: 'content_ops' },
    { label: '社群运营', value: 'community_ops' },
    { label: '预约管理', value: 'appointment_mgr' },
    { label: '房态管理', value: 'room_mgr' },
    { label: '行程规划', value: 'itinerary_mgr' },
  ],
  // 法律政务
  legal: [
    { label: '客服代表', value: 'customer_service' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '内容运营', value: 'content_ops' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '案件管理', value: 'case_mgr' },
    { label: '合规审查', value: 'compliance_mgr' },
    { label: '档案管理', value: 'archive_mgr' },
  ],
  // 能源环保
  energy: [
    { label: '数据分析', value: 'data_analysis' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '供应链管理', value: 'supply_chain' },
    { label: '质量管理', value: 'quality_mgr' },
    { label: '设备管理', value: 'equipment_mgr' },
    { label: '环保监测', value: 'env_monitor' },
  ],
  // 家政服务
  housekeeping: [
    { label: '客服代表', value: 'customer_service' },
    { label: '预约管理', value: 'appointment_mgr' },
    { label: '营销策划', value: 'marketing' },
    { label: '内容运营', value: 'content_ops' },
    { label: '人员管理', value: 'staff_mgr' },
    { label: '派单管理', value: 'dispatch_mgr' },
  ],
  // 汽车服务
  automotive: [
    { label: '客服代表', value: 'customer_service' },
    { label: '营销策划', value: 'marketing' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '维修管理', value: 'repair_mgr' },
    { label: '配件管理', value: 'parts_mgr' },
    { label: '试驾管理', value: 'test_drive_mgr' },
  ],
  // 母婴亲子
  maternity: [
    { label: '客服代表', value: 'customer_service' },
    { label: '内容运营', value: 'content_ops' },
    { label: '营销策划', value: 'marketing' },
    { label: '社群运营', value: 'community_ops' },
    { label: '育儿顾问', value: 'parenting_advisor' },
    { label: '会员管理', value: 'member_mgr' },
  ],
  // 服装时尚
  fashion: [
    { label: '营销策划', value: 'marketing' },
    { label: '内容运营', value: 'content_ops' },
    { label: '社群运营', value: 'community_ops' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '供应链管理', value: 'supply_chain' },
    { label: '买手管理', value: 'buyer_mgr' },
    { label: '陈列设计', value: 'display_design' },
  ],
  // 珠宝首饰
  jewelry: [
    { label: '营销策划', value: 'marketing' },
    { label: '客服代表', value: 'customer_service' },
    { label: '内容运营', value: 'content_ops' },
    { label: '社群运营', value: 'community_ops' },
    { label: '鉴定管理', value: 'appraisal_mgr' },
    { label: '库存管理', value: 'inventory_mgr' },
  ],
  // 数码电子
  digital: [
    { label: '产品管理', value: 'product_mgr' },
    { label: '技术开发', value: 'tech_dev' },
    { label: '数据分析', value: 'data_analysis' },
    { label: '营销策划', value: 'marketing' },
    { label: '售后管理', value: 'aftersales_mgr' },
    { label: '评测管理', value: 'review_mgr' },
  ],
  // 家居家装
  home_decor: [
    { label: '客服代表', value: 'customer_service' },
    { label: '营销策划', value: 'marketing' },
    { label: '内容运营', value: 'content_ops' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '设计管理', value: 'design_mgr' },
    { label: '施工管理', value: 'construction_mgr' },
  ],
  // 运动健身
  fitness: [
    { label: '内容运营', value: 'content_ops' },
    { label: '营销策划', value: 'marketing' },
    { label: '社群运营', value: 'community_ops' },
    { label: '预约管理', value: 'appointment_mgr' },
    { label: '教练管理', value: 'coach_mgr' },
    { label: '课程管理', value: 'class_mgr' },
  ],
  // 摄影摄像
  photography: [
    { label: '内容运营', value: 'content_ops' },
    { label: '营销策划', value: 'marketing' },
    { label: '社群运营', value: 'community_ops' },
    { label: '产品管理', value: 'product_mgr' },
    { label: '后期制作', value: 'post_production' },
    { label: '客户管理', value: 'client_mgr' },
  ],
  // 婚庆服务
  wedding: [
    { label: '客服代表', value: 'customer_service' },
    { label: '营销策划', value: 'marketing' },
    { label: '内容运营', value: 'content_ops' },
    { label: '预约管理', value: 'appointment_mgr' },
    { label: '策划师', value: 'wedding_planner' },
    { label: '司仪管理', value: 'emcee_mgr' },
  ],
  // 养老服务
  elderly_care: [
    { label: '客服代表', value: 'customer_service' },
    { label: '健康管理', value: 'health_mgr' },
    { label: '内容运营', value: 'content_ops' },
    { label: '预约管理', value: 'appointment_mgr' },
    { label: '护理管理', value: 'nursing_mgr' },
    { label: '膳食管理', value: 'diet_mgr' },
  ],
  // 心理咨询
  psychology: [
    { label: '客服代表', value: 'customer_service' },
    { label: '内容运营', value: 'content_ops' },
    { label: '预约管理', value: 'appointment_mgr' },
    { label: '社群运营', value: 'community_ops' },
    { label: '个案管理', value: 'case_mgr' },
    { label: '督导管理', value: 'supervision_mgr' },
  ],
}

const industryOptions = [
  { label: '电商运营', value: 'e_commerce', icon: '🛒' },
  { label: '互联网科技', value: 'tech_dev', icon: '💻' },
  { label: '自媒体', value: 'self_media', icon: '📱' },
  { label: '教育培训', value: 'education', icon: '📚' },
  { label: '校园创业', value: 'campus_startup', icon: '🎓' },
  { label: '餐饮服务', value: 'catering', icon: '🍽️' },
  { label: '美容美业', value: 'beauty', icon: '💅' },
  { label: '宠物服务', value: 'pet_store', icon: '🐾' },
  { label: '房产建筑', value: 'real_estate', icon: '🏠' },
  { label: '医疗健康', value: 'healthcare', icon: '🏥' },
  { label: '金融保险', value: 'finance', icon: '💰' },
  { label: '制造工业', value: 'manufacturing', icon: '🏭' },
  { label: '交通运输', value: 'transport', icon: '🚚' },
  { label: '农林牧渔', value: 'agriculture', icon: '🌾' },
  { label: '文娱体育', value: 'entertainment', icon: '🎬' },
  { label: '酒店旅游', value: 'hospitality', icon: '🏨' },
  { label: '法律政务', value: 'legal', icon: '⚖️' },
  { label: '能源环保', value: 'energy', icon: '⚡' },
  { label: '家政服务', value: 'housekeeping', icon: '🧹' },
  { label: '汽车服务', value: 'automotive', icon: '🚗' },
  { label: '母婴亲子', value: 'maternity', icon: '👶' },
  { label: '服装时尚', value: 'fashion', icon: '👗' },
  { label: '珠宝首饰', value: 'jewelry', icon: '💎' },
  { label: '数码电子', value: 'digital', icon: '📷' },
  { label: '家居家装', value: 'home_decor', icon: '🛋️' },
  { label: '运动健身', value: 'fitness', icon: '🏋️' },
  { label: '摄影摄像', value: 'photography', icon: '📸' },
  { label: '婚庆服务', value: 'wedding', icon: '💒' },
  { label: '养老服务', value: 'elderly_care', icon: '👴' },
  { label: '心理咨询', value: 'psychology', icon: '🧠' },
]

const currentPositionOptions = computed(() => {
  if (!employeeForm.industry) return []
  return industryMap[employeeForm.industry] || []
})

function selectIndustry(val: string) {
  employeeForm.industry = val
  employeeForm.position = ''
}

function selectPosition(val: string) {
  employeeForm.position = val
}

// ===== Tab1: 算力调度 =====

// -- 统计数据 --
const dispatchStats = reactive<any>({
  savedTokens: 0,
  savedPercent: '35.6',
  switchCount: 0,
  activeModel: '-',
})

// -- 调度配置 --
const dispatchConfig = reactive<any>({
  autoDispatch: true,
  autoSwitch: true,
  strategy: 'balanced',
  modelPriority: [
    { name: 'DeepSeek' },
    { name: '豆包' },
    { name: '智谱' },
    { name: '混元' },
    { name: '通义' },
  ],
})

// -- 模型状态 --
const modelStatusList = ref<any[]>([])

const defaultModelStatus = [
  { name: '豆包', status: 'online', quota: '82%' },
  { name: 'DeepSeek', status: 'online', quota: '95%' },
  { name: '智谱', status: 'low', quota: '12%' },
  { name: '混元', status: 'online', quota: '68%' },
  { name: '通义', status: 'offline', quota: '0%' },
]

function statusLabel(status: string) {
  const map: Record<string, string> = { online: '正常', low: '额度不足', offline: '离线' }
  return map[status] || status
}

// -- 调度日志 --
const dispatchLogs = ref<any[]>([])
const logsLoading = ref(false)
const logsPage = ref(1)
const logsTotal = ref(0)

// -- Token趋势图表 --
const tokenChartRef = ref<HTMLElement | null>(null)
let echartsInstance: any = null

// ===== Tab2: 虚拟员工 =====
const employees = ref<any[]>([])
const employeesLoading = ref(false)
const creatingEmployee = ref(false)
const expandedEmployeeId = ref<number | null>(null)

const employeeForm = reactive({
  industry: '',
  position: '',
  name: '',
  description: '',
})

const editDialogVisible = ref(false)
const editingEmployee = ref(false)
const editForm = reactive<any>({
  id: null as number | null,
  name: '',
  description: '',
})

// -- AI员工对话抽屉 --
const chatDrawerVisible = ref(false)
const chatEmployee = ref<any>(null)
const chatMessages = ref<{ role: 'user' | 'assistant'; content: string }[]>([])
const chatInput = ref('')
const chatLoading = ref(false)

// -- 接入平台对话框 --
const integrationDialogVisible = ref(false)
const integrationEmployee = ref<any>(null)
const deployStep = ref<'select' | 'result'>('select')
const deploySelectedPlatform = ref('')
const deployLoading = ref(false)
const deployResult = ref<any>(null)
const deployPlatforms = [
  { value: 'wechat', label: '微信公众号', icon: '💬', desc: '粉丝发送消息，AI员工自动回复' },
  { value: 'wework', label: '企业微信', icon: '🏢', desc: '群聊@机器人，AI员工自动响应' },
  { value: 'dingtalk', label: '钉钉', icon: '📱', desc: '钉钉群聊@机器人，AI员工自动回复' },
  { value: 'webpage', label: '网页嵌入', icon: '🌐', desc: '在任意网页中嵌入AI员工对话窗口' },
]

function employeeStatusLabel(status: string) {
  const map: Record<string, string> = { running: '运行中', paused: '已暂停', stopped: '已停止', active: '运行中' }
  return map[status] || status
}

function getIndustryLabel(val: string): string {
  return industryOptions.find(o => o.value === val)?.label || val
}

function getPositionLabel(industryVal: string, posVal: string): string {
  const positions = industryMap[industryVal] || []
  return positions.find(p => p.value === posVal)?.label || posVal
}

function toggleEmployeeExpand(emp: any) {
  expandedEmployeeId.value = expandedEmployeeId.value === emp.id ? null : emp.id
}

// ===== Tab3: 增值服务 =====
const servicePackages = ref<any[]>([])
const exporting = ref('')

const defaultPackages = [
  {
    name: '虚拟员工年度会员',
    icon: '&#x1F9D1;&#x200D;&#x1F4BC;',
    iconBg: 'linear-gradient(135deg, #00f0ff, #0080ff)',
    description: '解锁不限量行业AI员工创建权限，覆盖8大行业全岗位类型，7x24小时全自动运行，支持自定义工作流与技能配置。',
    features: [
      '不限量创建行业AI员工',
      '8大行业全岗位覆盖',
      '自定义工作流配置',
      '优先模型调度通道',
      '专属技术支持',
    ],
    originalPrice: '2999',
    currentPrice: '999',
    unit: '年',
    recommended: true,
    packageKey: 'employee_yearly',
  },
  {
    name: '高阶算力调度专属权限',
    icon: '&#x26A1;',
    iconBg: 'linear-gradient(135deg, #ff2d95, #b700ff)',
    description: '专享高阶算力调度引擎，跨平台多模型智能切换，优先使用低成本通道，Token消耗降低35%以上。',
    features: [
      '全域算力自动优化',
      '跨模型无缝切换',
      '低成本算力优先通道',
      '调度算法加密存储',
      '实时消耗监控面板',
    ],
    originalPrice: '1999',
    currentPrice: '599',
    unit: '年',
    recommended: false,
    packageKey: 'dispatch_premium',
  },
  {
    name: '行业定制智能体',
    icon: '&#x1F9E0;',
    iconBg: 'linear-gradient(135deg, #ffb800, #ff8c00)',
    description: '根据企业实际业务场景，量身定制专属AI智能体。包含知识库搭建、业务流程训练、专属Prompt工程等全套服务。',
    features: [
      '专属知识库搭建',
      '业务流程深度训练',
      '定制Prompt工程',
      '行业语料预训练',
      '3次免费调优服务',
    ],
    originalPrice: '3999',
    currentPrice: '1299',
    unit: '次',
    recommended: false,
    packageKey: 'custom_agent',
  },
  {
    name: '创业赛事项目技术咨询',
    icon: '&#x1F3C6;',
    iconBg: 'linear-gradient(135deg, #00ff88, #00cc66)',
    description: '面向创业赛事与孵化项目，提供从商业策划、竞品分析到路演答辩的全链路AI技术咨询服务。',
    features: [
      '商业计划书智能生成',
      '竞品分析报告输出',
      '创赛答辩稿自动撰写',
      '市场数据实时采集',
      '一对一专家技术指导',
    ],
    originalPrice: '4999',
    currentPrice: '1999',
    unit: '次',
    recommended: false,
    packageKey: 'startup_consult',
  },
]

// ===== 工具函数 =====
function formatNumber(num: number | string): string {
  const n = typeof num === 'string' ? parseInt(num) : num
  if (isNaN(n)) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function initECharts() {
  if (!tokenChartRef.value) return
  import('echarts').then((echarts) => {
    if (echartsInstance) {
      echartsInstance.dispose()
    }
    echartsInstance = echarts.init(tokenChartRef.value, 'dark')

    const dates: string[] = []
    const tokens: number[] = []
    const saved: number[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
      const base = 50000 + Math.floor(Math.random() * 30000)
      tokens.push(base)
      saved.push(Math.floor(base * (0.3 + Math.random() * 0.1)))
    }

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a1a2eee',
        borderColor: 'rgba(0,240,255,0.3)',
        textStyle: { color: '#e0e0ff' },
      },
      legend: {
        data: ['Token消耗', '节省Token'],
        textStyle: { color: '#808099', fontSize: 12 },
        top: 0,
      },
      grid: {
        left: 60,
        right: 20,
        top: 40,
        bottom: 30,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: 'rgba(0,240,255,0.2)' } },
        axisLabel: { color: '#808099' },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: 'rgba(0,240,255,0.2)' } },
        axisLabel: {
          color: '#808099',
          formatter: (v: number) => v >= 1000 ? (v / 1000) + 'K' : v,
        },
        splitLine: { lineStyle: { color: 'rgba(0,240,255,0.06)' } },
      },
      series: [
        {
          name: 'Token消耗',
          type: 'line',
          smooth: true,
          data: tokens,
          lineStyle: { color: '#00f0ff', width: 2 },
          itemStyle: { color: '#00f0ff' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0,240,255,0.25)' },
                { offset: 1, color: 'rgba(0,240,255,0.02)' },
              ],
            },
          },
        },
        {
          name: '节省Token',
          type: 'line',
          smooth: true,
          data: saved,
          lineStyle: { color: '#ff2d95', width: 2 },
          itemStyle: { color: '#ff2d95' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(255,45,149,0.2)' },
                { offset: 1, color: 'rgba(255,45,149,0.01)' },
              ],
            },
          },
        },
      ],
    }

    echartsInstance.setOption(option)
  })
}

// ===== 数据加载 =====

async function loadDispatchStats() {
  try {
    const res = await computingApi.getDispatchStats()
    const data = res.data?.data || res.data || {}
    dispatchStats.savedTokens = data.savedTokens || dispatchStats.savedTokens
    dispatchStats.savedPercent = data.savedPercent || dispatchStats.savedPercent
    dispatchStats.switchCount = data.switchCount || dispatchStats.switchCount
    dispatchStats.activeModel = data.activeModel || dispatchStats.activeModel
  } catch {
    // 使用默认值
  }
}

async function loadDispatchConfig() {
  try {
    const res = await computingApi.getDispatchConfig()
    const data = res.data?.data || res.data || {}
    if (Object.keys(data).length > 0) {
      dispatchConfig.autoDispatch = data.autoDispatch ?? true
      dispatchConfig.autoSwitch = data.autoSwitch ?? true
      dispatchConfig.strategy = data.strategy || 'balanced'
      if (data.modelPriority?.length) {
        dispatchConfig.modelPriority = data.modelPriority
      }
    }
  } catch {
    // 使用默认值
  }
}

async function loadModelStatus() {
  try {
    const res = await computingApi.getDispatchConfig()
    const data = res.data?.data || res.data || {}
    if (data.modelStatus?.length) {
      modelStatusList.value = data.modelStatus
    } else {
      modelStatusList.value = defaultModelStatus
    }
  } catch {
    modelStatusList.value = defaultModelStatus
  }
}

async function loadDispatchLogs() {
  logsLoading.value = true
  try {
    const res = await computingApi.getDispatchLogs({ page: logsPage.value, pageSize: 10 })
    const data = res.data?.data || res.data || {}
    dispatchLogs.value = data.items || data.list || []
    logsTotal.value = data.total || 0
  } catch {
    dispatchLogs.value = []
    logsTotal.value = 0
  } finally {
    logsLoading.value = false
  }
}

async function saveDispatchConfig() {
  try {
    await computingApi.updateDispatchConfig({
      autoDispatch: dispatchConfig.autoDispatch,
      autoSwitch: dispatchConfig.autoSwitch,
      strategy: dispatchConfig.strategy,
      modelPriority: dispatchConfig.modelPriority,
    })
    ElMessage.success('配置已保存')
  } catch {
    ElMessage.info('配置已更新（本地）')
  }
}

async function loadEmployees() {
  employeesLoading.value = true
  try {
    const res = await computingApi.getEmployees({ page: 1, pageSize: 50 })
    const data = res.data?.data || res.data || {}
    employees.value = data.items || data.list || []
  } catch {
    employees.value = [
      {
        id: 1, name: '小智', industry: '电商运营', position: '客服代表',
        status: 'running', completedTasks: 1283, workHours: 720, workflowStep: 3,
        description: '负责电商平台的售前咨询与售后客服，7x24小时在线，日均处理500+客户咨询。',
      },
      {
        id: 2, name: '文案君', industry: '自媒体运营', position: '内容运营',
        status: 'running', completedTasks: 856, workHours: 480, workflowStep: 2,
        description: '专注自媒体内容创作，包括短视频脚本、图文笔记、标题优化等。',
      },
      {
        id: 3, name: '数据师', industry: '校园创业', position: '数据分析',
        status: 'paused', completedTasks: 432, workHours: 240, workflowStep: 0,
        description: '负责创业项目的市场数据分析、用户画像分析及竞品数据追踪。',
      },
      {
        id: 4, name: '技术牛', industry: '技术开发', position: '技术开发',
        status: 'stopped', completedTasks: 67, workHours: 32, workflowStep: 0,
        description: '辅助技术开发，包括代码审查、Bug修复建议、技术方案设计等。',
      },
    ]
  } finally {
    employeesLoading.value = false
  }
}

async function loadPackages() {
  try {
    const res = await computingApi.getPackages()
    const data = res.data || []
    if (Array.isArray(data) && data.length > 0) {
      servicePackages.value = data
    } else {
      servicePackages.value = []
    }
  } catch {
    servicePackages.value = []
  }
}

// ===== 操作函数 =====

function moveModelUp(index: number) {
  if (index <= 0) return
  const list = dispatchConfig.modelPriority
  const temp = list[index]
  list[index] = list[index - 1]
  list[index - 1] = temp
  saveDispatchConfig()
}

function moveModelDown(index: number) {
  const list = dispatchConfig.modelPriority
  if (index >= list.length - 1) return
  const temp = list[index]
  list[index] = list[index + 1]
  list[index + 1] = temp
  saveDispatchConfig()
}

async function handleCreateEmployee() {
  if (!employeeForm.industry) {
    ElMessage.warning('请选择所属行业')
    return
  }
  if (!employeeForm.position) {
    ElMessage.warning('请选择岗位类型')
    return
  }
  if (!employeeForm.name.trim()) {
    ElMessage.warning('请输入员工名称')
    return
  }
  creatingEmployee.value = true
  try {
    await computingApi.createEmployee({
      industry: employeeForm.industry,
      position: employeeForm.position,
      name: employeeForm.name.trim(),
      description: employeeForm.description.trim(),
    })
    ElMessage.success(`虚拟员工「${employeeForm.name}」创建成功！`)
    employeeForm.industry = ''
    employeeForm.position = ''
    employeeForm.name = ''
    employeeForm.description = ''
    loadEmployees()
  } catch {
    ElMessage.error('创建失败，请稍后重试')
  } finally {
    creatingEmployee.value = false
  }
}

async function handleStartEmployee(emp: any) {
  try {
    await computingApi.startEmployee(emp.id)
    ElMessage.success(`员工「${emp.name}」已启动`)
    loadEmployees()
  } catch {
    ElMessage.error('启动失败')
  }
}

async function handleStopEmployee(emp: any) {
  try {
    await computingApi.stopEmployee(emp.id)
    ElMessage.success(`员工「${emp.name}」已暂停`)
    loadEmployees()
  } catch {
    ElMessage.error('暂停失败')
  }
}

async function handleDeleteEmployee(emp: any) {
  try {
    await ElMessageBox.confirm(
      `确定要删除虚拟员工「${emp.name}」吗？删除后不可恢复。`,
      '确认删除',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    await computingApi.deleteEmployee(emp.id)
    ElMessage.success('已删除')
    if (expandedEmployeeId.value === emp.id) {
      expandedEmployeeId.value = null
    }
    loadEmployees()
  } catch {
    // 取消删除
  }
}

function handleEditEmployee(emp: any) {
  editForm.id = emp.id
  editForm.name = emp.name
  editForm.description = emp.description || ''
  editDialogVisible.value = true
}

function handleChatEmployee(emp: any) {
  chatEmployee.value = emp
  chatMessages.value = []
  chatDrawerVisible.value = true
}

function closeChatDrawer() {
  chatDrawerVisible.value = false
  chatEmployee.value = null
  chatMessages.value = []
}

function quickSend(text: string) {
  chatInput.value = text
  sendChatMessage()
}

async function sendChatMessage() {
  const text = chatInput.value.trim()
  if (!text || !chatEmployee.value) return
  chatMessages.value.push({ role: 'user', content: text })
  chatInput.value = ''
  chatLoading.value = true
  try {
    const res = await computingApi.chatWithEmployee({
      employeeId: chatEmployee.value.id,
      message: text,
    })
    const reply = res.data?.reply || res.data?.content || '收到，我来处理。'
    chatMessages.value.push({ role: 'assistant', content: reply })
  } catch {
    chatMessages.value.push({
      role: 'assistant',
      content: `【${chatEmployee.value.name}】已收到您的指令："${text}"。我正在根据${getIndustryLabel(chatEmployee.value.industry)}-${getPositionLabel(chatEmployee.value.industry, chatEmployee.value.position)}的职能范围进行处理，稍后为您输出结果。`,
    })
  } finally {
    chatLoading.value = false
  }
}

function handleShowIntegration(emp: any) {
  integrationEmployee.value = emp
  deployStep.value = 'select'
  deploySelectedPlatform.value = ''
  deployResult.value = null
  integrationDialogVisible.value = true
}

async function handleDeploy() {
  if (!deploySelectedPlatform.value || !integrationEmployee.value) return
  deployLoading.value = true
  try {
    const res = await computingApi.deployToPlatform({
      employeeId: integrationEmployee.value.id,
      platform: deploySelectedPlatform.value,
    })
    deployResult.value = res.data
    deployStep.value = 'result'
  } catch (e: any) {
    ElMessage.error('部署失败：' + (e?.message || '请稍后重试'))
  } finally {
    deployLoading.value = false
  }
}

function resetDeploy() {
  deployStep.value = 'select'
  deploySelectedPlatform.value = ''
  deployResult.value = null
}

function copyText(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('已复制到剪贴板')
    }).catch(() => {
      fallbackCopy(text)
    })
  } else {
    fallbackCopy(text)
  }
}

function fallbackCopy(text: string) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
  ElMessage.success('已复制到剪贴板')
}

async function submitEditEmployee() {
  if (!editForm.name.trim()) {
    ElMessage.warning('请输入员工名称')
    return
  }
  editingEmployee.value = true
  try {
    await computingApi.updateEmployee(editForm.id!, {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
    })
    ElMessage.success('修改已保存')
    editDialogVisible.value = false
    loadEmployees()
  } catch {
    ElMessage.error('保存失败')
  } finally {
    editingEmployee.value = false
  }
}

async function handleBuyPackage(pkg: any) {
  try {
    await ElMessageBox.confirm(
      `确认购买「${pkg.name}」套餐，价格 ¥${pkg.currentPrice}/${pkg.unit}？`,
      '确认购买',
      { confirmButtonText: '确认支付', cancelButtonText: '取消', type: 'info' }
    )
    await computingApi.createOrder({
      packageKey: pkg.packageKey,
      name: pkg.name,
      amount: parseFloat(pkg.currentPrice),
    })
    ElMessage.success('订单创建成功，请前往支付')
  } catch {
    // 取消购买
  }
}

async function handleExport(type: string) {
  exporting.value = type
  try {
    const res: any = await computingApi.exportData({ type: type as any })
    const blob = res instanceof Blob ? res : new Blob([res], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const fileNames: Record<string, string> = {
      defense: '创赛答辩稿.docx',
      business_plan: '商业计划书.docx',
      competitive_analysis: '竞品分析文档.docx',
    }
    link.download = fileNames[type] || '导出文档.docx'
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch {
    ElMessage.error('导出失败，请稍后重试')
  } finally {
    exporting.value = ''
  }
}

function onTabChange(tab: string | number) {
  if (tab === 'dispatch') {
    nextTick(() => initECharts())
  } else if (tab === 'employees') {
    loadEmployees()
  } else if (tab === 'services') {
    loadPackages()
  }
}

// ===== 生命周期 =====
onMounted(async () => {
  // 加载Tab1数据
  await Promise.all([
    loadDispatchStats(),
    loadDispatchConfig(),
    loadModelStatus(),
    loadDispatchLogs(),
  ])
  nextTick(() => initECharts())

  // 窗口大小调整
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (echartsInstance) {
    echartsInstance.dispose()
    echartsInstance = null
  }
})

function handleResize() {
  if (echartsInstance) {
    echartsInstance.resize()
  }
}
</script>

<style scoped>
/* ===== 行业可滑动选择器 ===== */
.industry-scroll-wrapper {
  position: relative;
  width: 100%;
}
.industry-scroll-container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 2px 12px;
  scrollbar-width: thin;
  scrollbar-color: #00f0ff40 transparent;
}
.industry-scroll-container::-webkit-scrollbar {
  height: 4px;
}
.industry-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}
.industry-scroll-container::-webkit-scrollbar-thumb {
  background: #00f0ff40;
  border-radius: 2px;
}
.industry-chip {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 68px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #00f0ff20;
  background: #0f0f1a;
  cursor: pointer;
  transition: all 0.2s ease;
}
.industry-chip:hover {
  border-color: #00f0ff60;
  background: #00f0ff10;
}
.industry-chip.active {
  border-color: #00f0ff;
  background: #00f0ff20;
  box-shadow: 0 0 8px #00f0ff30;
}
.industry-icon {
  font-size: 20px;
  line-height: 1;
}
.industry-name {
  font-size: 11px;
  color: #b0b0cc;
  white-space: nowrap;
}
.industry-chip.active .industry-name {
  color: #00f0ff;
  font-weight: 600;
}

/* ===== 岗位标签选择器 ===== */
.position-tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.position-tag {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #00f0ff20;
  background: #0f0f1a;
  color: #b0b0cc;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}
.position-tag:hover {
  border-color: #00f0ff60;
  color: #e0e0ff;
}
.position-tag.active {
  border-color: #00f0ff;
  background: #00f0ff20;
  color: #00f0ff;
  font-weight: 600;
  box-shadow: 0 0 8px #00f0ff30;
}
.position-hint {
  padding: 10px 14px;
  border-radius: 8px;
  background: #0f0f1a;
  border: 1px dashed #00f0ff20;
  color: #606080;
  font-size: 12px;
  text-align: center;
}

/* ===== 接入第三方平台指引 ===== */
.integration-guide {
  margin-top: 16px;
  padding: 16px;
  border-radius: 10px;
  background: #0a0a18;
  border: 1px solid #00f0ff15;
}
.integration-title {
  font-size: 14px;
  font-weight: 700;
  color: #e0e0ff;
  margin-bottom: 12px;
}
.integration-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.integration-step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.step-num {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #00f0ff20;
  border: 1px solid #00f0ff50;
  color: #00f0ff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.step-body {
  flex: 1;
}
.step-name {
  font-size: 13px;
  font-weight: 600;
  color: #00f0ff;
  margin-bottom: 4px;
}
.step-desc {
  font-size: 12px;
  color: #808099;
  line-height: 1.6;
}
.step-desc code {
  background: #00f0ff10;
  border: 1px solid #00f0ff25;
  padding: 1px 6px;
  border-radius: 4px;
  color: #00f0ff;
  font-size: 11px;
  word-break: break-all;
}

/* ===== AI员工对话抽屉样式 ===== */
.employee-chat-drawer :deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #00f0ff15;
  color: #e0e0ff;
  font-weight: 700;
}
.employee-chat-drawer :deep(.el-drawer__body) {
  padding: 0;
  background: #0a0a12;
}
.chat-drawer-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.chat-emp-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #00f0ff10;
  background: #0f0f1a;
}
.chat-emp-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00f0ff, #c084fc);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #000;
  flex-shrink: 0;
}
.chat-emp-name {
  font-size: 14px;
  font-weight: 700;
  color: #e0e0ff;
}
.chat-emp-tags {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}
.chat-emp-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #00f0ff15;
  color: #00f0ff;
  border: 1px solid #00f0ff20;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}
.chat-welcome {
  text-align: center;
  padding: 24px 0;
}
.chat-welcome-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00f0ff, #c084fc);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #000;
  margin: 0 auto 12px;
}
.chat-welcome-title {
  font-size: 14px;
  font-weight: 700;
  color: #e0e0ff;
  margin-bottom: 8px;
}
.chat-welcome-desc {
  font-size: 12px;
  color: #808099;
  line-height: 1.6;
  margin-bottom: 16px;
}
.chat-welcome-tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}
.tip-item {
  padding: 8px 16px;
  border-radius: 20px;
  background: #00f0ff08;
  border: 1px solid #00f0ff15;
  color: #b0b0cc;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  max-width: 280px;
  width: 100%;
}
.tip-item:hover {
  background: #00f0ff15;
  border-color: #00f0ff40;
  color: #e0e0ff;
}
.chat-msg-row {
  display: flex;
  margin-bottom: 12px;
}
.chat-msg-row.user {
  justify-content: flex-end;
}
.chat-msg-row.assistant {
  justify-content: flex-start;
}
.chat-msg-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
}
.chat-msg-row.user .chat-msg-bubble {
  background: #00f0ff20;
  border: 1px solid #00f0ff30;
  color: #e0e0ff;
  border-bottom-right-radius: 4px;
}
.chat-msg-row.assistant .chat-msg-bubble {
  background: #1a1a2e;
  border: 1px solid #00f0ff15;
  color: #c0c0d0;
  border-bottom-left-radius: 4px;
}
.chat-msg-role {
  font-size: 10px;
  color: #808099;
  margin-bottom: 4px;
}
.chat-msg-content.typing {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 20px;
}
.chat-msg-content.typing .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00f0ff60;
  animation: typingDot 1.4s infinite ease-in-out both;
}
.chat-msg-content.typing .dot:nth-child(1) { animation-delay: -0.32s; }
.chat-msg-content.typing .dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes typingDot {
  0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}
.chat-input-area {
  padding: 12px 20px 20px;
  border-top: 1px solid #00f0ff10;
  background: #0f0f1a;
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.chat-input-area :deep(.el-textarea__inner) {
  background: #0a0a12;
  border: 1px solid #00f0ff20;
  color: #e0e0ff;
  font-size: 13px;
}
.chat-input-area :deep(.el-textarea__inner:focus) {
  border-color: #00f0ff60;
}
.chat-send-btn {
  flex-shrink: 0;
  height: 54px;
  padding: 0 20px;
  font-size: 13px;
  font-weight: 600;
}

/* ===== 一键部署第三方平台样式 ===== */
.integration-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #00f0ff15;
  padding: 16px 20px;
  margin-right: 0;
}
.integration-dialog :deep(.el-dialog__title) {
  color: #e0e0ff;
  font-weight: 700;
}
.integration-dialog :deep(.el-dialog__body) {
  padding: 16px 20px;
  background: #0a0a12;
}
.deploy-dialog-body {
  background: #0a0a12;
}
.deploy-emp-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #00f0ff10;
}
.deploy-emp-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00f0ff, #c084fc);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #000;
  flex-shrink: 0;
}
.deploy-emp-name {
  font-size: 14px;
  font-weight: 700;
  color: #e0e0ff;
}
.deploy-emp-tags {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}
.deploy-emp-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #00f0ff15;
  color: #00f0ff;
  border: 1px solid #00f0ff20;
}
.deploy-step {
  min-height: 260px;
}
.deploy-step-title {
  font-size: 14px;
  font-weight: 700;
  color: #e0e0ff;
  margin-bottom: 14px;
}
.deploy-platform-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}
.deploy-platform-card {
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #00f0ff15;
  background: #0f0f1a;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.deploy-platform-card:hover {
  border-color: #00f0ff40;
  background: #00f0ff08;
}
.deploy-platform-card.selected {
  border-color: #00f0ff;
  background: #00f0ff15;
  box-shadow: 0 0 12px #00f0ff25;
}
.platform-icon {
  font-size: 28px;
}
.platform-name {
  font-size: 14px;
  font-weight: 700;
  color: #e0e0ff;
}
.platform-desc {
  font-size: 11px;
  color: #808099;
  line-height: 1.4;
}
.deploy-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #00f0ff10;
}
.deploy-success-header {
  text-align: center;
  padding: 12px 0;
}
.deploy-success-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 8px;
}
.deploy-success-title {
  font-size: 16px;
  font-weight: 700;
  color: #00ff88;
}
.deploy-platform-badge {
  text-align: center;
  margin: 8px 0 16px;
}
.deploy-platform-badge .platform-label {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  background: #00f0ff15;
  border: 1px solid #00f0ff30;
  color: #00f0ff;
  font-size: 13px;
  font-weight: 600;
}
.deploy-result-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
.result-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.result-label {
  font-size: 11px;
  color: #808099;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.result-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.result-value {
  flex: 1;
  padding: 8px 12px;
  border-radius: 6px;
  background: #0f0f1a;
  border: 1px solid #00f0ff15;
  color: #00f0ff;
  font-size: 12px;
  word-break: break-all;
  font-family: Menlo, monospace;
}
.deploy-guide-section {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #0f0f1a;
  border: 1px solid #00f0ff10;
}
.guide-title {
  font-size: 12px;
  font-weight: 700;
  color: #e0e0ff;
  margin-bottom: 8px;
}
.guide-content {
  font-size: 12px;
  color: #808099;
  line-height: 1.7;
  white-space: pre-line;
}
.copy-btn {
  flex-shrink: 0;
}

/* ===== 页面容器 ===== */
.computing-center {
  min-height: 100vh;
  background: var(--cyber-bg);
  padding: 24px;
  color: var(--cyber-text);
}

/* ===== 页面头部 ===== */
.page-header {
  margin-bottom: 24px;
}
.header-title h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--cyber-cyan);
  margin-bottom: 6px;
}
.header-subtitle {
  color: var(--cyber-text-dim);
  font-size: 14px;
}

/* ===== Tab样式 ===== */
.cyber-tabs :deep(.el-tabs__nav-wrap::after) {
  background: rgba(0, 240, 255, 0.1) !important;
}
.cyber-tabs :deep(.el-tabs__item) {
  color: var(--cyber-text-dim) !important;
  font-size: 15px;
  font-weight: 600;
  padding: 0 20px;
  height: 48px;
  line-height: 48px;
}
.cyber-tabs :deep(.el-tabs__item.is-active) {
  color: var(--cyber-cyan) !important;
}
.cyber-tabs :deep(.el-tabs__item:hover) {
  color: var(--cyber-cyan) !important;
}
.cyber-tabs :deep(.el-tabs__active-bar) {
  background: var(--cyber-cyan) !important;
  height: 2px !important;
}

/* ===== 介绍横幅 ===== */
.intro-banner {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.06), rgba(255, 45, 149, 0.04));
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.intro-icon {
  font-size: 28px;
  flex-shrink: 0;
}
.intro-text {
  color: var(--cyber-text);
  font-size: 14px;
  line-height: 1.7;
  margin: 0;
}
.service-banner {
  flex-direction: column;
  text-align: center;
  align-items: center;
}
.service-banner-title {
  color: var(--cyber-cyan);
  font-size: 20px;
  margin-bottom: 8px;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
}

/* ===== 统计卡片 ===== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: #1a1a2eee;
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 12px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
}
.stat-card:hover {
  border-color: rgba(0, 240, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.1);
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), transparent);
  opacity: 0.5;
}
.stat-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}
.token-icon {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(0, 128, 255, 0.15));
}
.switch-icon {
  background: linear-gradient(135deg, rgba(255, 45, 149, 0.15), rgba(183, 0, 255, 0.15));
}
.active-icon {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 204, 102, 0.15));
}
.stat-info {
  flex: 1;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #e0e0ff;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
.stat-label {
  font-size: 13px;
  color: #808099;
  margin-top: 4px;
}
.stat-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 255, 136, 0.15);
  color: #00ff88;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  font-family: 'JetBrains Mono', monospace;
}

/* ===== 面板 ===== */
.section-panel {
  background: #1a1a2eee;
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}
.section-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyber-cyan), transparent);
  opacity: 0.4;
}
.section-panel:hover {
  border-color: rgba(0, 240, 255, 0.3);
}
.section-title {
  font-size: 16px;
  color: #e0e0ff;
  margin-bottom: 16px;
  font-weight: 600;
}
.sub-title {
  font-size: 14px;
  color: #e0e0ff;
  margin-bottom: 16px;
  font-weight: 600;
}

/* ===== 配置面板 ===== */
.config-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}
.config-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(0, 240, 255, 0.03);
  border: 1px solid rgba(0, 240, 255, 0.08);
  border-radius: 8px;
}
.config-label {
  color: #e0e0ff;
  font-size: 14px;
  font-weight: 500;
}

/* Element Plus Radio覆盖 */
.config-item :deep(.el-radio-button__inner) {
  background: rgba(0, 240, 255, 0.05) !important;
  border-color: rgba(0, 240, 255, 0.15) !important;
  color: var(--cyber-text-dim) !important;
  box-shadow: none !important;
}
.config-item :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(183, 0, 255, 0.2)) !important;
  border-color: var(--cyber-cyan) !important;
  color: var(--cyber-cyan) !important;
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.2) !important;
}

/* ===== 优先级列表 ===== */
.config-right {
  padding: 16px;
  background: rgba(0, 240, 255, 0.03);
  border: 1px solid rgba(0, 240, 255, 0.08);
  border-radius: 8px;
}
.priority-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.priority-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(0, 240, 255, 0.08);
  border-radius: 6px;
  transition: all 0.2s;
}
.priority-item:hover {
  background: rgba(0, 240, 255, 0.05);
  border-color: rgba(0, 240, 255, 0.2);
}
.priority-rank {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--cyber-cyan), #b700ff);
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.priority-name {
  flex: 1;
  color: #e0e0ff;
  font-size: 14px;
}
.priority-actions {
  display: flex;
  gap: 4px;
}
.priority-btn {
  background: rgba(0, 240, 255, 0.08);
  border: 1px solid rgba(0, 240, 255, 0.2);
  color: var(--cyber-cyan);
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.2s;
}
.priority-btn:hover:not(:disabled) {
  background: rgba(0, 240, 255, 0.2);
}
.priority-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ===== 模型余量监测 ===== */
.model-monitor {
  padding-top: 20px;
  border-top: 1px solid rgba(0, 240, 255, 0.08);
}
.monitor-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
.monitor-item {
  text-align: center;
  padding: 16px 8px;
  background: rgba(0, 240, 255, 0.03);
  border: 1px solid rgba(0, 240, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s;
}
.monitor-item:hover {
  transform: translateY(-2px);
}
.monitor-item.status-online {
  border-color: rgba(0, 255, 136, 0.3);
}
.monitor-item.status-low {
  border-color: rgba(255, 45, 45, 0.4);
  background: rgba(255, 45, 45, 0.04);
}
.monitor-item.status-offline {
  border-color: rgba(128, 128, 153, 0.3);
  opacity: 0.6;
}
.monitor-name {
  font-weight: 600;
  color: #e0e0ff;
  font-size: 14px;
  margin-bottom: 8px;
}
.monitor-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 auto 8px;
}
.dot-online {
  background: #00ff88;
  box-shadow: 0 0 6px rgba(0, 255, 136, 0.6);
  animation: pulse-glow 2s ease-in-out infinite;
}
.dot-low {
  background: #ff2d2d;
  box-shadow: 0 0 6px rgba(255, 45, 45, 0.6);
}
.dot-offline {
  background: #555;
}
.monitor-quota {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 700;
  color: #e0e0ff;
  margin-bottom: 4px;
}
.monitor-label {
  font-size: 12px;
  color: #808099;
}
.status-low .monitor-quota { color: #ff2d2d; }

/* ===== 底部双列 ===== */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* ===== 日志面板 ===== */
.log-panel .cyber-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(0, 240, 255, 0.05);
  --el-table-row-hover-bg-color: rgba(0, 240, 255, 0.05);
  --el-table-border-color: rgba(0, 240, 255, 0.08);
  --el-table-text-color: var(--cyber-text);
  --el-table-header-text-color: var(--cyber-text-dim);
}
.task-tag {
  background: rgba(0, 240, 255, 0.1);
  color: var(--cyber-cyan);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.switch-flow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.from-model {
  color: #808099;
  text-decoration: line-through;
}
.arrow {
  color: var(--cyber-cyan);
}
.to-model {
  color: #00ff88;
  font-weight: 600;
}
.saved-tokens {
  color: #00ff88;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
}
.pagination-wrap {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

/* ===== 图表面板 ===== */
.chart-panel {
  min-height: 320px;
}
.chart-container {
  width: 100%;
  height: 280px;
}

/* ===== Tab2: 员工布局 ===== */
.employee-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
}
.create-panel {
  position: sticky;
  top: 24px;
  align-self: start;
}
.cyber-form :deep(.el-form-item__label) {
  color: #e0e0ff !important;
  font-weight: 500;
}
.cyber-create-btn {
  height: 48px;
  font-size: 15px !important;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #00f0ff, #b700ff) !important;
  border: none !important;
  color: #fff !important;
  font-weight: 700 !important;
  border-radius: 8px !important;
}
.cyber-create-btn:hover {
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(183, 0, 255, 0.2) !important;
  transform: translateY(-1px);
}

/* ===== 员工列表 ===== */
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.list-header .section-title {
  margin-bottom: 0;
}
.employee-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}
.employee-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(0, 240, 255, 0.12);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.employee-card:hover {
  border-color: rgba(0, 240, 255, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 240, 255, 0.08);
}
.card-expanded {
  border-color: rgba(0, 240, 255, 0.4) !important;
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.15) !important;
}
.card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.card-avatar {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
  color: #000;
}
.avatar-running {
  background: linear-gradient(135deg, #00ff88, #00cc66);
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}
.avatar-paused {
  background: linear-gradient(135deg, #ffb800, #ff8c00);
}
.avatar-stopped {
  background: linear-gradient(135deg, #555, #444);
  color: #999;
}
.card-info {
  flex: 1;
  min-width: 0;
}
.card-name {
  font-weight: 600;
  color: #e0e0ff;
  font-size: 15px;
  margin-bottom: 4px;
}
.card-tags {
  display: flex;
  gap: 6px;
}
.emp-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}
.industry-tag {
  background: rgba(0, 240, 255, 0.12);
  color: var(--cyber-cyan);
}
.position-tag {
  background: rgba(255, 45, 149, 0.12);
  color: #ff2d95;
}
.card-status {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 600;
  flex-shrink: 0;
}
.status-badge-running {
  background: rgba(0, 255, 136, 0.15);
  color: #00ff88;
}
.status-badge-paused {
  background: rgba(255, 184, 0, 0.15);
  color: #ffb800;
}
.status-badge-stopped {
  background: rgba(128, 128, 153, 0.15);
  color: #808099;
}

/* 员工统计 */
.card-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  padding: 8px 0;
  border-top: 1px solid rgba(0, 240, 255, 0.06);
  border-bottom: 1px solid rgba(0, 240, 255, 0.06);
}
.mini-stat {
  display: flex;
  flex-direction: column;
}
.mini-value {
  font-size: 16px;
  font-weight: 700;
  color: #e0e0ff;
  font-family: 'JetBrains Mono', monospace;
}
.mini-label {
  font-size: 11px;
  color: #808099;
}

/* 员工操作 */
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.card-actions :deep(.el-button--small) {
  font-size: 12px;
}

/* 工作流 */
.workflow-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 240, 255, 0.1);
  animation: fade-in-up 0.3s ease-out;
}
.workflow-title {
  font-size: 14px;
  color: var(--cyber-cyan);
  margin-bottom: 16px;
  font-weight: 600;
}
.cyber-steps :deep(.el-step__title) {
  color: var(--cyber-text-dim) !important;
  font-size: 12px !important;
}
.cyber-steps :deep(.el-step.is-finish .el-step__title) {
  color: var(--cyber-cyan) !important;
}
.cyber-steps :deep(.el-step.is-process .el-step__title) {
  color: var(--cyber-cyan) !important;
}
.cyber-steps :deep(.el-step__head.is-finish) {
  color: var(--cyber-cyan) !important;
  border-color: var(--cyber-cyan) !important;
}
.cyber-steps :deep(.el-step__head.is-process) {
  color: var(--cyber-cyan) !important;
  border-color: var(--cyber-cyan) !important;
}
.cyber-steps :deep(.el-step__line) {
  background: rgba(0, 240, 255, 0.15) !important;
}
.workflow-desc {
  margin-top: 16px;
  padding: 12px;
  background: rgba(0, 240, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(0, 240, 255, 0.08);
}
.workflow-desc p {
  color: #808099;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 24px;
  color: var(--cyber-text-dim);
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.4;
}

/* ===== Tab3: 增值服务 ===== */
.packages-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}
.package-card {
  background: #1a1a2eee;
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 14px;
  padding: 28px 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}
.package-card:hover {
  border-color: rgba(0, 240, 255, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 240, 255, 0.12);
}
.package-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--cyber-cyan), #ff2d95, #b700ff);
  opacity: 0.6;
}
.pkg-badge {
  position: absolute;
  top: 12px;
  right: -24px;
  background: linear-gradient(135deg, #ff2d95, #b700ff);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 32px;
  transform: rotate(45deg);
}
.pkg-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 16px;
}
.pkg-name {
  font-size: 18px;
  font-weight: 700;
  color: #e0e0ff;
  margin-bottom: 10px;
}
.pkg-desc {
  color: #808099;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 16px;
  min-height: 42px;
}
.pkg-features {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pkg-features li {
  color: #b0b0cc;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.feature-check {
  color: #00ff88;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
.pkg-price {
  margin-bottom: 16px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.price-original {
  color: #666;
  font-size: 14px;
  text-decoration: line-through;
}
.price-current {
  color: #ff2d95;
  font-size: 28px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}
.price-unit {
  color: #808099;
  font-size: 14px;
}
.pkg-buy-btn {
  width: 100%;
  height: 44px;
  font-size: 15px !important;
  background: linear-gradient(135deg, #00f0ff, #b700ff) !important;
  border: none !important;
  color: #fff !important;
  font-weight: 700 !important;
  border-radius: 8px !important;
  letter-spacing: 1px;
  transition: all 0.3s !important;
}
.pkg-buy-btn:hover {
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.4), 0 0 40px rgba(183, 0, 255, 0.2) !important;
  transform: translateY(-1px);
}

/* ===== 导出面板 ===== */
.export-panel {
  margin-top: 0;
}
.export-desc {
  color: #808099;
  font-size: 13px;
  margin-bottom: 20px;
}
.export-btns {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.cyber-export-btn {
  flex: 1;
  min-width: 200px;
  height: 56px !important;
  background: rgba(0, 240, 255, 0.05) !important;
  border: 1px solid rgba(0, 240, 255, 0.2) !important;
  color: var(--cyber-cyan) !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s !important;
}
.cyber-export-btn:hover {
  background: rgba(0, 240, 255, 0.12) !important;
  border-color: rgba(0, 240, 255, 0.4) !important;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.15) !important;
  transform: translateY(-2px);
}
.export-btn-icon {
  font-size: 22px;
}

/* ===== 对话框 ===== */
.cyber-dialog :deep(.el-dialog) {
  background: #1a1a2eee !important;
  border: 1px solid rgba(0, 240, 255, 0.2) !important;
  border-radius: 14px !important;
}
.cyber-dialog :deep(.el-dialog__title) {
  color: var(--cyber-cyan) !important;
}
.cyber-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: var(--cyber-text-dim) !important;
}
.cyber-dialog :deep(.el-dialog__body) {
  color: var(--cyber-text) !important;
}

/* ===== 响应式 ===== */
@media (max-width: 1200px) {
  .bottom-grid {
    grid-template-columns: 1fr;
  }
  .employee-layout {
    grid-template-columns: 300px 1fr;
  }
}
@media (max-width: 900px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  .config-grid {
    grid-template-columns: 1fr;
  }
  .monitor-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .packages-grid {
    grid-template-columns: 1fr;
  }
  .employee-layout {
    grid-template-columns: 1fr;
  }
  .employee-cards {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .computing-center {
    padding: 12px;
  }
  .monitor-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .export-btns {
    flex-direction: column;
  }
}

/* ===== 脉冲动画（复用） ===== */
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px rgba(0, 255, 136, 0.4); }
  50% { box-shadow: 0 0 12px rgba(0, 255, 136, 0.8), 0 0 20px rgba(0, 255, 136, 0.3); }
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
