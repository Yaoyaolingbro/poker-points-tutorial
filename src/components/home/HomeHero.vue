<script setup lang="ts">
import { withBase } from 'vitepress'
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
        <div class="pp-seat pp-seat-top">对手 · 2000</div>
        <div class="pp-seat pp-seat-right">大盲 · 1980</div>
        <div class="pp-seat pp-seat-left">小盲 · 1990</div>
        <div class="pp-table-mark">
          <span class="pp-pot">底池 30</span>
          <span class="pp-button">BTN</span>
          <span class="pp-card pp-card-a">A♠</span>
          <span class="pp-card pp-card-j">J♠</span>
        </div>
        <p class="pp-scene-question">前面都弃牌。轮到你。</p>
      </div>
    </section>
  </main>
</template>
