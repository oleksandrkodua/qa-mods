import { describe, expect, mock, test } from 'claude-code/testing'

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100, scroll: { bodyRows: 10, offset: 0 }, view: {} },
} as const

const STEP = { turnId: 't1', index: 0, model: 'm', messageCount: 1 }

const fillModes: string[] = []

const stubs = (on: any, filled = true, store: Record<string, unknown> = {}, beneath?: string) => {
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('store.get', ($: any, e: any) => ({ value: store[e.key] }))
  on('store.set', ($: any, e: any) => ((store[e.key] = e.value), { value: undefined }))
  on('command.register', ($: any, e: any) => ({ value: { command: e.name } }))
  on('session.measure', ($: any, e: any) => ({ changed: e.changed }))
  // these two results are the plain objects the ops resolve to, not wrapped in { value }
  on('prompt.fill', ($: any, e: any) => (fillModes.push(String(e.mode)), { isFilled: filled }))
  on('ui.copy', () => ({ value: { isCopied: true } }))
  // the bands beneath: an empty box, or a line standing for a survey
  on('ui.render', ($: any, e: any) => (beneath ? h($.ui.resolve(e).Text, {}, beneath) : $.ui.resolve(e).Box({})))
  on('turn.step', async function* () {
    yield { kind: 'text', index: 0, text: 'Готово.' }
    yield { kind: 'stop', stopReason: 'end_turn', usage: null }

    return { turnId: 't1', index: 0, answer: 'Готово.', toolUses: [], stopReason: 'end_turn', usage: null }
  })
}

const measure = ($: any, percent: number) => $.session.measure({ context: { percent }, rateLimits: [], changed: ['context'] })

const chunks = async (stream: AsyncIterable<any>) => {
  const out: any[] = []

  for await (const c of stream) out.push(c)

  return out.filter(c => c.kind === 'text').map(c => c.text).join('')
}

