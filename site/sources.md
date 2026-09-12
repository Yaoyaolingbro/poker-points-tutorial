---
title: 数字从哪里来
description: 规则参考、概率生成方法、外部交叉检查与扑克牌素材授权。
---

# 数字从哪里来

这页不教打法，只回答一件事：教程里的规则、概率和牌面素材怎样得到。

## 规则与术语

牌型、最佳五张、花色同级、起手牌分类、outs 与底池赔率，主要用 [PokerStars Learn 基础课程](https://www.pokerstars.com/poker/learn/course/the-basics/)、[牌型说明](https://www.pokerstars.com/poker/learn/lesson/poker-hand-rankings/)、[起手牌说明](https://www.pokerstars.com/poker/learn/lesson/poker-starting-hands/) 和 [outs 说明](https://www.pokerstars.com/poker/learn/lesson/calculating-outs/) 复核。

课程编排参考了 [PokerCoaching 15-Day Cash Game Challenge](https://pokercoaching.com/15-day-cash-game-challenge/) 先场景、再提问、最后解释的方式。本站没有复制其范围表或课程内容。

## 169 类与翻牌概率

两张底牌共有 C(52,2) = 1326 个具体组合。按点数与是否同花合并后，得到 13 个对子、78 个同花非对子、78 个不同花非对子，共 169 类。

每一类使用一组固定花色代表牌，从余下 50 张牌中完整枚举 C(50,3) = **19,600** 种翻牌。成牌类别互斥并合计 19,600；同花听牌、两头顺、卡顺等标签允许重叠。

## 翻前权益模拟

本站自己的生成器对每一类底牌、1–7 位随机对手各模拟 **100,000** 次，固定种子为 **20260912**。每次发出互不重复的对手底牌与五张公共牌，使用仓库内的五至七张牌评估器比较。平分时，equity 按赢家人数等分；所以页面会把 win、tie、equity 分开。

固定种子让同一版本可重建同一组模拟结果。100,000 次仍有抽样误差，因此界面用“≈”。这些数字假设随机对手、无人弃牌、一定发到河牌，不是开池或跟注范围。

我们用 [Oscar6Echo / Poker2](https://github.com/oscar6echo/Poker2) 的公开模拟方法与多人数结果作过量级交叉检查，但最终页面只读取本站生成器产出的 JSON；没有复制外部权益表。

## 扑克牌图像

牌面采用 David Bellot 创作的 **SVGCards**，由 [htdebeer/SVG-cards](https://github.com/htdebeer/SVG-cards) 分发。项目说明要求在使用时提供源码与 LGPL 许可证；本站保留本地素材及对应授权文件。SVG 只在页面内展示，动画由本站 Vue 组件完成。

## 在仓库中复算

运行 `npm run generate:probability` 会重新生成 `src/data/probability/` 下的翻牌与权益数据；`npm run check` 会检查 169 类是否还原为 1326 个组合、每类翻牌是否合计 19,600，并验证 AA、KK、QQ、AKs、AKo 等锚点关系。

若教程版本改变评估器、种子或模拟次数，本页和数据元信息会一起更新。
