import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Limit } from '../types'

import { bandLabel, cacheLeft, isReset, limitLabel, report, tone, untilReset } from './format'

const limits = atom({ plugin: 'hud', key: 'limits' } as const, [])
const usd = atom({ plugin: 'hud', key: 'usd' } as const, null)
const stale = atom({ plugin: 'hud', key: 'stale' } as const, false)
const lastReplyAt = atom({ plugin: 'hud', key: 'lastReplyAt' } as const, 0)
const tick = atom({ plugin: 'hud', key: 'tick' } as const, 0)
const ctx = atom({ plugin: 'hud', key: 'ctx' } as const, 0)
const showTimes = atom({ plugin: 'hud', key: 'showTimes' } as const, false)

const ASK: Record<string, string> = {
  compact: 'Стиснути розмову? Її буде замінено підсумком, щоб звільнити контекст; подробиці втрачаються.',
  clear: 'Очистити всю розмову? Почнеться з порожнього контексту, це неможливо скасувати.',
}
const CHOICES = ['Підтвердити', 'Скасувати']

const COLOR = { ok: '#30A46C', warn: '#E09A1E', hot: '#FF1F1F' } as const

/**
 * HUD: one line above the prompt: context fill and rate-limit windows (cost and the prompt-cache countdown are
 * left out so the five buttons fit a narrow window; `/hud` still reports them), then the buttons (handoff,
 * Compact, Clear, Progress), and /hud with the figures as text
 * (VS Code does not draw the band). The handoff and Progress buttons run commands that other mods register
 * (`handoff`, `progress`); a missing mod just makes its button do nothing. Compact and Clear ask first (confirm /
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

    if (e.props.hasSurvey) return below

    await read($, tick)

    const now = await $.clock.now()
    const { Box, Text, Button } = $.ui.resolve(e)
    const run = (command: string) => () => void $.command.run({ command }).catch(() => undefined)
    const confirmRun = (command: 'compact' | 'clear') => () =>
      void (async () => {
        const answer = await $.ui.ask(ASK[command]!, CHOICES).catch(() => CHOICES[1])

        if (answer === CHOICES[0]) await $.command.run({ command }).catch(() => undefined)
        else $.ui.toast(`${command === 'compact' ? 'Стиснення' : 'Очищення'} скасовано: нічого не змінено.`)
      })()
    const dot = (k: string) => (
      <Text key={`dot-${k}`} dimColor>
        ·
      </Text>
    )

    const parts = [
      fill >= ctxWarn ? (
        <Text key="ctx" color={fill >= ctxRed ? COLOR.hot : COLOR.warn}>{`Контекст ${fill}%`}</Text>
      ) : (
        <Text key="ctx" dimColor>{`Контекст ${fill}%`}</Text>
      ),
      ...(list.length === 0
        ? []
        : [
            <Box key="limits" flexDirection="row" alignItems="center" gap={1}>
              {list.flatMap((l, i) => [
                ...(i > 0 ? [dot(`l${i}`)] : []),
                isReset(l.resetsAt, now) ? (
                  <Text key={`limit-${l.kind}`} dimColor>{`${bandLabel(l.kind)} скинуто`}</Text>
                ) : (
                  <Text key={`limit-${l.kind}`}>
                    <Text dimColor>{`${bandLabel(l.kind)} `}</Text>
                    <Text color={COLOR[tone(l.percentUsed, warnAt, redAt)]} bold={l.percentUsed >= redAt}>
                      {times ? untilReset(l.resetsAt, now) || '—' : `${Math.round(l.percentUsed)}%`}
                    </Text>
                  </Text>
                ),
              ])}
              <Button key="b-times" label={times ? '%' : '⏱'} onPress={() => void update($, showTimes, v => !v)} />
            </Box>,
          ]),
    ]

    return (
      <Box flexDirection="column">
        <Box flexDirection="row" flexWrap="wrap" alignItems="center" gap={1}>
          {parts.flatMap((p, i) => (i === 0 ? [p] : [dot(String(i)), p]))}
          <Button key="b-handoff" label="Handoff" onPress={run('handoff')} />
          <Button key="b-compact" label="Compact" onPress={confirmRun('compact')} />
          <Button key="b-clear" label="Clear" onPress={confirmRun('clear')} />
          <Button key="b-progress" label="Прогрес" onPress={run('progress')} />
        </Box>
        {below}
      </Box>
    )
  })
}