describe('handoff', () => {
  test('the context line and the button are not drawn here any more (the hud band has them)', async ($, on) => {
    stubs(on)
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })
    await measure($, 60)

    const ui = await $.ui.mount({ plugin: 'handoff', surface: 'desktop', ...BAND })

    expect(await ui.find({ type: 'Text', text: /Контекст \d+%/ })).toBeUndefined()
    // the only button is the helper's dot
    expect((await ui.findAll({ type: 'Button' })).map(b => b.key)).toEqual(['who-next'])
    expect(await ui.find({ type: 'Text', text: /Контекст уже заповнюється/ })).toBeDefined()
    await ui.unmount()
  })

  test('desktop: the helper (Svg) beside the band, its mood follows the context; a line from 50%', async ($, on) => {
    stubs(on)
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    await measure($, 30)
    const calm = await $.ui.mount({ plugin: 'handoff', surface: 'desktop', ...BAND })
    expect((await calm.find({ type: 'Svg' }))?.props.alt).toBe('Скріпка: спокій')
    expect(await calm.find({ type: 'Text', text: /Збери handoff/ })).toBeUndefined()
    await calm.unmount()

    await measure($, 90)
    const panic = await $.ui.mount({ plugin: 'handoff', surface: 'desktop', ...BAND })
    expect((await panic.find({ type: 'Svg' }))?.props.alt).toBe('Скріпка: паніка')
    expect(await panic.find({ type: 'Text', text: /Збери handoff/ })).toBeDefined()
    await panic.unmount()
  })

  test('desktop: the paperclip by default; its one dot goes to the next helper round the four, the choice is stored', async ($, on) => {
    const store: Record<string, unknown> = {}
    stubs(on, true, store)
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })
    await measure($, 30)

    const ui = await $.ui.mount({ plugin: 'handoff', surface: 'desktop', ...BAND })
    const svg = await ui.find({ type: 'Svg' })

    expect(svg?.props.alt).toBe('Скріпка: спокій')
    expect(svg?.props.isInteractive, 'SMIL plays only in an interactive Svg').toBe(true)
    // one dot in the helper's colour: a native button is ~33 px at least, and four of them made the column wider than the
    // picture, which pushed the hud's last button to a second line. ⚪ asks for its emoji form (U+FE0F), else a small text ring
    const dots = async () => (await ui.findAll({ type: 'Button' })).map(b => b.props.label)

    expect(await dots(), 'the paperclip').toEqual(['⚪️'])

    await ui.press({ key: 'who-next' })
    expect(store.who, 'the choice is kept in the store').toBe('wizard')
    expect((await ui.find({ type: 'Svg' }))?.props.alt).toBe('Чарівник: спокій')
    expect(await dots(), 'the wizard').toEqual(['🔵'])

    await ui.press({ key: 'who-next' })
    await ui.press({ key: 'who-next' })
    expect(await dots(), 'the cat').toEqual(['🟢'])
    await ui.press({ key: 'who-next' })
    expect(store.who, 'round to the paperclip again').toBe('clippy')
    await ui.unmount()
  })

  for (const [saved, alt] of [['cat', 'Кіт: спокій'], ['robot', 'Скріпка: спокій'], [42, 'Скріпка: спокій']] as const) {
    test(`desktop: the stored choice ${JSON.stringify(saved)} draws ${alt}`, async ($, on) => {
      stubs(on, true, { who: saved })
      await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })
      await measure($, 30)

      const ui = await $.ui.mount({ plugin: 'handoff', surface: 'desktop', ...BAND })

      expect((await ui.find({ type: 'Svg' }))?.props.alt).toBe(alt)
      await ui.unmount()
    })
  }

  test('desktop: under a survey the helper stays beside it, the survey on top; no remark line over it', async ($, on) => {
    stubs(on, true, {}, 'ОПИТУВАННЯ')
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })
    await measure($, 60)

    const ui = await $.ui.mount({ plugin: 'handoff', surface: 'desktop', ...BAND, props: { ...BAND.props, hasSurvey: true } })

    expect((await ui.find({ type: 'Svg' }))?.props.alt, 'the helper stays').toBe('Скріпка: тривога')
    expect(await ui.find({ type: 'Text', text: /ОПИТУВАННЯ/ }), 'the survey is drawn').toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Контекст уже заповнюється/ }), 'no remark above the survey').toBeUndefined()
    await ui.unmount()
  })

  test('desktop: a failed tool call alarms the helper for a few seconds, the end of a turn congratulates', async ($, on) => {
    const clock = mock.clock(on)
    stubs(on, true, { who: 'wizard' })
    on('tool.call', () => ({ result: 'boom', isError: true }))
    on('turn.complete', ($: any, e: any) => ({ text: e.answer }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })
    await measure($, 30)

    const ui = await $.ui.mount({ plugin: 'handoff', surface: 'desktop', ...BAND })
    const alt = async () => (await ui.find({ type: 'Svg' }))?.props.alt

    await $.tool.call({ tool: 'Bash', command: 'false' })
    await clock.settle()
    expect(await alt()).toBe('Чарівник: насторога')
    await clock.advance(7_000)
    expect(await alt(), 'back to the mood after the behaviour').toBe('Чарівник: спокій')

    await $.turn.complete({ answer: 'Готово.', durationMs: 1, isAborted: false, turnId: 't1', reason: 'answer' })
    await clock.settle()
    expect(await alt()).toBe('Чарівник: тріумф')
    await ui.unmount()
  })

  test('desktop: the Clippy says a random remark from time to time, then goes quiet', async ($, on) => {
    const clock = mock.clock(on)
    stubs(on)
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })
    await measure($, 10)

    const ui = await $.ui.mount({ plugin: 'handoff', surface: 'desktop', ...BAND })
    const quote = /скріншот-доказ|Severity|води|Автоматизація|Граничні|баг чи фіча|моїй машині|сценарій|скріпка|viewport|вовк/

    expect(await ui.find({ type: 'Text', text: quote })).toBeUndefined()

    // the first remark comes after 60-180 s (random): step in 5 s until it shows
    let shown = false

    for (let i = 0; i < 40 && !shown; i++) {
      await clock.advance(5_000)
      shown = (await ui.find({ type: 'Text', text: quote })) !== undefined
    }

    expect(shown).toBe(true)
    await clock.advance(10_000)
    expect(await ui.find({ type: 'Text', text: quote })).toBeUndefined()
    await ui.unmount()
  })

  test('terminal (CLI): a one-line face instead of the picture', async ($, on) => {
    stubs(on)
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
    await measure($, 85)

    const ui = await $.ui.mount({ plugin: 'handoff', surface: 'terminal', ...BAND })

    expect(await ui.find({ type: 'Text', text: /\(°□°\)/ })).toBeDefined()
    expect(await ui.find({ type: 'Svg' })).toBeUndefined()
    expect(await ui.find({ type: 'Button' }), 'no helper switcher in the terminal').toBeUndefined()
    await ui.unmount()
  })

  test('VS Code: the hint rides on the final answer, once per 5 points', async ($, on) => {
    stubs(on)
    await $.session.start({ surface: 'vscode', isInteractive: true, cwd: '/work' })

    await measure($, 60)
    expect(await chunks($.turn.step(STEP))).toBe('Готово.')

    await measure($, 82)
    expect(await chunks($.turn.step(STEP))).toContain('/handoff')
    // the same level again: no second hint
    expect(await chunks($.turn.step(STEP))).toBe('Готово.')

    await measure($, 87)
    expect(await chunks($.turn.step(STEP))).toContain('87%')
  })

  test('/handoff fills the prompt, or copies and prints it where the box cannot be filled', async ($, on) => {
    stubs(on, true)
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    const ok = await $.command.run({ command: 'handoff', args: '', origin: { kind: 'composer' } })

    expect(ok.text).toContain('Команда в полі вводу')
  })

  test('/handoff pressed from the hud band (origin plugin) leaves the transcript clean', async ($, on) => {
    stubs(on, true)
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    const out = await $.command.run({ command: 'handoff', args: '', origin: { kind: 'plugin', name: 'hud' } })

    expect(out.text).toBeUndefined()
  })

  test('/handoff keeps a draft the person typed (the command is copied), an empty box is filled', async ($, on) => {
    stubs(on, true)
    fillModes.length = 0
    let draft = 'мій чернетковий текст'
    on('prompt.read', () => ({ value: { text: draft, cursor: draft.length } }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    const withDraft = await $.command.run({ command: 'handoff', args: '', origin: { kind: 'composer' } })
    draft = ''
    await $.command.run({ command: 'handoff', args: '', origin: { kind: 'composer' } })

    expect(fillModes).toEqual(['replace'])
    expect(String(withDraft.text)).toContain('У полі є твій текст')
    expect(String(withDraft.text)).toContain('/active-memory:amhandoff')
  })

  test('/handoff prints the prompt when the box cannot be filled', async ($, on) => {
    stubs(on, false)
    await $.session.start({ surface: 'vscode', isInteractive: true, cwd: '/work' })

    const out = await $.command.run({ command: 'handoff', args: '', origin: { kind: 'composer' } })

    expect(out.text).toContain('/active-memory:amhandoff')
  })
})
