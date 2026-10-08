import type { Register } from 'claude-code'

import { duration, oneLine } from './format'

/**
 * Notify: a quick pop-up when something long finishes, so you can stop watching it.
 *  - a Bash command that ran at least `longCommandSeconds` (default 30): a build, a test run, an install;
 *  - a whole turn that ran at least `longTurnSeconds` (default 120).
 * Each notice is a toast and, on macOS, also a system notification (`systemNotification`), because a toast
 * lives inside the window and the point is to be reached when you are looking at something else.
 * Not covered, on purpose: a command started with run_in_background returns at once and its end is NOT announced
 * (0.2.0 did announce it as `Background task finished: ...`; removed in 0.2.1, the text was an unreadable id and path).
 * A command that waited for an approval dialog counts that wait as running time.
 */
export const register: Register = (on, options) => {
  const cmdAfter = Number(options?.longCommandSeconds) > 0 ? Number(options.longCommandSeconds) : 30
  const turnAfter = Number(options?.longTurnSeconds) > 0 ? Number(options.longTurnSeconds) : 120
  const system = options?.systemNotification !== false
  let isMac = false
  let turnStartedAt = 0
  let lastNoticeAt = 0

  on('session.start', async ($, e, next) => {
    if (system) {
      const r = await $.process.run(['uname']).catch(() => undefined)

      isMac = String(r?.stdout ?? '').trim() === 'Darwin'
    }

    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    turnStartedAt = await $.clock.now()

    return next(e)
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const started = await $.clock.now()
    const ran = await next(e)
    const ended = await $.clock.now()
    const seconds = (ended - started) / 1000

    if (seconds >= cmdAfter && ran.deny === undefined) {
      const text = `${ran.isError === true ? '✘ Command failed after' : '✔ Command finished in'} ${duration(seconds)}: ${oneLine(String(e.command ?? ''), 60)}`

      lastNoticeAt = ended
      $.ui.toast(text, { timeoutMs: 8000 })

      if (isMac) {
        await $.process.run(['osascript', '-e', `display notification "${oneLine(text, 120)}" with title "Claude Code"`]).catch(() => undefined)
      }
    }

    return ran
  })

  on('turn.complete', async ($, e, next) => {
    const ended = await $.clock.now()
    const seconds = (ended - turnStartedAt) / 1000

    // the end of a long command was just announced: do not announce the turn right behind it
    if (e.agentId === undefined && turnStartedAt > 0 && seconds >= turnAfter && e.reason !== 'aborted' && ended - lastNoticeAt > 15000) {
      const text = `${e.reason === 'answer' ? '✔ Claude finished' : '✘ Claude stopped'} after ${duration(seconds)}`

      lastNoticeAt = ended
      $.ui.toast(text, { timeoutMs: 8000 })

      if (isMac) {
        await $.process.run(['osascript', '-e', `display notification "${oneLine(text, 120)}" with title "Claude Code"`]).catch(() => undefined)
      }
    }

    return next(e)
  })
}
