import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Limit } from '../types'

import { bandLabel, bandPlaceholders, cacheChip, cacheLeft, isReset, limitLabel, report, tone, untilResetShort } from './format'

const limits = atom({ plugin: 'hud', key: 'limits' } as const, [])
const usd = atom({ plugin: 'hud', key: 'usd' } as const, null)
const stale = atom({ plugin: 'hud', key: 'stale' } as const, false)
const lastReplyAt = atom({ plugin: 'hud', key: 'lastReplyAt' } as const, 0)
const tick = atom({ plugin: 'hud', key: 'tick' } as const, 0)
const ctx = atom({ plugin: 'hud', key: 'ctx' } as const, -1)
const showTimes = atom({ plugin: 'hud', key: 'showTimes' } as const, false)
// the screen-share mod's own state; null until that mod has set it, when it is absent or when /mods has it off: then no button is drawn
const shareOff = atom({ plugin: 'screen-share', key: 'disabled' } as const, false)
const shareOn = atom({ plugin: 'screen-share', key: 'on' } as const, null as boolean | null)

const ASK: Record<string, string> = {
  compact: 'Стиснути розмову? Її буде замінено підсумком, щоб звільнити контекст; подробиці втрачаються.',
  clear: 'Очистити всю розмову? Почнеться з порожнього контексту, це неможливо скасувати.',
}
const CHOICES = ['Підтвердити', 'Скасувати']

// The same text as HANDOFF_PROMPT in handoff/hooks/logic.ts (a test keeps the two equal): the button fills the
// box itself, so no command runs and the chat gets no `/handoff` bubble. It is the command of the active-memory plugin.
export const HANDOFF_PROMPT = `/active-memory:amhandoff`

const COLOR = { ok: '#30A46C', warn: '#E09A1E', hot: '#FF1F1F' } as const

/**
 * HUD: one line above the prompt: context fill, rate-limit windows and a `кеш 59:48` chip (m:ss, ticking every second) while the prompt-cache
 * countdown runs (cost is left out so the five buttons fit a narrow window; `/hud` still reports it), then the buttons (handoff,
 * Compact, Clear, Progress), and /hud with the figures as text
 * (VS Code does not draw the band). The Handoff button fills the prompt box itself (no command runs); the Progress
 * button runs a command another mod registers (`progress`); a missing mod just makes it do nothing. Compact and Clear ask first (confirm /
 * cancel) and then run the real command: it is done here because the engine refuses `command.run` from inside a
 * `command.run` hook, so a command of another mod could not do it.
 * The band stacks with other mods' bands: the hook asks the hooks beneath (`next`) first
 * and adds its own line above the result.
 */
