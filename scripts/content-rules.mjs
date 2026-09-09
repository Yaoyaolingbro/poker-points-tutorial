const MONEY_PATTERNS = [
  /[¥￥$€£]/u,
  /现金桌|真钱|人民币|美元|欧元|赚钱|亏钱|提现|赎回/u,
  /\d+(?:\.\d+)?\s*元(?:\s|[，。！？、；：]|$)/u
]

const TEMPLATE_PATTERNS = [
  /值得注意的是/u,
  /需要注意的是/u,
  /综上所述/u,
  /总而言之/u,
  /让我们深入探讨/u,
  /在当今/u
]

export function findContentViolations(text, file) {
  if (!file.startsWith('site/')) return []

  const violations = []
  for (const pattern of MONEY_PATTERNS) {
    if (pattern.test(text)) violations.push({ file, kind: 'money', pattern: pattern.source })
  }
  for (const pattern of TEMPLATE_PATTERNS) {
    if (pattern.test(text)) violations.push({ file, kind: 'template', pattern: pattern.source })
  }
  return violations
}
