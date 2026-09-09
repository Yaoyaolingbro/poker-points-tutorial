import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import HomeHero from '@/components/home/HomeHero.vue'
import FullHandDemo from '@/components/lesson/FullHandDemo.vue'
import './styles/tokens.css'
import './styles/base.css'
import './styles/table.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeHero', HomeHero)
    app.component('FullHandDemo', FullHandDemo)
  }
} satisfies Theme
