import { describe, expect, test } from 'claude-code/testing'

const STEP = { turnId: 't1', index: 0, model: 'm', messageCount: 1 }

const stub = (on: any, answer: string) => {
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('command.register', ($: any, e: any) => ({ value: { command: e.name } }))
  on('turn.start', ($: any, e: any) => ({ turnId: e.turnId }))
  on('turn.step', async function* () {
    yield { kind: 'text', index: 0, text: answer }
    yield { kind: 'stop', stopReason: 'end_turn', usage: null }

    return { turnId: 't1', index: 0, answer, toolUses: [], stopReason: 'end_turn', usage: null }
  })
}

const texts = async (stream: AsyncIterable<any>) => {
  const out: any[] = []
  for await (const c of stream) out.push(c)

  return out
}

describe('verification-guard', () => {
  test('restores evidence and assessments from host state and continues counters', async ($, on) => {
    const ref = { plugin: 'verification-guard', key: 'history' } as const
    const claim = { kind: 'tests' as const, quote: 'All tests pass now.' }
    stub(on, claim.quote)
    on('tool.call', () => ({ result: {} }))
    const initial = {
      ledger: [
        { n: 1, turn: 7, tool: 'Edit', kind: 'edit', label: '/work/a.ts', ok: true },
        { n: 2, turn: 7, tool: 'Bash', kind: 'test', label: 'npm test', ok: true },
      ],
      log: [{ turn: 7, a: { rows: [{ claim, supported: true, note: 'test: npm test' }], supported: 1, status: 'VERIFIED' } }],
      turn: 7,
      n: 2,
    }
    let saved = initial
    on('state.get', ref, async ($, e, next) => {
      const result = await next(e)
      return result.value.value === undefined ? { ...result, value: { ...result.value, value: initial } } : result
    })
    on('state.set', ref, async ($, e, next) => {
      saved = e.value as typeof initial
      return next(e)
    })
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
    await $.turn.start({ text: 'report', turnId: 't1' })
    await $.tool.call({ tool: 'Read', file_path: '/work/a.ts' })
    const joined = (await texts($.turn.step(STEP))).filter(c => c.kind === 'text').map(c => c.text).join('')
    expect(joined).toBe(claim.quote)
    const { text } = await $.command.run({ command: 'evidence', args: '', origin: { kind: 'composer' } })
    expect(text).toContain('2 claim(s) checked, 2 supported')
    expect(text).toContain('[turn 7]')
    expect(text).toContain('[turn 8]')
    expect(text).toContain('1 test ✓')
    expect(saved.turn).toBe(8)
    expect(saved.n).toBe(3)
    expect(saved.ledger.at(-1)?.n).toBe(3)
  })

  test('an unsupported claim gets a warning chunk before the stop chunk', async ($, on) => {
    stub(on, 'All tests pass now.')
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
    await $.turn.start({ text: 'fix it', turnId: 't1' })

    const chunks = await texts($.turn.step(STEP))
    const joined = chunks.filter(c => c.kind === 'text').map(c => c.text).join('')

    expect(joined).toContain('verification-guard: UNVERIFIED (0/1)')
    expect(chunks.at(-1).kind).toBe('stop')
  })

  test('a claim backed by an edit then a passing test run is left alone', async ($, on) => {
    stub(on, 'All tests pass now.')
    on('tool.call', () => ({ result: { stdout: '', stderr: '' } }))
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
    await $.turn.start({ text: 'fix it', turnId: 't1' })
    await $.tool.call({ tool: 'Edit', file_path: '/work/a.ts', old_string: 'a', new_string: 'b' })
    await $.tool.call({ tool: 'Bash', command: 'npm test' })

    const joined = (await texts($.turn.step(STEP))).filter(c => c.kind === 'text').map(c => c.text).join('')

    expect(joined).toBe('All tests pass now.')
  })

  test('/evidence lists the claim and the reason', async ($, on) => {
    stub(on, 'I verified the fix.')
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
    await $.turn.start({ text: 'fix it', turnId: 't1' })
    await texts($.turn.step(STEP))

    const { text } = await $.command.run({ command: 'evidence', args: '', origin: { kind: 'composer' } })

    expect(text).toContain('UNVERIFIED')
    expect(text).toContain('verified the fix')
  })
})
