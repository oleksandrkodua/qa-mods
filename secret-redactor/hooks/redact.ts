const PATTERNS: [RegExp, string][] = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, '[REDACTED:private-key]'],
  [/\bsk-ant-[A-Za-z0-9_-]{20,}/g, '[REDACTED:anthropic-key]'],
  [/\bsk-[A-Za-z0-9_-]{32,}/g, '[REDACTED:api-key]'],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}/g, '[REDACTED:github-token]'],
  [/\bgithub_pat_[A-Za-z0-9_]{40,}/g, '[REDACTED:github-token]'],
  [/\bxox[abprs]-[A-Za-z0-9-]{10,}/g, '[REDACTED:slack-token]'],
  [/\bAKIA[0-9A-Z]{16}\b/g, '[REDACTED:aws-key-id]'],
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '[REDACTED:jwt]'],
  [/(\b(?:authorization|bearer)\s*[:=]?\s*bearer\s+)[A-Za-z0-9._~+/=-]{16,}/gi, '$1[REDACTED]'],
]

/** `token = getToken(x)`, `secret: process.env.X`, `password = user.password`: code, not a secret value. */
const looksLikeCode = (v: string) =>
  /[(){}<>]|=>|^[$@]|^(?:process|os|env|self|this|config|args|opts?)\./i.test(v) ||
  /^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+$/.test(v) ||
  /^\[REDACTED/.test(v)

const ASSIGN = /(\b[A-Za-z0-9_]*(?:password|passwd|secret|token|api[_-]?key)[A-Za-z0-9_]*["']?\s*[:=]\s*["']?)([^\s"']{6,})/gi

export function redact(s: string): string {
  return PATTERNS.reduce((acc, [re, sub]) => acc.replace(re, sub), s).replace(ASSIGN, (m, k, v) =>
    looksLikeCode(v) ? m : `${k}[REDACTED]`,
  )
}

/** Deep-map every string in a result; leaves non-strings and shape intact. */
export function redactDeep<T>(v: T): T {
  if (typeof v === 'string') return redact(v) as T
  if (Array.isArray(v)) return v.map(redactDeep) as T

  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, redactDeep(x)])) as T
  }

  return v
}
