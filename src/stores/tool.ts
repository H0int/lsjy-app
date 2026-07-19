import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toolApi } from '@/api'
import type { Tool, ToolCategory } from '@/types'

export const useToolStore = defineStore('tool', () => {
  const tools = ref<Tool[]>([])
  const categories = ref<ToolCategory[]>([])
  const currentTool = ref<Tool | null>(null)
  const loading = ref(false)
  const total = ref(0)

  async function fetchCategories() {
    try {
      const res = await toolApi.getCategories()
      categories.value = res.data
    } catch (e) {
      console.error('获取分类失败', e)
    }
  }

  async function fetchTools(params?: { categoryId?: number; subCategory?: string; toolType?: string; page?: number; pageSize?: number }) {
    loading.value = true
    try {
      const res = await toolApi.getTools({ page: 1, pageSize: 500, ...params })
      tools.value = res.data.items || []
      total.value = res.data.total || tools.value.length
    } catch {
      // 后端不可用时使用内置工具数据
      tools.value = getBuiltInTools()
      total.value = tools.value.length
      categories.value = getBuiltInCategories()
    } finally {
      loading.value = false
    }
  }

  async function fetchToolDetail(id: number | string) {
    loading.value = true
    try {
      const res = await toolApi.getToolDetail(id)
      currentTool.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function callTool(id: number | string, input: { text?: string; params?: Record<string, any>; files?: string[] }) {
    const res = await toolApi.callTool(id, input)
    return res.data
  }

  return {
    tools, categories, currentTool, loading, total,
    fetchCategories, fetchTools, fetchToolDetail, callTool
  }
})

// ===== 内置工具数据（后端不可用时使用） =====
function getBuiltInTools(): Tool[] {
  return [
    { id: 1, name: 'AI网页爬虫', description: '智能爬取网页内容，提取结构化数据', icon: '🕷️', category: 'AI智能', categoryId: 3, toolType: 'text', coinCost: 50, isHot: true, status: 'active', subCategory: '数据采集' },
    { id: 2, name: 'AI语音识别', description: '语音转文字，支持多种语言', icon: '🎤', category: 'AI智能', categoryId: 3, toolType: 'text', coinCost: 30, isHot: false, status: 'active', subCategory: '语音处理' },
    { id: 3, name: 'AI文案生成', description: '自动生成营销文案、社媒内容', icon: '✍️', category: '内容创作', categoryId: 2, toolType: 'text', coinCost: 20, isHot: true, status: 'active', subCategory: '文案写作' },
    { id: 4, name: 'AI图片生成', description: '输入描述生成高质量图片', icon: '🎨', category: '图片生成', categoryId: 9, toolType: 'image', coinCost: 50, isHot: true, status: 'active', subCategory: '文生图' },
    { id: 5, name: 'AI视频生成', description: '输入文案自动生成短视频', icon: '🎬', category: '视频生成', categoryId: 10, toolType: 'video', coinCost: 100, isHot: true, status: 'active', subCategory: '文生视频' },
    { id: 6, name: 'AI翻译助手', description: '多语言智能翻译，支持100+语种', icon: '🌐', category: 'AI智能', categoryId: 3, toolType: 'text', coinCost: 10, isHot: false, status: 'active', subCategory: '翻译' },
    { id: 7, name: 'AI论文降重', description: '智能改写论文内容，降低重复率', icon: '📄', category: '教育培训', categoryId: 5, toolType: 'text', coinCost: 40, isHot: true, status: 'active', subCategory: '学术工具' },
    { id: 8, name: 'AI电商详情页', description: '自动生成电商商品详情页文案', icon: '🛍️', category: '电商运营', categoryId: 4, toolType: 'text', coinCost: 30, isHot: false, status: 'active', subCategory: '商品描述' },
    { id: 9, name: 'AI宠物医生', description: '智能宠物健康咨询与诊断建议', icon: '🐾', category: '宠物服务', categoryId: 6, toolType: 'text', coinCost: 20, isHot: false, status: 'active', subCategory: '健康咨询' },
    { id: 10, name: 'AI校园助手', description: '校园生活全能助手', icon: '🎓', category: '校园助手', categoryId: 7, toolType: 'text', coinCost: 10, isHot: false, status: 'active', subCategory: '校园服务' },
    { id: 11, name: 'AI Logo设计', description: '输入品牌名称自动生成Logo', icon: '🖼️', category: '图片生成', categoryId: 9, toolType: 'image', coinCost: 60, isHot: false, status: 'active', subCategory: 'Logo设计' },
    { id: 12, name: 'AI PPT制作', description: '输入主题自动生成演示文稿', icon: '📊', category: '内容创作', categoryId: 2, toolType: 'text', coinCost: 80, isHot: true, status: 'active', subCategory: 'PPT生成' },
    { id: 13, name: 'AI代码助手', description: '智能代码生成、调试、优化', icon: '💻', category: 'AI智能', categoryId: 3, toolType: 'text', coinCost: 30, isHot: true, status: 'active', subCategory: '代码开发' },
    { id: 14, name: 'AI图片风格迁移', description: '上传图片转换为多种艺术风格', icon: '🎭', category: '图片生成', categoryId: 9, toolType: 'image', coinCost: 50, isHot: false, status: 'active', subCategory: '风格迁移' },
    { id: 15, name: 'AI短视频脚本', description: '自动生成短视频拍摄脚本', icon: '📱', category: '视频生成', categoryId: 10, toolType: 'text', coinCost: 40, isHot: false, status: 'active', subCategory: '脚本创作' },
    { id: 16, name: 'AI竞品分析', description: '自动分析竞品数据并生成报告', icon: '🔍', category: '电商运营', categoryId: 4, toolType: 'text', coinCost: 60, isHot: false, status: 'active', subCategory: '市场分析' },
  ]
}

function getBuiltInCategories(): ToolCategory[] {
  return [
    { id: 2, name: '内容创作', icon: '✍️', sort: 1 },
    { id: 3, name: 'AI智能', icon: '🧠', sort: 2 },
    { id: 4, name: '电商运营', icon: '🛍️', sort: 3 },
    { id: 5, name: '教育培训', icon: '📚', sort: 4 },
    { id: 6, name: '宠物服务', icon: '🐾', sort: 5 },
    { id: 7, name: '校园助手', icon: '🎓', sort: 6 },
    { id: 9, name: '图片生成', icon: '🎨', sort: 7 },
    { id: 10, name: '视频生成', icon: '🎬', sort: 8 },
  ]
}