export const register: Register = (on, options) => {
  const ttl = Number(options?.cacheTtlMinutes) > 0 ? Number(options.cacheTtlMinutes) : 60
  const warnAt = Number(options?.warnPercent) > 0 ? Number(options.warnPercent) : 80
  const redAt = Number(options?.redPercent) > 0 ? Number(options.redPercent) : 85
  const ctxWarn = Number(options?.ctxWarnPercent) > 0 ? Number(options.ctxWarnPercent) : 50
  const ctxRed = Number(options?.ctxRedPercent) > 0 ? Number(options.ctxRedPercent) : 80
  const alarmed = new Set<string>()
  const warned = new Set<string>()
  let stop: (() => void) | null = null
  let lastReply = 0

  on('session.start', async ($, e, next) => {
    // a name already taken must not break the mod
    await $.command.register({ name: 'hud', description: 'Show rate limits, session cost and the prompt-cache countdown as text' }).catch(() => undefined)

    // The windows belong to the account, not the session: show the last ones seen until a reply
    // refreshes them, so the band is not empty for the whole first turn.
    try {
      const now = await $.clock.now()
      // no reading yet (or the call failing) is the same as an empty one: fall back to the saved windows
      const fresh = (await $.session.usage().catch(() => ({ rateLimits: [] as Limit[] }))).rateLimits

      if (fresh.length > 0) {
        await update($, limits, () => fresh.map(l => ({ kind: l.kind, percentUsed: l.percentUsed, resetsAt: l.resetsAt })))
      } else {
        const saved = (await $.store.get('limits')) as { savedAt: number; limits: Limit[] } | undefined
        const usable = (saved?.limits ?? []).filter(l => (l.resetsAt ? Date.parse(l.resetsAt) > now : now - (saved?.savedAt ?? 0) < 6 * 3600000))

        if (usable.length > 0) {
          await update($, limits, () => usable)
          await update($, stale, () => true)
        }
      }
    } catch {
      // a missing reading only leaves the band empty until the first reply
    }

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    const now = await $.clock.now()

    // an empty reading (no reply yet, or not a subscription) must not wipe the saved windows
    if (e.rateLimits.length > 0) {
      const fresh = e.rateLimits.map(l => ({ kind: l.kind, percentUsed: l.percentUsed, resetsAt: l.resetsAt }))

      await update($, limits, () => fresh)
      await update($, stale, () => false)
      await $.store.set('limits', { savedAt: now, limits: fresh }).catch(() => undefined)
    }
    await update($, usd, () => e.cost?.usd ?? null)
    await update($, ctx, () => Math.round(e.context.percent ?? 0))

    // a turn finished (context or cost moved): that response refreshed the prompt cache
    if (e.changed.includes('context') || e.changed.includes('cost')) {
      lastReply = now
      await update($, lastReplyAt, () => now)
    }

    for (const l of e.rateLimits) {
      if (l.percentUsed >= warnAt && !warned.has(l.kind)) {
        warned.add(l.kind)
        $.ui.toast(`HUD: ліміт ${limitLabel(l.kind)} використано на ${Math.round(l.percentUsed)}%`)
      } else if (l.percentUsed < warnAt) {
        warned.delete(l.kind)
      }

      if (l.percentUsed >= redAt && !alarmed.has(l.kind)) {
        alarmed.add(l.kind)
        $.ui.toast(`HUD: ліміт ${limitLabel(l.kind)} майже вичерпано, ${Math.round(l.percentUsed)}%`)
      } else if (l.percentUsed < redAt) {
        alarmed.delete(l.kind)
      }
    }

    // one-second redraw only while a cache countdown is running
    if (stop === null && lastReply > 0) {
      stop = $.clock.every(1000, () => {
        void (async () => {
          await update($, tick, n => n + 1)

          if (cacheLeft(lastReply, ttl, await $.clock.now()) === 0) {
            stop?.()
            stop = null
          }
        })()
      })
    }

    return next(e)
  })

  on('command.run', { command: 'hud' }, async $ => ({
    text: report({
      limits: await read($, limits),
      usd: await read($, usd),
      lastReplyAt: await read($, lastReplyAt),
      ttlMinutes: ttl,
      now: await $.clock.now(),
      warnAt,
      redAt,
      stale: await read($, stale),
    }),
  }))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const below = await next(e)
    const list = await read($, limits)
    const fill = await read($, ctx)
    const times = await read($, showTimes)
    const sharing = (await read($, shareOff)) ? null : await read($, shareOn)

    await read($, tick)

    const now = await $.clock.now()
    const { Box, Text, Button } = $.ui.resolve(e)
    const run = (command: string) => () => void $.command.run({ command }).catch(() => undefined)
    // fills an empty box with the command; a slash command only works at the start, so a typed draft is kept and the command is copied
    const fillHandoff = () =>
      void (async () => {
        const draft = await $.prompt.read().catch(() => ({ text: '' }))
        const hasDraft = String(draft?.text ?? '').trim() !== ''
        const filled = hasDraft ? { isFilled: false } : await $.prompt.fill({ text: HANDOFF_PROMPT, mode: 'replace' }).catch(() => ({ isFilled: false }))

        if (filled.isFilled) {
          $.ui.toast('Команда в полі вводу. Натисни Enter.')

          return
        }

        const copied = await $.ui.copy({ text: HANDOFF_PROMPT }).catch(() => ({ isCopied: false }))

        $.ui.toast(
          copied.isCopied
            ? `${hasDraft ? 'У полі є твій текст' : 'Поле вводу зараз не заповнити'}: команду ${HANDOFF_PROMPT} скопійовано, встав її сам.`
            : `${hasDraft ? 'У полі є твій текст' : 'Поле вводу зараз не заповнити'}: введи ${HANDOFF_PROMPT} сам.`,
        )
      })()
    const confirmRun = (command: 'compact' | 'clear') => () =>
      void (async () => {
        const answer = await $.ui.ask(ASK[command]!, CHOICES).catch(() => CHOICES[1])

        if (answer === CHOICES[0]) {
          // Compact is a model call (about 40 s) and the host shows nothing meanwhile; /clear waits in the queue behind it
          $.ui.toast(command === 'compact' ? 'Стиснення запущено: це може тривати до хвилини, чекай.' : 'Очищення запущено.')
          await $.command.run({ command }).catch(() => undefined)
        } else {
          $.ui.toast(`${command === 'compact' ? 'Стиснення' : 'Очищення'} скасовано: нічого не змінено.`)
        }
      })()
    const dot = (k: string) => (
      <Text key={`dot-${k}`} dimColor>
        ·
      </Text>
    )

    // the %/⏱ switch sits between the 5г and 7д figures, in place of the dot that was there
    const timesButton = <Button key="b-times" label={times ? '%' : '⏱'} onPress={() => void update($, showTimes, v => !v)} />

    const chip = cacheChip(await read($, lastReplyAt), ttl, now)
    const parts = [
      fill < 0 ? (
        <Text key="ctx" dimColor>Контекст —</Text>
      ) : fill >= ctxWarn ? (
        <Text key="ctx" color={fill >= ctxRed ? COLOR.hot : COLOR.warn}>{`Контекст ${fill}%`}</Text>
      ) : (
        <Text key="ctx" dimColor>{`Контекст ${fill}%`}</Text>
      ),
      ...(list.length === 0
        ? [
            <Box key="limits" flexDirection="row" alignItems="center" gap={1}>
              {bandPlaceholders().flatMap((t, i) => [...(i > 0 ? [dot(`p${i}`)] : []), <Text key={`ph-${i}`} dimColor>{t}</Text>])}
            </Box>,
          ]
        : [
            <Box key="limits" flexDirection="row" alignItems="center" gap={1}>
              {list.flatMap((l, i) => [
                ...(i > 0 ? [i === 1 ? timesButton : dot(`l${i}`)] : []),
                isReset(l.resetsAt, now) ? (
                  <Text key={`limit-${l.kind}`} dimColor>{`${bandLabel(l.kind)} скинуто`}</Text>
                ) : (
                  <Text key={`limit-${l.kind}`}>
                    <Text dimColor>{`${bandLabel(l.kind)} `}</Text>
                    <Text color={COLOR[tone(l.percentUsed, warnAt, redAt)]} bold={l.percentUsed >= redAt}>
                      {times ? untilResetShort(l.resetsAt, now) || '—' : `${Math.round(l.percentUsed)}%`}
                    </Text>
                  </Text>
                ),
              ])}
              {list.length === 1 ? timesButton : null}
            </Box>,
          ]),
      ...(chip ? [<Text key="cache" dimColor>{chip}</Text>] : []),
    ]

    // the bands below a step under the buttons: a desktop draws native buttons taller than a text row, and flush under
    // them the plan-progress divider cut through their bottom edge; the terminal draws `sm` down as 0 cells, as before.
    // Under a survey (the limit notice is one) the row stays and the survey goes on top; the bands below it
    // (plan-progress, the next-step chips) yield on their own. The row has no hotkeys to take the survey's digits.
    const survey = e.props.hasSurvey

    return (
      <Box flexDirection="column" rowGap="sm">
        {survey ? below : null}
        <Box flexDirection="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Box flexDirection="row" flexWrap="wrap" alignItems="center" gap={1} flexShrink={1}>
            {parts}
            <Button key="b-handoff" label="Handoff" onPress={fillHandoff} />
            <Button key="b-compact" label="Compact" onPress={confirmRun('compact')} />
            <Button key="b-clear" label="Clear" onPress={confirmRun('clear')} />
            <Button key="b-progress" label="Прогрес" onPress={run('progress')} />
          </Box>
          {/* its own column: whatever the left side does (a longer cache chip, the clock mode), the share button stays top right */}
          <Box flexShrink={0}>
            {sharing === null ? null : <Button key="b-share" label={sharing ? '🟢' : '🔴'} onPress={run('screen-share')} />}
          </Box>
        </Box>
        {survey ? null : below}
      </Box>
    )
  })
}
