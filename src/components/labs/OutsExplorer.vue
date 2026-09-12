<script setup lang="ts">
import { computed, ref } from 'vue'
import PlayingCard from '@/components/cards/PlayingCard.vue'
import type { Card } from '@/components/cards/cardAssets'
import { hitByNextCard, hitByRiver } from '@/lib/probability/outs'

interface DrawScenario {
  id: string
  short: string
  title: string
  outs: number
  hero: Card[]
  board: Card[]
  note: string
  play: string
}

const scenarios: DrawScenario[] = [
  {
    id: 'flush', short: '同花听牌', title: '裸同花听牌：9 outs', outs: 9,
    hero: [{ rank: 'A', suit: 's' }, { rank: 'J', suit: 's' }],
    board: [{ rank: 'K', suit: 's' }, { rank: '7', suit: 's' }, { rank: '2', suit: 'd' }],
    note: '还剩 9 张黑桃。这里是坚果同花听牌；换成小黑桃时，有些 out 会因为更高同花而打折。',
    play: '小下注往往给得起价格；面对大下注，先算单张牌的 19.15%，别擅自借用到河牌的数字。'
  },
  {
    id: 'open', short: '两头顺', title: '两头顺子听牌：8 outs', outs: 8,
    hero: [{ rank: '9', suit: 'c' }, { rank: '8', suit: 'd' }],
    board: [{ rank: '10', suit: 'h' }, { rank: '7', suit: 's' }, { rank: '2', suit: 'c' }],
    note: '四张 6 和四张 J 都能完成顺子，共 8 outs。',
    play: '它比卡顺可靠，但在同花面或成对牌面上，仍要检查击中以后是不是坚果。'
  },
  {
    id: 'gutshot', short: '卡顺', title: '卡顺听牌：4 outs', outs: 4,
    hero: [{ rank: '9', suit: 'c' }, { rank: '8', suit: 'd' }],
    board: [{ rank: 'J', suit: 'h' }, { rank: '7', suit: 's' }, { rank: '2', suit: 'c' }],
    note: '只有四张 10 能把 7—J 连起来。看起来“差一张”，不等于有八张可来。',
    play: '单靠卡顺通常接不起大下注；价格很便宜，或你加注还能让更好牌弃掉，才有继续的理由。'
  },
  {
    id: 'pair-flush', short: '带对抽花', title: '带对抽同花：现在有牌，也有 9 个同花 outs', outs: 9,
    hero: [{ rank: 'A', suit: 's' }, { rank: '7', suit: 's' }],
    board: [{ rank: 'K', suit: 's' }, { rank: '7', suit: 'd' }, { rank: '2', suit: 's' }],
    note: '你已有中对，不是“只有 9 outs 才能赢”。两张 7、三张 A 也可能改善，但是否干净取决于对手范围。',
    play: '面对一次正常下注通常可以继续。跟注还是加注，要一起看价格、对手会不会弃牌，以及被反加时是否难受。'
  },
  {
    id: 'pair-straight', short: '带对抽顺', title: '带对抽顺子：一对加 8 个顺子 outs', outs: 8,
    hero: [{ rank: '8', suit: 'c' }, { rank: '7', suit: 'c' }],
    board: [{ rank: '8', suit: 'd' }, { rank: '6', suit: 's' }, { rank: '5', suit: 'h' }],
    note: '任何 4 或 9 都能成顺，你手里还握着顶对。额外的 8 和 7 可能成三条或两对，却不一定全是干净 outs。',
    play: '这是能承受压力的组合听牌。筹码越深，越要留意更高顺子、成对转牌和大底池里的反向隐含赔率。'
  }
]

const selectedId = ref('flush')
const selected = computed(() => scenarios.find(item => item.id === selectedId.value) ?? scenarios[0])
const nextChance = computed(() => hitByNextCard(selected.value.outs))
const riverChance = computed(() => hitByRiver(selected.value.outs))
const percent = (value: number) => `${(value * 100).toFixed(2)}%`
</script>

<template>
  <section class="pp-outs-explorer" aria-labelledby="outs-title">
    <header class="pp-lab-heading">
      <span>OUTS 练习台</span>
      <h2 id="outs-title">这手牌到底在等什么？</h2>
    </header>

    <div class="pp-draw-tabs" role="group" aria-label="选择听牌场景">
      <button
        v-for="scenario in scenarios"
        :key="scenario.id"
        :data-draw-scenario="scenario.id"
        :aria-pressed="selected.id === scenario.id"
        @click="selectedId = scenario.id"
      >{{ scenario.short }}</button>
    </div>

    <div class="pp-draw-table">
      <div class="pp-draw-cards">
        <div><small>你的底牌</small><span><PlayingCard v-for="card in selected.hero" :key="`${card.rank}${card.suit}`" :card="card" size="board" /></span></div>
        <div><small>翻牌</small><span><PlayingCard v-for="card in selected.board" :key="`${card.rank}${card.suit}`" :card="card" size="board" /></span></div>
      </div>
      <div class="pp-draw-copy">
        <h3 data-draw-title>{{ selected.title }}</h3>
        <p>{{ selected.note }}</p>
      </div>
    </div>

    <div class="pp-draw-numbers">
      <p><span>只看下一张</span><strong data-next-card>{{ percent(nextChance) }}</strong></p>
      <p><span>保证看到两张</span><strong data-by-river>{{ percent(riverChance) }}</strong></p>
    </div>
    <p class="pp-lab-verdict is-allowed">{{ selected.play }}</p>
  </section>
</template>
