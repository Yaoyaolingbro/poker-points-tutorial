<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { cardAssetPath, cardLabel, type Card } from './cardAssets'

const props = withDefaults(defineProps<{
  card: Card
  faceDown?: boolean
  size?: 'seat' | 'board' | 'teaching'
}>(), {
  faceDown: false,
  size: 'board'
})

const src = computed(() => withBase(props.faceDown ? '/cards/svgcards/blueBack.svg' : cardAssetPath(props.card)))
const alt = computed(() => props.faceDown ? '一张背面朝上的牌' : cardLabel(props.card))
</script>

<template>
  <span class="pp-playing-card" :class="`pp-playing-card--${size}`">
    <img :src="src" :alt="alt">
  </span>
</template>
