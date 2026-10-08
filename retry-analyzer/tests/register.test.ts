import { describe, expect, test } from 'claude-code/testing'

describe('retry-analyzer', () => {
  test('the 3rd identical failure carries a change-strategy note; a different call does not', async ($, on) => {
    on('tool.call', ($: any, e: any) => ({ isError: true, result: 'boom', text: `Error: ${e.command} failed` }))

    const call = () => $.tool.call({ tool: 'Bash', command: 'make build' })
    const one: any = await call()
    const two: any = await call()
    const three: any = await call()
    const other: any = await $.tool.call({ tool: 'Bash', command: 'make clean' })

    expect(one.context).toBeUndefined()
    expect(two.context).toBeUndefined()
    expect(three.context.join(' ')).toContain('failed 3 times in a row')
    expect(other.context).toBeUndefined()
  })

  test('successes never trip it', async ($, on) => {
    on('tool.call', () => ({ result: { stdout: 'ok', stderr: '' } }))

    for (let i = 0; i < 5; i++) {
      const r: any = await $.tool.call({ tool: 'Bash', command: 'make build' })
      expect(r.context).toBeUndefined()
    }
  })
})
