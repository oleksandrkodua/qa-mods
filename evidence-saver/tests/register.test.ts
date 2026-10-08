import { describe, expect, mock, test } from 'claude-code/testing'

const img = { type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'A'.repeat(200) } }

const setup = (on: any) => {
  const writes: string[] = []
  const ran: string[][] = []
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('command.register', ($: any, e: any) => ({ value: { command: e.name } }))
  on('env.get', ($: any, e: any) => ({ value: e.name === 'HOME' ? '/Users/x' : undefined }))
  on('fs.write', ($: any, e: any) => (writes.push(e.path), { value: undefined }))
  on('process.run', ($: any, e: any) => (ran.push([...e.argv]), { value: { exitCode: 0, stdout: '', stderr: '' } }))

  return { writes, ran }
}

describe('evidence-saver', () => {
  test('saves into the remembered folder and tells the model to relay the path', async ($, on) => {
    mock.clock(on)
    mock.store(on, { 'evidence-dir': '/Users/x/qa-evidence' })
    const { writes, ran } = setup(on)
    on('tool.call', () => ({ result: { content: [img] } }))
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    const out: any = await $.tool.call({ tool: 'mcp__x__screenshot' })

    expect(out.result).toEqual({ content: [img] })
    expect(out.context.join(' ')).toContain('Tell the user the path')
    expect(writes[0]).toMatch(/^\/Users\/x\/qa-evidence\/\d{4}-\d\d-\d\d\/.*\.b64$/)
    expect(ran[0]![0]).toBe('python3')
  })

  test('with no folder known it never writes under a default location', async ($, on) => {
    mock.clock(on)
    mock.store(on, {})
    const { writes } = setup(on)
    on('tool.call', () => ({ result: { content: [img] } }))
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    const out: any = await $.tool.call({ tool: 'mcp__x__screenshot' })

    expect(writes).toEqual([])
    expect(out.result).toEqual({ content: [img] })
  })

  test('/evidence-dir sets, shows and rejects relative paths', async ($, on) => {
    mock.store(on, {})
    setup(on)
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })
    const run = (args: string) => $.command.run({ command: 'evidence-dir', args, origin: { kind: 'composer' } })

    expect((await run('relative/dir')).text).toContain('absolute path')
    expect((await run('/Users/x/shots')).text).toContain('/Users/x/shots')
    expect((await run('')).text).toContain('/Users/x/shots')
    expect((await run('reset')).text).toContain('cleared')
    expect((await run('')).text).toContain('no folder set')
  })
})
