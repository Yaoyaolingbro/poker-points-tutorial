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
    nav: [
      { text: '开始', link: '/basics/hand-rankings' },
      { text: '速查', link: '/quick-reference' },
      { text: '资源', link: '/resources' }
    ],
    sidebar: [
      {
        text: '先会比大小',
        items: [
          { text: '牌型从大到小', link: '/basics/hand-rankings' },
          { text: '七张牌，只选五张', link: '/basics/best-five' }
        ]
      },
      {
        text: '看懂一手牌',
        items: [
          { text: '三分钟一手牌', link: '/start/first-hand' },
          { text: '位置与基础动作', link: '/basics/action-order' },
          { text: '积分桌规则', link: '/start/table-rules' }
        ]
      },
      {
        text: '把数字算清',
        items: [
          { text: 'Outs 与胜率', link: '/math/outs' },
          { text: '底池赔率', link: '/math/pot-odds' }
        ]
      },
      {
        text: '开始做判断',
        items: [
          { text: '下注要有对象', link: '/strategy/bet-purpose' },
          { text: '深筹与 SPR', link: '/strategy/deep-stacks' }
        ]
      },
      {
        text: '随手查',
        items: [
          { text: '两分钟速查', link: '/quick-reference' },
          { text: '术语表', link: '/glossary' },
          { text: '英文资源', link: '/resources' }
        ]
      }
    ],
    outline: { level: [2, 3], label: '本页内容' },
    docFooter: { prev: '上一节', next: '下一节' },
    darkModeSwitchLabel: '切换明暗主题',
    sidebarMenuLabel: '课程目录',
    returnToTopLabel: '回到顶部'
  }
})

export default siteConfig
