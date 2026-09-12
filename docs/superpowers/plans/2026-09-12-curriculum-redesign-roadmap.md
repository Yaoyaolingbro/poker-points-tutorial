# 积分桌教程重构路线图

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement each phase task-by-task. Do not start a later phase until the current phase passes its acceptance gate and all chapter reviews for that phase are written.

**Goal:** 把现有教程重构为一门从牌型比较开始、以 6 人 100BB 积分桌为主线、同时覆盖翻前 169 类起手牌概率与常见牌局数学的 15 章互动课程。

**Architecture:** 保留 VitePress + Vue 的静态站点结构。Markdown 承担正文与章节顺序，Vue 组件承担扑克桌、选牌、概率矩阵和滑杆等互动，离线 TypeScript 脚本生成可复现的概率 JSON。所有面向读者的文字继续经过 `scripts/check-content.mjs`，所有章节同时经过单元测试、内容测试、构建和 Playwright 桌面/移动端检查。

**Tech Stack:** VitePress 1.6.4、Vue 3.5、TypeScript 5.7、Vitest、Vue Test Utils、Playwright、SVGCards 本地牌面素材、GitHub Actions / GitHub Pages。

---

## 固定教学约束

- 全站只使用“积分”，不出现钱、现金桌、充值、提现等表述。
- 默认桌况：6 人，SB 10、BB 20，100BB = 2000 积分；补充说明支持 5–8 人。
- 先讲牌型与最佳五张，再讲一手牌、位置、动作、筹码和数学。
- 核心位置只教 BTN（庄家）、SB、BB、UTG；其余座位统一称“中间位置”。
- “找爹牌”不单列为术语；在下注价值章节中改写成“先数赢什么，再数输什么”。
- 翻前 169 类拆成两章：翻牌结果概率与摊牌胜率，不混为一个数字。
- 摊牌胜率默认面对 1 名随机对手，滑杆支持 1–7 名随机对手。
- 每章遵守 `WRITING_STYLE.md`：真手牌开场、先猜后揭晓、一条规则、算清过程、常见误判、练习、下一章连接。

## 分期与验收门

### Phase 1：比较大小

详细计划：`docs/superpowers/plans/2026-09-12-hand-rankings-best-five.md`

交付：

- 第 1 章 `/basics/hand-rankings`
- 第 2 章 `/basics/best-five`
- 新导航顺序的第一版
- 牌型快问与“从七张里选五张”互动题
- 两份章节审稿记录

验收：`npm run check && npm run build && npm run test:e2e` 全部通过；桌面与移动端都无横向溢出；牌型页不再同时承担“最佳五张”的完整教学。

### Phase 2：看懂一手牌

计划文件在 Phase 1 验收后建立：`docs/superpowers/plans/2026-09-12-hand-flow-positions-actions.md`

交付：

- 第 3 章 `/start/first-hand`
- 第 4 章 `/basics/positions`
- 第 5 章 `/basics/actions`
- 第 6 章 `/basics/stack-depth`
- 5–8 人可切换的位置动画；6 人为默认
- SB 10 / BB 20 / 2000 积分的筹码与有效筹码可视化

验收：位置动画只突出 BTN、SB、BB、UTG；翻前与翻后行动顺序分别演示；补充积分只描述为局间补充且不可取回；旧 `/basics/action-order` 与 `/start/table-rules` 提供兼容跳转或明确迁移。

### Phase 3：翻前 169 类

计划文件在 Phase 2 验收后建立：`docs/superpowers/plans/2026-09-12-preflop-169.md`

交付：

- 第 7 章 `/preflop/starting-hands`
- 第 8 章 `/preflop/flop-outcomes`
- 第 9 章 `/preflop/equity`
- 第 10 章 `/preflop/first-plan`
- 13×13 起手牌矩阵、类别筛选、概率指标切换、对手人数滑杆
- 离线枚举与固定种子 Monte Carlo 数据脚本

验收：组合数恒等式 `78 + 312 + 936 = 1326` 有自动测试；每个翻牌结果指标来自 19,600 个合法翻牌枚举；每个胜率数据点至少 100,000 次有效试验；运行时数据缺失显示“概率数据未加载”，绝不回退成 0%。

### Phase 4：把数字算清

计划文件在 Phase 3 验收后建立：`docs/superpowers/plans/2026-09-12-poker-math-labs.md`

交付：

- 第 11 章 `/math/outs`
- 第 12 章 `/math/pot-odds`
- 第 13 章 `/math/ev`
- 共同的牌面输入、outs 高亮、底池赔率与 EV 实验组件

验收：常见概率表至少覆盖翻牌到转牌、转牌到河牌、翻牌直达河牌；4/2 法则明确标为近似；底池赔率分母与跟注后总底池一致；EV 正负边界有精确单元测试。

### Phase 5：下注、深筹与发布

计划文件在 Phase 4 验收后建立：`docs/superpowers/plans/2026-09-12-strategy-release.md`

交付：

- 第 14 章 `/strategy/bet-purpose`
- 第 15 章 `/strategy/deep-stacks`
- `/quick-reference`、`/glossary`、`/resources`、`/sources` 统一收尾
- 所有章节的审稿记录、来源记录与全站回归

验收：下注章节用“更差的什么会跟、更好的什么会继续”贯穿价值与诈唬；两对撞三条等例子放在具体牌局中；深筹章节以有效筹码和 SPR 为主轴；资源页区分免费频道与系统课程并核验链接；GitHub Pages 部署成功。

## 全站质量门

每一阶段结束都必须依次运行：

```bash
npm run check
npm run build
npm run test:e2e
```

然后完成四项人工抽查：

1. 用 390×844 视口检查导航、扑克牌和表格没有横向溢出。
2. 用桌面视口检查图片与正文互相解释，不出现只装饰、不教学的插图。
3. 按 `WRITING_STYLE.md` 逐项填完对应的 `docs/editorial/reviews/*.md`。
4. 检查新增事实、概率和外链是否记录在 `/sources` 或数据元信息中。

## 提交与发布节奏

- 每个独立组件或章节使用一个可回滚的提交。
- 每一阶段完成后推送 `curriculum-redesign` 分支供审阅。
- 只有五个阶段全部通过质量门后，才合并到 `main` 并触发 Pages 发布。
