import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { BEHAVIORS, WHO, characterAlt, characterSvg } from './characters'
import type { State, Who } from './characters'
import { clippyFace, clippyLine, clippyMood } from './clippy'
import { HANDOFF_PROMPT, hintLevel, hintLine } from './logic'
import { nextDelay, pickPhrase } from './phrases'

const remark = atom({ plugin: 'handoff', key: 'remark' } as const, '')
const chosen = atom({ plugin: 'handoff', key: 'who' } as const, '')
const act = atom({ plugin: 'handoff', key: 'behavior' } as const, '')

// the helper's dot: a desktop draws a Button's label alone (no colour, no size), so its colour is an emoji
// (⚪ asks for its emoji form, U+FE0F: by default it is a small text ring beside the other three)
const DOT: Record<Who, string> = { clippy: '⚪️', wizard: '🔵', dog: '🟠', cat: '🟢' }

const ACT_MS = 6000

/** A stored choice that is not one of the four helpers is the paperclip. */
const pickWho = (v: unknown): Who => ((WHO as readonly unknown[]).includes(v) ? (v as Who) : 'clippy')

/** The choice kept across sessions in `$.store`, into the session's state. */
async function loadWho($: any) {
  const saved = await $.store.get('who').catch(() => undefined)
  await update($, chosen, () => pickWho(saved))
}

/** A behaviour of the chosen helper for a few seconds; one started meanwhile is left to its own timer. */
async function play($: any, name: string) {
  await update($, act, () => name)
  $.clock.after(ACT_MS, () => void update($, act, v => (v === name ? '' : v)))
}

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
 * Since 0.7.0 desktop draws one of four animated helpers (characters.ts), picked by the dots under it and kept in
 * `$.store`; a rare behaviour plays on a failed tool call, at the end of a turn and now and then while calm.
 */
