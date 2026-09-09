<script setup lang="ts">
import { withBase } from 'vitepress'
import PlayingCard from '@/components/cards/PlayingCard.vue'
</script>

<template>
  <main class="pp-home">
    <header class="pp-home-nav">
      <a class="pp-wordmark" :href="withBase('/')" aria-label="积分桌入门首页">
        <span class="pp-wordmark-mark">♠</span>
        <span>积分桌入门</span>
      </a>
      <span class="pp-home-nav-note">一手一手，学会做决定</span>
    </header>

    <section class="pp-hero">
      <div class="pp-hero-copy">
        <p class="pp-kicker">5–8 人 · 默认六人桌</p>
        <h1>牌已经发下来了。<br><em>你先做决定。</em></h1>
        <p class="pp-lead">小盲 10，大盲 20。这里不先塞给你一整本术语表，每节只解决一个牌桌问题。</p>
        <div class="pp-hero-actions">
          <a class="pp-primary-action" :href="withBase('/start/table-rules')">
            <span>坐下，开始第一手</span>
            <span aria-hidden="true">→</span>
          </a>
          <span class="pp-stack-note">100BB = 2000 积分</span>
        </div>
      </div>

      <div class="pp-scene" aria-label="按钮位拿到黑桃 A 和黑桃 J，底池 30 积分">
        <div class="pp-home-seat pp-home-seat-top">对手 · 2000</div>
        <div class="pp-home-seat pp-home-seat-right">大盲 · 1980</div>
        <div class="pp-home-seat pp-home-seat-left">小盲 · 1990</div>
        <div class="pp-table-mark">
          <span class="pp-pot">底池 30</span>
          <span class="pp-button">BTN</span>
          <div class="pp-hero-cards" aria-label="黑桃 A 和黑桃 J">
            <PlayingCard :card="{ rank: 'A', suit: 's' }" size="teaching" />
            <PlayingCard :card="{ rank: 'J', suit: 's' }" size="teaching" />
          </div>
        </div>
        <p class="pp-scene-question">前面都弃牌。轮到你。</p>
      </div>
    </section>
  </main>
</template>
