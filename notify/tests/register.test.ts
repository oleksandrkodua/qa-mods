import { describe, expect, mock, test } from 'claude-code/testing'

const stubs = (on: any, toasts: string[], argvs: string[][]) => {
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('ui.toast', ($: any, e: any) => (toasts.push(e.text), { value: undefined }))
  on('process.run', ($: any, e: any) => (argvs.push([...e.argv]), { value: { exitCode: 0, stdout: e.argv[0] === 'uname' ? 'Darwin\n' : '', stderr: '' } }))
}

describe('notify', () => {
  test('a Bash command that ran 45 s gives a toast and a macOS notification', async ($, on) => {
    const clock = mock.clock(on)
    const toasts: string[] = []
    const argvs: string[][] = []
    stubs(on, toasts, argvs)
    on('tool.call', { tool: 'Bash' }, async () => (await clock.advance(45_000), { result: { stdout: 'ok', stderr: '' } }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    await $.tool.call({ tool: 'Bash', command: 'npm run build' })

    expect(toasts).toEqual(['✔ Command finished in 45s: npm run build'])
    expect(argvs.some(a => a[0] === 'osascript' && a.join(' ').includes('Command finished in 45s'))).toBe(true)
  })

  test('the end of a background task (a task-notification prompt) is NOT announced', async ($, on) => {
    mock.clock(on)
    const toasts: string[] = []
    const argvs: string[][] = []
    stubs(on, toasts, argvs)
    on('prompt.submit', () => ({ text: 'ok' }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    await $.prompt.submit({ text: '<task-notification><summary>npm run build completed</summary></task-notification>', origin: { kind: 'task-notification' } })

    expect(toasts).toHaveLength(0)
    expect(argvs.some(a => a[0] === 'osascript')).toBe(false)
  })

  test('a quick command is silent', async ($, on) => {
    const clock = mock.clock(on)
    const toasts: string[] = []
    const argvs: string[][] = []
    stubs(on, toasts, argvs)
    on('tool.call', { tool: 'Bash' }, async () => (await clock.advance(3_000), { result: { stdout: 'ok', stderr: '' } }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    await $.tool.call({ tool: 'Bash', command: 'ls' })

    expect(toasts).toEqual([])
    expect(argvs.some(a => a[0] === 'osascript')).toBe(false)
  })

  test('a long command that failed says so', async ($, on) => {
    const clock = mock.clock(on)
    const toasts: string[] = []
    stubs(on, toasts, [])
    on('tool.call', { tool: 'Bash' }, async () => (await clock.advance(80_000), { isError: true, text: 'exit 1', result: { stdout: '', stderr: 'boom' } }))
    await $.session.start({ surface: 'vscode', isInteractive: true, cwd: '/work' })

    await $.tool.call({ tool: 'Bash', command: 'npm test' })

    expect(toasts[0]).toContain('✘ Command failed after 1m 20s')
  })

  test('systemNotification: false keeps only the toast', { options: { systemNotification: false } }, async ($, on) => {
    const clock = mock.clock(on)
    const toasts: string[] = []
    const argvs: string[][] = []
    stubs(on, toasts, argvs)
    on('tool.call', { tool: 'Bash' }, async () => (await clock.advance(60_000), { result: { stdout: 'ok', stderr: '' } }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    await $.tool.call({ tool: 'Bash', command: 'make' })

    expect(toasts).toHaveLength(1)
    expect(argvs.some(a => a[0] === 'osascript' || a[0] === 'uname')).toBe(false)
  })
})
