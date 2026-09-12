import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import RankOrderQuiz from './RankOrderQuiz.vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => path }))

describe('RankOrderQuiz', () => {
  it('keeps the explanation hidden until the reader answers', async () => {
    const wrapper = mount(RankOrderQuiz)

    expect(wrapper.find('[data-quiz-answer]').exists()).toBe(false)
    await wrapper.get('[data-choice="hero"]').trigger('click')

    expect(wrapper.get('[data-quiz-answer]').text()).toContain('10 高顺子')
    expect(wrapper.get('[data-choice="hero"]').attributes('aria-pressed')).toBe('true')
  })

  it('explains the missed flush when the wrong answer is chosen', async () => {
    const wrapper = mount(RankOrderQuiz)
    await wrapper.get('[data-choice="villain"]').trigger('click')
    expect(wrapper.get('[data-quiz-answer]').text()).toContain('只有四张黑桃')
  })
})
