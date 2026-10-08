import type { Register } from 'claude-code'

import { errorKey, nudge, signature, Streaks } from './loop'

/**
 * Retry Analyzer: spots Claude hammering a failing call and tells it to change strategy.
 * The note rides in `context` (or the deny text) so the model relays it; nothing is blocked.
 */
export const register: Register = on => {
  const streaks = new Streaks()

  on('prompt.submit', ($, e, next) => {
    streaks.reset() // the user intervened: start counting afresh

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    const denied = ran.deny !== undefined
    const failed = denied || ran.isError === true
    const err = denied ? `deny|${String(ran.deny).slice(0, 80)}` : errorKey(String(e.tool), ran.isError === true ? ran.text : '')
    const hit = streaks.record(`${e.tool}|${signature(e as Record<string, unknown>)}`, err, failed)

    if (!hit) return ran

    return denied
      ? { deny: `${ran.deny}\n\n${nudge(hit)}` }
      : { ...ran, context: [...(ran.context ?? []), nudge(hit)] }
  })
}
