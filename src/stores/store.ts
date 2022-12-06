import { defineStore } from 'pinia'

export const useStore = defineStore('wallet', {
  state: () => ({
    items: {
      // 实时记录用户所在app局部路径位置
      // 例如'/my/server/personal/list' -> ['personal', 'list'], 供二级三级导航栏在刷新时保持选择使用
      currentPath: [] as string[]
    },
    tables: {}
  }),
  getters: {},
  actions: {}
})
