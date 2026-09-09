import { resolve } from 'node:path'
import { defineConfig } from 'vitepress'

export function resolveSiteBase(env: NodeJS.ProcessEnv): string {
  const base = env.DOCS_BASE ?? '/'
  return base.startsWith('/') && base.endsWith('/') ? base : '/'
}

export const siteConfig = defineConfig({
  lang: 'zh-CN',
  title: '积分桌入门',
  description: '从第一手牌开始，学会六人德州扑克积分桌。',
  base: resolveSiteBase(process.env),
  cleanUrls: true,
  vite: {
    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src')
      }
    }
  },
  themeConfig: {
    search: { provider: 'local' },
    nav: [{ text: '开始', link: '/start/table-rules' }],
    sidebar: {
      '/start/': [
        {
          text: '先完成一手牌',
          items: [
            { text: '牌桌规则', link: '/start/table-rules' },
            { text: '三分钟一手牌', link: '/start/first-hand' }
          ]
        }
      ]
    },
    outline: { level: [2, 3], label: '本页内容' },
    docFooter: { prev: '上一节', next: '下一节' },
    darkModeSwitchLabel: '切换明暗主题',
    sidebarMenuLabel: '课程目录',
    returnToTopLabel: '回到顶部'
  }
})

export default siteConfig
