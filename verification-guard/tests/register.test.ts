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
