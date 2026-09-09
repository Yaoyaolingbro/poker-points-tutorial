<script setup lang="ts">
import PlayingCard from '@/components/cards/PlayingCard.vue'
import type { Card } from '@/components/cards/cardAssets'

interface PlayerResult {
  label: string
  cards: Card[]
  bestFive: string
  result: string
  tone?: 'winner' | 'tie'
}

interface ComparisonCase {
  id: string
  cue: string
  title: string
  setup: string
  board: Card[]
  players: PlayerResult[]
  answer: string
}

const examples: ComparisonCase[] = [
  {
    id: 'three-pairs',
    cue: '看着像三对',
    title: '七张里有三对，也只能交两对',
    setup: '你手里的 A 对，加上牌面的 K 对和 8 对，一共出现了三组对子。牌型表里没有“三对”。',
    board: [
      { rank: 'K', suit: 's' }, { rank: 'K', suit: 'h' }, { rank: '8', suit: 'c' },
      { rank: '8', suit: 'd' }, { rank: '2', suit: 's' }
    ],
    players: [
      {
        label: '你的底牌',
        cards: [{ rank: 'A', suit: 'c' }, { rank: 'A', suit: 'd' }],
        bestFive: 'A♣ A♦ K♠ K♥ 8♣',
        result: 'A、K 两对，8 踢脚',
        tone: 'winner'
      }
    ],
    answer: '留下最大的两对 A 和 K，再从剩余三张里挑最大的 8 当踢脚。另一张 8 和 2 都不算。'
  },
  {
    id: 'four-flush',
    cue: '牌面四张红桃',
    title: '都有同花，比的是手中那张高花',
    setup: '牌面只有四张红桃，所以手里带红桃的人才能凑出五张同花。两边共用 A、9、6、2 四张红桃。',
    board: [
      { rank: 'A', suit: 'h' }, { rank: '9', suit: 'h' }, { rank: '6', suit: 'h' },
      { rank: '2', suit: 'h' }, { rank: 'K', suit: 'c' }
    ],
    players: [
      {
        label: '你',
        cards: [{ rank: 'Q', suit: 'h' }, { rank: '7', suit: 'c' }],
        bestFive: 'A♥ Q♥ 9♥ 6♥ 2♥',
        result: 'Q 高花，赢',
        tone: 'winner'
      },
      {
        label: '对手',
        cards: [{ rank: 'J', suit: 'h' }, { rank: 'J', suit: 'c' }],
        bestFive: 'A♥ J♥ 9♥ 6♥ 2♥',
        result: 'J 高花，输'
      }
    ],
    answer: '第一张都是牌面的 A♥，下一张就分出高低：你的 Q♥ 大于对手的 J♥。那张梅花 K 不在任何一边的最佳五张里。'
  },
  {
    id: 'kicker',
    cue: '都是一对 A',
    title: '同样一对 A，踢脚决定输赢',
    setup: '牌型名称一样，并不等于平分。对子点数相同以后，按最大的踢脚、第二大踢脚继续比。',
    board: [
      { rank: 'A', suit: 'c' }, { rank: '9', suit: 'd' }, { rank: '7', suit: 's' },
      { rank: '4', suit: 'h' }, { rank: '2', suit: 'c' }
    ],
    players: [
      {
        label: '你',
        cards: [{ rank: 'A', suit: 's' }, { rank: 'K', suit: 'd' }],
        bestFive: 'A♠ A♣ K♦ 9♦ 7♠',
        result: 'K 踢脚，赢',
        tone: 'winner'
      },
      {
        label: '对手',
        cards: [{ rank: 'A', suit: 'h' }, { rank: 'Q', suit: 's' }],
        bestFive: 'A♥ A♣ Q♠ 9♦ 7♠',
        result: 'Q 踢脚，输'
      }
    ],
    answer: '两边先打平一对 A。接着比第一张踢脚：K 对 Q，到这里就结束，不用再看后面的 9 和 7。'
  },
  {
    id: 'board-plays',
    cue: '公共牌已经够大',
    title: '底牌没进前五张，就当它不存在',
    setup: '公共牌本身已经组成 A 高顺子。你的一对 9 和对手的一对 4 都塞不进更好的五张组合。',
    board: [
      { rank: 'A', suit: 's' }, { rank: 'K', suit: 'h' }, { rank: 'Q', suit: 'd' },
      { rank: 'J', suit: 'c' }, { rank: '10', suit: 's' }
    ],
    players: [
      {
        label: '你',
        cards: [{ rank: '9', suit: 'c' }, { rank: '9', suit: 'd' }],
        bestFive: 'A♠ K♥ Q♦ J♣ 10♠',
        result: '公共牌顺子，平分',
        tone: 'tie'
      },
      {
        label: '对手',
        cards: [{ rank: '4', suit: 'c' }, { rank: '4', suit: 'd' }],
        bestFive: 'A♠ K♥ Q♦ J♣ 10♠',
        result: '公共牌顺子，平分',
        tone: 'tie'
      }
    ],
    answer: '两个人最后交出的五张牌完全相同，直接平分。手里对子更大，也不能拿来当第六张破局。'
  }
]
</script>

<template>
  <div class="pp-comparison-gallery" aria-label="四个常见的五张牌比较例子">
    <article
      v-for="example in examples"
      :key="example.id"
      class="pp-comparison-case"
      :data-comparison-case="example.id"
    >
      <header>
        <span>{{ example.cue }}</span>
        <h3>{{ example.title }}</h3>
        <p>{{ example.setup }}</p>
      </header>

      <div class="pp-example-felt">
        <div class="pp-example-board">
          <small>公共牌</small>
          <div class="pp-example-card-row">
            <PlayingCard
              v-for="card in example.board"
              :key="`${example.id}-board-${card.rank}${card.suit}`"
              :card="card"
              size="board"
            />
          </div>
        </div>

        <div class="pp-example-players" :class="{ 'is-solo': example.players.length === 1 }">
          <section v-for="player in example.players" :key="player.label" class="pp-example-player">
            <div class="pp-example-player-topline">
              <strong>{{ player.label }}</strong>
              <span :class="`is-${player.tone ?? 'plain'}`">{{ player.result }}</span>
            </div>
            <div class="pp-example-hole-cards">
              <PlayingCard
                v-for="card in player.cards"
                :key="`${example.id}-${player.label}-${card.rank}${card.suit}`"
                :card="card"
                size="board"
              />
            </div>
            <p><small>最后五张</small><b>{{ player.bestFive }}</b></p>
          </section>
        </div>
      </div>

      <p class="pp-example-answer"><strong>答案</strong>{{ example.answer }}</p>
    </article>
  </div>
</template>
