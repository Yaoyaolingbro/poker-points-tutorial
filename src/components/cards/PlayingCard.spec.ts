import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import PlayingCard from './PlayingCard.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('PlayingCard', () => {
  it('renders a labelled face card', () => {
    const wrapper = mount(PlayingCard, { props: { card: { rank: 'A', suit: 's' } } })
    expect(wrapper.get('img').attributes('src')).toContain('spadeAce.svg')
    expect(wrapper.get('img').attributes('alt')).toBe('黑桃 A')
  })

  it('hides the card identity when face down', () => {
    const wrapper = mount(PlayingCard, { props: { card: { rank: 'A', suit: 's' }, faceDown: true } })
    expect(wrapper.get('img').attributes('src')).toContain('blueBack.svg')
    expect(wrapper.get('img').attributes('alt')).toBe('一张背面朝上的牌')
  })
})
