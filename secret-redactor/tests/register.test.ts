import { describe, expect, test } from 'claude-code/testing'

describe('secret-redactor', () => {
  test('masks secrets in result, drops ref/text, asks the model to tell the user', async ($, on) => {
    on('tool.call', () => ({
      result: { stdout: 'DB_PASSWORD=hunter2hunter2', stderr: '' },
      text: 'DB_PASSWORD=hunter2hunter2',
      ref: 1,
    }))

    const out: any = await $.tool.call({ tool: 'Bash', command: 'env' })

    expect(JSON.stringify(out)).not.toContain('hunter2')
    expect(out.result.stdout).toContain('[REDACTED]')
    expect(out.ref).toBeUndefined()
    expect(out.context.join(' ')).toContain('Tell the user')
  })

  test('clean output passes through untouched', async ($, on) => {
    on('tool.call', () => ({ result: { stdout: 'hello', stderr: '' }, text: 'hello', ref: 1 }))

    const out: any = await $.tool.call({ tool: 'Bash', command: 'echo hello' })

    expect(out.result.stdout).toBe('hello')
    expect(out.context).toBeUndefined()
  })

  // Regression (0.1.4): a blocked call (isError) carries a string `result`; running it through
  // redactDeep made the engine reject it ("expected object, received string") and hid the block message.
  test('isError with a string result keeps the string intact (guard block message is not lost)', async ($, on) => {
    // The sample holds a random (never hardcoded) password so the old behaviour (redactDeep on the string) visibly changes it.
    const sample = crypto.randomUUID()
    const blocked = `BLOCKED by qa-spec-secret-guard: password = "${sample}" in a spec file`

    on('tool.call', () => ({ isError: true, result: blocked, text: blocked }))

    const out: any = await $.tool.call({ tool: 'Write', file_path: 'a.spec.ts', content: 'x' })

    expect(out.isError).toBe(true)
    expect(typeof out.result).toBe('string')
    expect(out.result).toBe(blocked)
  })
})
