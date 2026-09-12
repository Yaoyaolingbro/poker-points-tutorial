<script setup lang="ts">
import { computed, ref } from 'vue'

const heroPoints = ref(4000)
const villainPoints = ref(2600)
const effectivePoints = computed(() => Math.min(heroPoints.value, villainPoints.value))
const effectiveBB = computed(() => effectivePoints.value / 20)
</script>

<template>
  <section class="pp-stack-depth" aria-labelledby="stack-title">
    <header class="pp-lab-heading"><div><small>有效筹码尺</small><h2 id="stack-title">真正能投入多少？</h2></div></header>
    <div class="pp-stack-sliders">
      <label>你的桌面积分 <strong>{{ heroPoints }}</strong>
        <input v-model.number="heroPoints" data-hero-points type="range" min="400" max="5000" step="100">
      </label>
      <label>对手桌面积分 <strong>{{ villainPoints }}</strong>
        <input v-model.number="villainPoints" data-villain-points type="range" min="400" max="5000" step="100">
      </label>
    </div>
    <div class="pp-effective-readout">
      <span data-effective-points>有效筹码 {{ effectivePoints }} 积分</span>
      <strong data-effective-bb>{{ effectiveBB }}BB</strong>
    </div>
    <p>双方较小的那一摞决定这手牌的深度。多出来的积分暂时碰不到这个对手。</p>
  </section>
</template>
