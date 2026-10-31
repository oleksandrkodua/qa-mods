import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { detectClaims } from './claims'
import { assess, classify, warning } from './ledger'

const MAX_ENTRIES = 500
const history = atom({ plugin: 'verification-guard', key: 'history' } as const, { ledger: [], log: [], turn: 0, n: 0 })

/**
 * Verification Guard: Claude's claims ("tests pass", "verified", "fixed", "no regression")
 * are checked against the tool calls that actually ran. Unsupported claims get a visible
 * warning appended to the answer; `/evidence` lists claims and what backs them.
 * Warn only: the text is already written when it can be judged, nothing is blocked.
 */
export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    // a name already taken must not break the mod
    await $.command
      .register({
        name: 'evidence',
        description: 'Claude’s claims this session and the evidence behind each',
      })
      .catch(() => undefined)

    return next(e)
  })

  on('turn.start', async ($, e, next) => {
    await update($, history, saved => ({ ...saved, turn: saved.turn + 1 }))

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    const { kind, label } = classify(String(e.tool), e as { command?: unknown; file_path?: unknown })

    await update($, history, saved => ({
      ...saved,
      n: saved.n + 1,
      ledger: [...saved.ledger, { n: saved.n + 1, turn: saved.turn, tool: String(e.tool), kind, label, ok: ran.deny === undefined && ran.isError !== true }].slice(-MAX_ENTRIES),
    }))

    return ran
  })

  on('turn.step', async function* ($, e, next) {
    const stream = next(e)
    let text = ''
    let last = -1
    let sawTool = false

    while (true) {
      const { value, done } = await stream.next()

      if (done) return value

      if (value.kind === 'text') {
        text += value.text
        last = value.index
      } else if (value.kind === 'tool') {
        sawTool = true
      } else if (value.kind === 'stop' && e.agentId === undefined && !sawTool && value.stopReason === 'end_turn' && last >= 0) {
        // the final answer of the main loop: judge its claims before it is closed
        const { ledger, turn } = await read($, history)
        const a = assess(detectClaims(text), ledger, turn)

        if (a.rows.length) {
          await update($, history, saved => ({ ...saved, log: [...saved.log, { turn, a }] }))

          if (a.supported < a.rows.length) yield { kind: 'text', index: last, text: warning(a) }
        }
      }

      yield value
    }
  })

  on('command.run', { command: 'evidence' }, async $ => {
    const { ledger, log } = await read($, history)
    const rows = log.flatMap(x => x.a.rows.map(r => ({ turn: x.turn, r })))
    const ok = rows.filter(x => x.r.supported).length
    const count = (k: string, good?: boolean) => ledger.filter(x => x.kind === k && (good === undefined || x.ok === good)).length

    const head = rows.length
      ? `Verification Guard — ${rows.length} claim(s) checked, ${ok} supported (${Math.round((100 * ok) / rows.length)}%) → ${
          ok === rows.length ? 'VERIFIED' : ok === 0 ? 'UNVERIFIED' : 'PARTIALLY VERIFIED'
        }`
      : 'Verification Guard — no verification/completion claims seen yet in this session.'

    const body = rows.map(x => `${x.r.supported ? '✓' : '✗'} [turn ${x.turn}] «${x.r.claim.quote}»\n    ${x.r.note}`).join('\n')

    const tally = `Ledger: ${count('edit')} edit · ${count('test', true)} test ✓ ${count('test', false)} ✗ · ${count('http', true)} http ✓ ${count('http', false)} ✗ · ${count('browser')} browser · ${count('read')} read · ${count('run')} run`

    return { text: [head, body, tally].filter(Boolean).join('\n\n') }
  })
}
