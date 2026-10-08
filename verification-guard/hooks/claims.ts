export type ClaimKind = 'tests' | 'api' | 'verified' | 'done' | 'safe'

export interface Claim {
  kind: ClaimKind
  quote: string
}

// Cyrillic text: \b does not work there, so those patterns avoid it.
const PATTERNS: Record<ClaimKind, RegExp[]> = {
  tests: [
    /\b(all\s+)?(unit\s+|e2e\s+|integration\s+)?tests?\s+(are\s+|were\s+|now\s+)?(passing|passed|pass|green)\b/i,
    /\b(test\s+)?suite\s+(is\s+)?(passing|green)\b/i,
    /тест(ы|ов|и)?\s+(\S+\s+)?(проход|прошл|пройд|зелен|зелён|успешн|успішн|пройшли)/i,
  ],
  api: [
    /\b(returns?|returned|responds?|responded|gets?|got)\s+(an?\s+)?(http\s+)?[245]\d\d\b/i,
    /\bstatus(\s+code)?\s*(is|=|:|was)?\s*[245]\d\d\b/i,
    /\bhttp\s+[245]\d\d\b/i,
    /(возвращает|вернул\S*|отвечает|ответил\S*|повертає|повернув\S*|відповідає|відповів\S*)\s+(http\s+)?[245]\d\d/i,
  ],
  verified: [
    /\b(i\s+)?(have\s+|'ve\s+)?(verified|confirmed|validated|double-checked)\b/i,
    /(проверил\S*|подтвердил\S*|верифицировал\S*|убедил\S*сь|перевірив\S*|підтвердив\S*|пересвідчи\S*сь)/i,
  ],
  done: [
    /\b(i\s+)?(have\s+|'ve\s+)?(fixed|implemented|completed|resolved)\b/i,
    /^\s*done\b/im,
    /(готово|исправил\S*|исправлен\S*|реализовал\S*|сделал\S*|виправив\S*|виправлен\S*|реалізував\S*|зроблено)/i,
  ],
  safe: [
    /\bno\s+regressions?\b/i,
    /\b(backwards?[- ]compatible|production[- ]ready|safe\s+to\s+(merge|deploy|ship))\b/i,
    /(без\s+регресс|регрессий\s+нет|обратно\s+совместим|зворотно\s+сумісн|регресій\s+немає)/i,
  ],
}

// A sentence that says it did NOT verify is not a claim.
const NEGATION =
  /\b(not|n't|never|unable|cannot|can't|couldn't|haven't|didn't|wasn't|unverified|untested|if|once|when|should|would|until)\b|(?:^|\s)(не\s+(проверил|удалось|смог|запуск|выполн|перевір|вдал|підтверд|підтвердж|підтверд)|ещё\s+не|еще\s+не|пока\s+не|поки\s+не|ще\s+не|если|якщо|после\s+того|коли)/i

const stripCode = (s: string) => s.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ')

/** Claims about verification/completion in one assistant answer, one per kind, quoted. */
export function detectClaims(answer: string): Claim[] {
  const out: Claim[] = []
  const sentences = stripCode(answer)
    .split(/(?<=[.!?\n])\s+/)
    .map(s => s.trim())
    .filter(Boolean)

  for (const kind of Object.keys(PATTERNS) as ClaimKind[]) {
    const hit = sentences.find(s => !NEGATION.test(s) && PATTERNS[kind].some(re => re.test(s)))

    if (hit) out.push({ kind, quote: hit.length > 110 ? `${hit.slice(0, 110)}…` : hit })
  }

  return out
}
