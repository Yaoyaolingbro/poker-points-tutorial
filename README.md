# 德州扑克积分桌入门

一套从具体牌局出发的中文德州扑克教程。默认六人桌，小盲 10 积分，大盲 20 积分，100BB = 2000 积分。

课程正文、SVG 牌面和动画都随仓库发布。当前核心路径包括牌桌规则、完整牌局、牌型、位置与动作、outs、底池赔率、下注目的、深筹与 SPR、速查、术语及英文资源。

## 本地运行

要求 Node.js 22.12 或更新版本。

```bash
npm install
npm run dev
```

## 检查与构建

```bash
npm run check
npm run build
npm run test:e2e
```

正式课程只使用积分与 BB。写作前先阅读 `docs/editorial/voice.md`。

## 扑克牌素材

牌面来自 [SVGCards](https://github.com/saulspatz/SVGCards) 的 Vertical2 牌组。来源仓库将其声明为公共领域；本项目保留了本地来源说明。

## 发布

`main` 分支通过 GitHub Actions 部署到 GitHub Pages。构建时由 `DOCS_BASE` 自动适配仓库子路径。