export const register: Register = (on, options) => {
  const at = Number(options?.handoffAtPercent) > 0 ? Number(options.handoffAtPercent) : 80
  const warn = Number(options?.warnPercent) > 0 ? Number(options.warnPercent) : 50
  const everySeconds = options?.remarkEverySeconds === 0 ? 0 : Number(options?.remarkEverySeconds) > 0 ? Number(options.remarkEverySeconds) : 120
  const SHOW_MS = 9000
  let lastRemark = ''
  let nextAt = 0
  let nextActAt = 0
  let timerOn = false
  // the choice is read once per load: on session.start, or on the first measure of a resumed session
  let whoLoaded = false
  let percent = 0
  let surface = ''
  let hinted = 0

  on('session.start', async ($, e, next) => {
    surface = String(e.surface ?? '')

    if (!whoLoaded) {
      whoLoaded = true
      await loadWho($)
    }

    // a name already taken must not break the mod
    await $.command.register({ name: 'handoff', description: 'Put a HANDOFF.md/CONTEXT.md prompt in the box (or copy it where the box cannot be filled)' }).catch(() => undefined)

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    percent = Math.round(e.context.percent ?? 0)

    if (!whoLoaded) {
      whoLoaded = true
      await loadWho($)
    }

    if (percent < at) hinted = 0

    // random remarks of the Clippy: a check every 5 s, a remark every `remarkEverySeconds` (x0.5..1.5), shown for 9 s.
    // Started here, not in session.start: that event may not reach the mod (a resumed session), a measure always does.
    if (!timerOn && everySeconds > 0 && surface !== 'vscode') {
      timerOn = true
      nextAt = (await $.clock.now()) + nextDelay(everySeconds, Math.random)
      nextActAt = (await $.clock.now()) + nextDelay(everySeconds * 2, Math.random)
      $.clock.every(5000, () => {
        void (async () => {
          const now = await $.clock.now()

          // now and then, while calm, a rare behaviour of the helper (twice as rare as the remarks)
          if (now >= nextActAt) {
            nextActAt = now + nextDelay(everySeconds * 2, Math.random)
            const list = BEHAVIORS[pickWho(await read($, chosen))]

            if (clippyMood(percent, warn, at) === 'calm') await play($, list[Math.floor(Math.random() * list.length)] ?? '')
          }

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

  // a failed tool call alarms the helper; the result goes on untouched
  on('tool.call', async ($, e, next) => {
    const r = await next(e)

    if (r?.isError === true) void play($, 'alert').catch(() => undefined)

    return r
  }).catch(($, e, next) => next(e)) // an observer: should it fail, the tool's own answer (replayed, not run twice) goes on

  // the main loop's turn is done: the helper congratulates
  on('turn.complete', async ($, e, next) => {
    const r = await next(e)

    if (e.agentId === undefined && !e.isAborted) void play($, 'congratulate').catch(() => undefined)

    return r
  })

  on('command.run', { command: 'handoff' }, async ($, e) => {
    // the host puts the plugin's name before a toast and a reply, so the messages do not repeat it.
    // A slash command only works at the start of the box, so a typed draft is kept and the command is copied instead.
    const draft = await $.prompt.read().catch(() => ({ text: '' }))
    const hasDraft = String(draft?.text ?? '').trim() !== ''
    const filled = hasDraft ? { isFilled: false } : await $.prompt.fill({ text: HANDOFF_PROMPT, mode: 'replace' }).catch(() => ({ isFilled: false }))

    if (filled.isFilled) {
      const note = 'Команда в полі вводу. Натисни Enter.'

      // pressed from the hud band: a toast is enough, the transcript stays clean
      if (e.origin.kind === 'plugin') {
        $.ui.toast(note)

        return {} // no text: an empty string left a blank "handoff:" reply line in the chat
      }

      return { text: note }
    }

    const copied = await $.ui.copy({ text: HANDOFF_PROMPT }).catch(() => ({ isCopied: false }))
    const why = hasDraft ? 'У полі є твій текст.' : 'Поле вводу зараз не заповнити.'

    return { text: `${why} ${copied.isCopied ? 'Команду скопійовано, встав її сам' : 'Введи сам'}: ${HANDOFF_PROMPT}` }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // under a survey (the limit notice is one) the helper stays beside it, and the survey, drawn by the layers below
    // on top of the hud row, stays the first line: no remark above it
    const survey = e.props.hasSurvey
    const ui: any = $.ui.resolve(e)
    const { Box, Text, Svg, Button } = ui
    const isDesktop = e.surface === 'desktop'
    const below = await next(e)
    const mood = clippyMood(percent, warn, at)
    const talking = await read($, remark)
    const say = talking || clippyLine(mood, percent)
    // Desktop draws the chosen helper (SMIL plays only in an interactive Svg) and one dot in its colour that goes to the
    // next helper round the four: a native button is ~33 px at least, and four of them made the column wider than the
    // picture, which pushed the hud's last button to a second line. The terminal has no Svg, so a one-line face.
    let pic = <Text>{clippyFace(mood)}</Text>

    if (isDesktop) {
      const who = pickWho(await read($, chosen))
      const behavior = await read($, act)
      const state: State = behavior ? { behavior } : { emotion: talking && mood === 'calm' ? 'talking' : mood }
      const following = WHO[(WHO.indexOf(who) + 1) % WHO.length] ?? 'clippy'
      const choose = () => void (update($, chosen, () => following), $.store.set('who', following).catch(() => undefined))

      pic = (
        <Box flexDirection="column" alignItems="center">
          <Svg source={characterSvg(who, state)} alt={characterAlt(who, state)} width={46} height={58} isInteractive />
          <Button key="who-next" plain label={DOT[who]} onPress={choose} />
        </Box>
      )
    }

    // the context line and the button live in the hud band now; here: the remark of the Clippy, then everything below
    const band = (
      <Box flexDirection="column">
        {say && !survey ? <Text color={percent >= at ? '#FF1F1F' : '#E09A1E'}>{say}</Text> : null}
        {below}
      </Box>
    )

    return (
      <Box flexDirection="row" gap={isDesktop ? 'xs' : 2}>
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
