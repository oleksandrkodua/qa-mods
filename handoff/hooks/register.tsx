import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { clippyFace, clippyLine, clippyMood, clippySvg } from './clippy'
import { HANDOFF_PROMPT, hintLevel, hintLine } from './logic'
import { nextDelay, pickPhrase } from './phrases'

const remark = atom({ plugin: 'handoff', key: 'remark' } as const, '')

/**
 * Handoff: the `/handoff` command, the mini Clippy with its mood and random remarks beside the band above the prompt
 * (the context figure and the button are drawn by the hud band since 0.6.0), and the VS Code hint. The mood: calm below
 * `warnPercent` (50), worried from it, panic from `handoffAtPercent` (80).
 * Prototype: a mini Clippy beside the band: calm, worried from `warnPercent`, panic from
 * `handoffAtPercent`, with a short line once it is worried. Desktop draws an SVG, the terminal a one-line face.
 * From `handoffAtPercent` (default 80) VS Code, which draws no band, gets the hint after the final answer.
 * VS Code draws no band: a hint line is added to the end of the final answer instead, once at the
 * threshold and again for every further 5 points. `/handoff` works everywhere: it puts the prompt
 * into the input box (nothing is sent), or, where the box cannot be filled, copies it and prints it.
 */
export const register: Register = (on, options) => {
  const at = Number(options?.handoffAtPercent) > 0 ? Number(options.handoffAtPercent) : 80
  const warn = Number(options?.warnPercent) > 0 ? Number(options.warnPercent) : 50
  const everySeconds = options?.remarkEverySeconds === 0 ? 0 : Number(options?.remarkEverySeconds) > 0 ? Number(options.remarkEverySeconds) : 120
  const SHOW_MS = 9000
  let lastRemark = ''
  let nextAt = 0
  let timerOn = false
  let percent = 0
  let surface = ''
  let hinted = 0

  on('session.start', async ($, e, next) => {
    surface = String(e.surface ?? '')

    // a name already taken must not break the mod
    await $.command.register({ name: 'handoff', description: 'Put a HANDOFF.md/CONTEXT.md prompt in the box (or copy it where the box cannot be filled)' }).catch(() => undefined)

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    percent = Math.round(e.context.percent ?? 0)

    if (percent < at) hinted = 0

    // random remarks of the Clippy: a check every 5 s, a remark every `remarkEverySeconds` (x0.5..1.5), shown for 9 s.
    // Started here, not in session.start: that event may not reach the mod (a resumed session), a measure always does.
    if (!timerOn && everySeconds > 0 && surface !== 'vscode') {
      timerOn = true
      nextAt = (await $.clock.now()) + nextDelay(everySeconds, Math.random)
      $.clock.every(5000, () => {
        void (async () => {
          const now = await $.clock.now()

          if (now < nextAt) return

          lastRemark = pickPhrase(clippyMood(percent, warn, at), lastRemark, Math.random)
          nextAt = now + nextDelay(everySeconds, Math.random)
          await update($, remark, () => lastRemark)
          $.clock.after(SHOW_MS, () => void update($, remark, () => ''))
        })()
      })
    }

    return next(e)
  })

  on('command.run', { command: 'handoff' }, async ($, e) => {
    // the host puts the plugin's name before a toast and a reply, so the messages do not repeat it.
    // A draft the person already typed is kept: the prompt goes after it instead of over it.
    const draft = await $.prompt.read().catch(() => ({ text: '' }))
    const hasDraft = String(draft?.text ?? '').trim() !== ''
    const filled = await $.prompt
      .fill({ text: hasDraft ? `\n\n${HANDOFF_PROMPT}` : HANDOFF_PROMPT, mode: hasDraft ? 'append' : 'replace' })
      .catch(() => ({ isFilled: false }))

    if (filled.isFilled) {
      const note = hasDraft ? 'промпт додано після твого тексту в полі вводу. Перевір і натисни Enter.' : 'промпт у полі вводу. Перевір і натисни Enter.'

      // pressed from the hud band: a toast is enough, the transcript stays clean
      if (e.origin.kind === 'plugin') {
        $.ui.toast(note[0]!.toUpperCase() + note.slice(1))

        return {} // no text: an empty string left a blank "handoff:" reply line in the chat
      }

      return { text: note[0]!.toUpperCase() + note.slice(1) }
    }

    const copied = await $.ui.copy({ text: HANDOFF_PROMPT }).catch(() => ({ isCopied: false }))

    return { text: `${copied.isCopied ? 'Промпт скопійовано, встав його в поле вводу.' : 'Поле вводу зараз не заповнити, скопіюй промпт нижче.'}\n\n${HANDOFF_PROMPT}` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const below = await next(e)

    if (e.props.hasSurvey) return below

    const ui: any = $.ui.resolve(e)
    const { Box, Text, Svg } = ui
    const isDesktop = e.surface === 'desktop'
    const mood = clippyMood(percent, warn, at)
    const talking = await read($, remark)
    const say = talking || clippyLine(mood, percent)
    // prototype: a mini Clippy beside the band. Desktop draws an SVG; the terminal has no Svg, so a one-line face.
    const pic = isDesktop ? <Svg source={clippySvg(mood)} alt={`Clippy: ${mood}`} width={46} height={58} /> : <Text>{clippyFace(mood)}</Text>

    // the context line and the button live in the hud band now; here: the remark of the Clippy, then everything below
    const band = (
      <Box flexDirection="column">
        {say ? <Text color={percent >= at ? '#FF1F1F' : '#E09A1E'}>{say}</Text> : null}
        {below}
      </Box>
    )

    return (
      <Box flexDirection="row" gap={2}>
        {pic}
        {band}
      </Box>
    )
  })

  // VS Code draws no band: the hint rides on the final answer of the main loop
  on('turn.step', async function* ($, e, next) {
    const stream = next(e)
    let last = -1
    let sawTool = false

    while (true) {
      const { value, done } = await stream.next()

      if (done) return value

      if (value.kind === 'text') {
        last = value.index
      } else if (value.kind === 'tool') {
        sawTool = true
      } else if (value.kind === 'stop' && surface === 'vscode' && e.agentId === undefined && !sawTool && value.stopReason === 'end_turn' && last >= 0) {
        const level = hintLevel(percent, at)

        if (level > hinted) {
          hinted = level
          yield { kind: 'text', index: last, text: `\n\n${hintLine(percent)}` }
        }
      }

      yield value
    }
  })
}
