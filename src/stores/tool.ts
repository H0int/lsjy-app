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
      const res = await toolApi.getTools(params)
      tools.value = res.data.items
      total.value = res.data.total
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
