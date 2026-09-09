import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import HomeHero from '@/components/home/HomeHero.vue'
import './styles/tokens.css'
import './styles/base.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeHero', HomeHero)
  }
} satisfies Theme
