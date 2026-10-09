import { describe, expect, mock, test } from 'claude-code/testing'

import { HANDOFF_PROMPT } from '../hooks/register'

const stub = (on: any) => {
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('command.register', ($: any, e: any) => ({ value: { command: e.name } }))
  on('session.measure', ($: any, e: any) => ({ changed: e.changed }))
  on('ui.toast', () => ({ value: undefined }))
  // the engine's own drawing beneath the plugin: an empty box
  on('ui.render', ($: any, e: any) => $.ui.resolve(e).Box({}))
}

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100, scroll: { bodyRows: 10 }, view: {} },
} as const

const MEASURE = {
  context: { percent: 10 },
  rateLimits: [
    { kind: 'five_hour', percentUsed: 14, resetsAt: '2026-10-06T11:07:00Z' },
    { kind: 'seven_day', percentUsed: 83 },
  ],
  cost: { usd: 0.1 },
  changed: ['context', 'cost', 'rateLimits'],
} as const

describe('hud', () => {
  test('/hud before any measurement says there is no data', async ($, on) => {
    mock.clock(on)
    stub(on)
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    const { text } = await $.command.run({ command: 'hud', args: '', origin: { kind: 'composer' } })

    expect(text).toContain('даних немає')
    expect(text).toContain('ще немає відповіді')
  })

  test('/hud after a measurement lists the windows, the cost and the cache', async ($, on) => {
    mock.clock(on, { now: Date.parse('2026-10-06T10:00:00Z') })
    stub(on)
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
    await $.session.measure({
      context: { percent: 10 },
      rateLimits: [
        { kind: 'five_hour', percentUsed: 14, resetsAt: '2026-10-06T11:07:00Z' },
        { kind: 'seven_day', percentUsed: 83 },
      ],
      cost: { usd: 0.1 },
      changed: ['context', 'cost', 'rateLimits'],
    })

    const { text } = await $.command.run({ command: 'hud', args: '', origin: { kind: 'composer' } })

    expect(text).toMatch(/5 год\s+14%/)
    expect(text).toMatch(/7 дн\s+83%.*понад 80%/)
    expect(text).toContain('$0.10')
    expect(text).toContain('1г 07х')
    expect(text).toContain('≈ 1:00:00')
  })

  test('the band shows the limits and the cache chip (m:ss) but not cost or the h:mm:ss countdown', async ($, on) => {
    mock.clock(on, { now: Date.parse('2026-10-06T10:00:00Z') })
    stub(on)
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
    await $.session.measure(MEASURE)

    for (const surface of ['terminal', 'desktop'] as const) {
      const ui = await $.ui.mount({ plugin: 'hud', surface, ...BAND })

      expect(await ui.find({ type: 'Text', text: /14%/ })).toBeDefined()
      expect(await ui.find({ type: 'Text', text: /83%/ })).toBeDefined()
      expect(await ui.find({ type: 'Text', text: /\$0\.10/ })).toBeUndefined()
      expect(await ui.find({ type: 'Text', text: /1:00:00/ })).toBeUndefined()
      expect(await ui.find({ type: 'Text', text: /^кеш 60:00$/ })).toBeDefined()
      await ui.unmount()
    }
  })

  test('a window whose reset time has passed shows "скинуто" instead of the old percent', async ($, on) => {
    mock.clock(on, { now: Date.parse('2026-10-06T12:00:00Z') })
    stub(on)
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })
    await $.session.measure({ ...MEASURE, rateLimits: [{ kind: 'five_hour', percentUsed: 91, resetsAt: '2026-10-06T11:07:00Z' }, { kind: 'seven_day', percentUsed: 21, resetsAt: '2026-10-12T20:00:00Z' }] })

    const ui = await $.ui.mount({ plugin: 'hud', surface: 'desktop', ...BAND })

    expect(await ui.find({ type: 'Text', text: /5г скинуто/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /91%/ })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: /21%/ })).toBeDefined()
    await ui.unmount()
  })

  test('the limits show the percent; the ⏱ button swaps both for the time to the reset, and % swaps back', async ($, on) => {
    mock.clock(on, { now: Date.parse('2026-10-06T10:00:00Z') })
    stub(on)
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })
    await $.session.measure({ ...MEASURE, rateLimits: [{ kind: 'five_hour', percentUsed: 81, resetsAt: '2026-10-06T12:23:00Z' }, { kind: 'seven_day', percentUsed: 33, resetsAt: '2026-10-12T20:00:00Z' }] })

    const ui = await $.ui.mount({ plugin: 'hud', surface: 'desktop', ...BAND })

    expect(await ui.find({ type: 'Text', text: /81%/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /2г 23х/ })).toBeUndefined()
    expect(await ui.find({ type: 'Button', text: /⏱/ })).toBeDefined()

    await ui.press({ key: 'b-times' })

    expect(await ui.find({ type: 'Text', text: /2г 23х/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /81%/ })).toBeUndefined()
    expect(await ui.find({ type: 'Button', text: /^%$/ })).toBeDefined()

    await ui.press({ key: 'b-times' })

    expect(await ui.find({ type: 'Text', text: /81%/ })).toBeDefined()
    await ui.unmount()
  })

  test('one line: context, limits; then the four buttons', async ($, on) => {
    mock.clock(on, { now: Date.parse('2026-10-06T10:00:00Z') })
    stub(on)
    const ran: string[] = []
    on('command.run', ($: any, e: any) => (ran.push(e.command), { text: '' }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })
    await $.session.measure({ ...MEASURE, context: { percent: 49 }, rateLimits: [{ kind: 'five_hour', percentUsed: 31 }, { kind: 'seven_day', percentUsed: 28 }] })

    const ui = await $.ui.mount({ plugin: 'hud', surface: 'desktop', ...BAND })

    expect(await ui.find({ type: 'Text', text: /Контекст 49%/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /5г/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /7д/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /31%/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /до скидання/ })).toBeUndefined()

    for (const label of ['Handoff', 'Compact', 'Clear', 'Прогрес']) {
      expect(await ui.find({ type: 'Button', text: new RegExp(label) })).toBeDefined()
    }

    await ui.unmount()
  })

  test('Compact asks first: Підтвердити runs the command, Скасувати changes nothing; Прогрес runs its command', async ($, on) => {
    mock.clock(on, { now: Date.parse('2026-10-06T10:00:00Z') })
    stub(on)
    const ran: string[] = []
    const asked: string[] = []
    let answer = 'Скасувати'
    on('command.run', ($: any, e: any) => (ran.push(`${e.command}:${e.origin.kind}`), { text: '' }))
    on('tool.call', { tool: 'AskUserQuestion' }, ($: any, e: any) => {
      const q = String(e.questions[0].question)

      asked.push(q)

      return { result: { questions: e.questions, answers: { [q]: answer } } }
    })
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })
    await $.session.measure(MEASURE)

    const ui = await $.ui.mount({ plugin: 'hud', surface: 'desktop', ...BAND })

    await ui.press({ key: 'b-compact' })
    expect(asked[0]).toContain('Стиснути розмову')
    expect(ran).toEqual([])

    answer = 'Підтвердити'
    await ui.press({ key: 'b-clear' })
    expect(asked[1]).toContain('Очистити всю розмову')
    expect(ran).toEqual(['clear:plugin'])

    await ui.press({ key: 'b-progress' })
    expect(ran).toEqual(['clear:plugin', 'progress:plugin'])
    await ui.unmount()
  })

  test('Handoff fills the box itself: no command runs, an empty box is replaced, a typed draft is kept (append)', async ($, on) => {
    mock.clock(on, { now: Date.parse('2026-10-06T10:00:00Z') })
    stub(on)
    const ran: string[] = []
    const filled: { text: string; mode: string }[] = []
    let draft = ''
    on('command.run', ($: any, e: any) => (ran.push(e.command), { text: '' }))
    on('prompt.read', () => ({ value: { text: draft, cursor: draft.length } }))
    on('prompt.fill', ($: any, e: any) => (filled.push({ text: e.text, mode: e.mode }), { isFilled: true }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })
    await $.session.measure(MEASURE)

    const ui = await $.ui.mount({ plugin: 'hud', surface: 'desktop', ...BAND })

    await ui.press({ key: 'b-handoff' })
    draft = 'мій чернетковий текст'
    await ui.press({ key: 'b-handoff' })

    expect(ran).toEqual([])
    expect(filled).toEqual([
      { text: HANDOFF_PROMPT, mode: 'replace' },
      { text: `\n\n${HANDOFF_PROMPT}`, mode: 'append' },
    ])
    await ui.unmount()
  })

  test('Handoff copies the text where the box cannot be filled', async ($, on) => {
    mock.clock(on, { now: Date.parse('2026-10-06T10:00:00Z') })
    stub(on)
    const copied: string[] = []
    on('prompt.read', () => ({ value: { text: '', cursor: 0 } }))
    on('prompt.fill', () => ({ isFilled: false }))
    on('ui.copy', ($: any, e: any) => (copied.push(e.text), { isCopied: true }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })
    await $.session.measure(MEASURE)

    const ui = await $.ui.mount({ plugin: 'hud', surface: 'desktop', ...BAND })

    await ui.press({ key: 'b-handoff' })
    expect(copied).toEqual([HANDOFF_PROMPT])
    await ui.unmount()
  })

  test('before the first measurement the band shows the context and the buttons, no cost or cache', async ($, on) => {
    mock.clock(on)
    stub(on)
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    const ui = await $.ui.mount({ plugin: 'hud', surface: 'terminal', ...BAND })

    expect(await ui.find({ type: 'Text', text: /Контекст 0%/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /\$0\.00/ })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: /кеш/ })).toBeUndefined()
    await ui.unmount()
  })

  test('a new session shows the windows saved earlier, marked as old, until a reply refreshes them', async ($, on) => {
    mock.clock(on, { now: Date.parse('2026-10-06T10:00:00Z') })
    mock.store(on, {
      limits: {
        savedAt: Date.parse('2026-10-06T09:00:00Z'),
        limits: [
          { kind: 'five_hour', percentUsed: 49, resetsAt: '2026-10-06T11:00:00Z' },
          { kind: 'seven_day', percentUsed: 6, resetsAt: '2026-10-06T08:00:00Z' },
        ],
      },
    })
    stub(on)
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    const ui = await $.ui.mount({ plugin: 'hud', surface: 'desktop', ...BAND })

    expect(await ui.find({ type: 'Text', text: /49%/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /~49%/ })).toBeUndefined()
    // the 7-day window already reset: its saved figure is dropped, not shown
    expect(await ui.find({ type: 'Text', text: /6%/ })).toBeUndefined()
    await ui.unmount()

    const { text } = await $.command.run({ command: 'hud', args: '', origin: { kind: 'composer' } })

    expect(text).toContain('збережені з минулої сесії')

    await $.session.measure(MEASURE)

    const after = await $.command.run({ command: 'hud', args: '', origin: { kind: 'composer' } })

    expect(after.text).not.toContain('збережені')
    expect(after.text).toMatch(/5 год\s+14%/)
  })
})
