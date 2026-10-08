import { describe, expect, mock, test } from 'claude-code/testing'

const BAND = {
  component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 100, scroll: { bodyRows: 10 }, view: {} },
} as const

const STEP = { turnId: 't1', index: 0, model: 'm', messageCount: 1 }

const fillModes: string[] = []

const stubs = (on: any, filled = true) => {
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('command.register', ($: any, e: any) => ({ value: { command: e.name } }))
  on('session.measure', ($: any, e: any) => ({ changed: e.changed }))
  // these two results are the plain objects the ops resolve to, not wrapped in { value }
  on('prompt.fill', ($: any, e: any) => (fillModes.push(String(e.mode)), { isFilled: filled }))
  on('ui.copy', () => ({ isCopied: true }))
  on('ui.render', ($: any, e: any) => $.ui.resolve(e).Box({}))
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
    expect(await ui.find({ type: 'Button' })).toBeUndefined()
    expect(await ui.find({ type: 'Text', text: /Контекст уже заповнюється/ })).toBeDefined()
    await ui.unmount()
  })

  test('desktop: a mini Clippy (Svg) beside the band, its mood follows the context; a line from 50%', async ($, on) => {
    stubs(on)
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    await measure($, 30)
    const calm = await $.ui.mount({ plugin: 'handoff', surface: 'desktop', ...BAND })
    expect(await calm.find({ type: 'Svg', alt: /calm/ })).toBeDefined()
    expect(await calm.find({ type: 'Text', text: /Збери handoff/ })).toBeUndefined()
    await calm.unmount()

    await measure($, 90)
    const panic = await $.ui.mount({ plugin: 'handoff', surface: 'desktop', ...BAND })
    expect(await panic.find({ type: 'Svg', alt: /panic/ })).toBeDefined()
    expect(await panic.find({ type: 'Text', text: /Збери handoff/ })).toBeDefined()
    await panic.unmount()
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

    expect(ok.text).toContain('у полі вводу')
  })

  test('/handoff pressed from the hud band (origin plugin) leaves the transcript clean', async ($, on) => {
    stubs(on, true)
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    const out = await $.command.run({ command: 'handoff', args: '', origin: { kind: 'plugin', name: 'hud' } })

    expect(out.text).toBeUndefined()
  })

  test('/handoff keeps a draft the person typed: the prompt goes after it (append), an empty box is replaced', async ($, on) => {
    stubs(on, true)
    fillModes.length = 0
    let draft = 'мій чернетковий текст'
    on('prompt.read', () => ({ value: { text: draft, cursor: draft.length } }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    const withDraft = await $.command.run({ command: 'handoff', args: '', origin: { kind: 'composer' } })
    draft = ''
    await $.command.run({ command: 'handoff', args: '', origin: { kind: 'composer' } })

    expect(fillModes).toEqual(['append', 'replace'])
    expect(String(withDraft.text)).toContain('після твого тексту')
  })

  test('/handoff prints the prompt when the box cannot be filled', async ($, on) => {
    stubs(on, false)
    await $.session.start({ surface: 'vscode', isInteractive: true, cwd: '/work' })

    const out = await $.command.run({ command: 'handoff', args: '', origin: { kind: 'composer' } })

    expect(out.text).toContain('HANDOFF.md')
  })
})
