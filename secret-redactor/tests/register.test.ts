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
})
