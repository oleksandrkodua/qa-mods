/** `45s`, `1m 12s`, `1h 05m`: how long something took, for a one-line notice. */
export function duration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60

  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`

  return m > 0 ? `${m}m ${String(r).padStart(2, '0')}s` : `${r}s`
}

/** One line, no quotes or backslashes (it goes into an AppleScript string), cut to `max` characters. */
export function oneLine(text: string, max = 80): string {
  const t = text.replace(/\s+/g, ' ').replace(/["\\]/g, '').trim()

  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}
