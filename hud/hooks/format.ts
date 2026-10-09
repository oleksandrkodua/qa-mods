import type { Limit } from '../types'


const LABEL: Record<string, string> = { five_hour: '5 год', seven_day: '7 дн', spend_limit: 'ліміт витрат' }

export const limitLabel = (kind: string) => LABEL[kind] ?? kind

/** The band's one-line labels: 5г, 7д. */
export const bandLabel = (kind: string) => ({ five_hour: '5г', seven_day: '7д' })[kind] ?? limitLabel(kind)

/** `m:ss` for under an hour, `h:mm:ss` from an hour up; never negative. */
export function countdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const two = (n: number) => String(n).padStart(2, '0')

  return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`
}

/** "1г 07х" style time until a reset; empty when unknown or already passed. */
export function untilReset(resetsAt: string | undefined, now: number): string {
  if (!resetsAt) return ''

  const ms = Date.parse(resetsAt) - now

  if (!Number.isFinite(ms) || ms <= 0) return ''

  const mins = Math.round(ms / 60000)
  const d = Math.floor(mins / 1440)
  const h = Math.floor((mins % 1440) / 60)
  const m = mins % 60

  if (d > 0) return `${d}д ${h}г`

  return h > 0 ? `${h}г ${String(m).padStart(2, '0')}х` : `${m}х`
}

/** True when the window's reset time has passed: the saved percent belongs to a window that no longer exists. */
export function isReset(resetsAt: string | undefined, now: number): boolean {
  if (!resetsAt) return false

  const ms = Date.parse(resetsAt)

  return Number.isFinite(ms) && ms <= now
}

export type Tone = 'ok' | 'warn' | 'hot'

export const tone = (percent: number, warnAt: number, redAt = 85): Tone => (percent >= redAt ? 'hot' : percent >= warnAt ? 'warn' : 'ok')

export const money = (usd: number) => `$${usd.toFixed(2)}`

/** Cache time left: the last reply plus the TTL. null before the first reply. */
export function cacheLeft(lastReplyAt: number, ttlMinutes: number, now: number): number | null {
  if (!lastReplyAt) return null

  return Math.max(0, lastReplyAt + ttlMinutes * 60000 - now)
}

/** The band's cache chip: "кеш 42хв" while the countdown runs; empty before the first reply and once it has expired. */
export function cacheChip(lastReplyAt: number, ttlMinutes: number, now: number): string {
  const left = cacheLeft(lastReplyAt, ttlMinutes, now)

  return left ? `кеш ${Math.ceil(left / 60000)}хв` : ''
}

/** The same figures as plain text, for /hud (the only place VS Code can show them). */
export function report(args: { limits: Limit[]; usd: number | null; lastReplyAt: number; ttlMinutes: number; now: number; warnAt: number; redAt?: number; stale?: boolean }): string {
  const { limits, usd, lastReplyAt, ttlMinutes, now, warnAt, redAt = 85, stale } = args
  const lines = [stale ? 'Ліміти (збережені з минулої сесії, оновляться після першої відповіді):' : 'Ліміти:']

  if (limits.length === 0) lines.push('  даних немає (їх віддає лише підписка, і лише після першої відповіді)')

  for (const l of limits) {
    if (isReset(l.resetsAt, now)) {
      lines.push(`  ${limitLabel(l.kind).padEnd(8)} скинуто (було ${Math.round(l.percentUsed)}%, нове значення прийде з наступною відповіддю)`)
      continue
    }

    const reset = untilReset(l.resetsAt, now)
    const flag = l.percentUsed >= redAt ? `  ‼ понад ${redAt}%` : l.percentUsed >= warnAt ? `  ⚠ понад ${warnAt}%` : ''

    lines.push(`  ${limitLabel(l.kind).padEnd(8)} ${String(Math.round(l.percentUsed)).padStart(3)}%${reset ? `  (скидання через ${reset})` : ''}${flag}`)
  }

  lines.push(`Витрати сесії: ${usd === null ? 'невідомо' : money(usd)}`)

  const left = cacheLeft(lastReplyAt, ttlMinutes, now)

  lines.push(`Кеш: ${left === null ? 'ще немає відповіді' : left === 0 ? 'прострочений' : `≈ ${countdown(left)} (оцінка: остання відповідь + ${ttlMinutes} хв)`}`)

  return lines.join('\n')
}
