import { describe, expect, test } from 'claude-code/testing'

type Facts = { count: number; tracked: number; dirty: number; untracked?: number }

// process.run answers two kinds of scripts: the path preview ("3 a b c") and the git facts (COUNT / TRACKED / DIRTY)
const stubs = (on: any, logs: string[] = [], facts: Facts = { count: 2, tracked: 0, dirty: 0 }, asked: string[] = [], answer: string | Error = 'Виконати') => {
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('command.register', ($: any, e: any) => ({ value: { command: e.name } }))
  on('env.get', () => ({ value: '/Users/x' }))
  on('process.run', ($: any, e: any) => ({
    value: {
      exitCode: 0,
      stdout: String(e.argv[2] ?? '').includes('COUNT') ? `COUNT ${facts.count}\nTRACKED ${facts.tracked}\nDIRTY ${facts.dirty}\nUNTRACKED ${facts.untracked ?? 0}\n` : '3\na\nb\nc\n',
      stderr: '',
    },
  }))
  on('ui.log', ($: any, e: any, next: any) => (logs.push(e.text), next(e)))
  on('ui.toast', () => ({ value: undefined }))
  on('tool.call', { tool: 'AskUserQuestion' }, ($: any, e: any) => {
    if (answer instanceof Error) throw answer

    const q = String(e.questions[0].question)

    asked.push(q)

    return { result: { questions: e.questions, answers: { [q]: answer } } }
  })
}

const bash = ($: any, command: string) => $.tool.call({ tool: 'Bash', command })

describe('blast-radius', () => {
  test('files outside git: no dialog, one LOW label, the command runs', async ($, on) => {
    const logs: string[] = []
    const asked: string[] = []
    let ran = false
    stubs(on, logs, { count: 2, tracked: 0, dirty: 0 }, asked)
    on('tool.call', { tool: 'Bash' }, () => ((ran = true), { result: { stdout: '', stderr: '' } }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    const out = await bash($, 'cd tests && rm -f register.mjs look.html')

    expect(out.deny).toBeUndefined()
    expect(ran).toBe(true)
    expect(asked).toEqual([])
    expect(logs).toEqual(['⚠ Blast Radius [LOW]'])

    const { text } = await $.command.run({ command: 'blast', args: '', origin: { kind: 'composer' } })

    expect(text).toContain('Видалення 2 файлів (поза git)')
    expect(text).toContain('Команда: rm -f register.mjs look.html')
  })

  test('tracked files without changes: a MEDIUM label, still no dialog', async ($, on) => {
    const logs: string[] = []
    const asked: string[] = []
    stubs(on, logs, { count: 3, tracked: 3, dirty: 0 }, asked)
    on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: '', stderr: '' } }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    await bash($, 'rm a b c')

    expect(asked).toEqual([])
    expect(logs).toEqual(['⚠ Blast Radius [MEDIUM]'])
  })

  test('uncommitted changes: a short Ukrainian dialog with the rm line only; Виконати runs it', async ($, on) => {
    const logs: string[] = []
    const asked: string[] = []
    let ran = false
    stubs(on, logs, { count: 3, tracked: 3, dirty: 1 }, asked, 'Виконати')
    on('tool.call', { tool: 'Bash' }, () => ((ran = true), { result: { stdout: '', stderr: '' } }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    const out = await bash($, 'python3 - <<EOF\nbig script\nEOF\nrm a b c')

    expect(asked).toEqual(['Видалення 3 файлів (незакомічених змін: 1). Команда: rm a b c. Виконати?'])
    expect(logs).toEqual(['⚠ Blast Radius [HIGH]'])
    expect(out.deny).toBeUndefined()
    expect(ran).toBe(true)
  })

  test('Скасувати and a skipped dialog both stop the command', async ($, on) => {
    const asked: string[] = []
    let ran = false
    stubs(on, [], { count: 3, tracked: 3, dirty: 1 }, asked, 'Скасувати')
    on('tool.call', { tool: 'Bash' }, () => ((ran = true), { result: { stdout: '', stderr: '' } }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    const out = await bash($, 'rm a b c')

    expect(String(out.deny)).toContain('скасував')
    expect(ran).toBe(false)
  })

  test('a file git does not track asks first: nothing can bring it back', async ($, on) => {
    const asked: string[] = []
    let ran = false
    stubs(on, [], { count: 1, tracked: 0, dirty: 0, untracked: 1 }, asked, 'Скасувати')
    on('tool.call', { tool: 'Bash' }, () => ((ran = true), { result: { stdout: '', stderr: '' } }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    const out = await bash($, 'rm blast-test.md')

    expect(asked).toEqual(['Видалення 1 файлу (1 файл без git-копії, не відновити). Команда: rm blast-test.md. Виконати?'])
    expect(String(out.deny)).toContain('скасував')
    expect(ran).toBe(false)
  })

  test('a dialog that cannot be shown stops the command (never runs it unasked)', async ($, on) => {
    let ran = false
    stubs(on, [], { count: 3, tracked: 3, dirty: 1 }, [], new Error('no ui'))
    on('tool.call', { tool: 'Bash' }, () => ((ran = true), { result: { stdout: '', stderr: '' } }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    const out = await bash($, 'rm a b c')

    expect(out.deny).toBeDefined()
    expect(ran).toBe(false)
  })

  test('Other: the typed decision replaces the command and is handed to Claude', async ($, on) => {
    let ran = false
    stubs(on, [], { count: 3, tracked: 3, dirty: 1 }, [], 'видали тільки перший файл')
    on('tool.call', { tool: 'Bash' }, () => ((ran = true), { result: { stdout: '', stderr: '' } }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    const out = await bash($, 'rm a b c')

    expect(ran).toBe(false)
    expect(String(out.deny)).toContain('видали тільки перший файл')
    expect(String(out.deny)).toContain('своє рішення')
  })

  test('more than 20 files and other hard risks always ask', async ($, on) => {
    const asked: string[] = []
    stubs(on, [], { count: 25, tracked: 0, dirty: 0 }, asked)
    on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: '', stderr: '' } }))
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })

    await bash($, 'rm -rf cache')
    await bash($, 'sudo ls')

    expect(asked).toHaveLength(2)
    expect(asked[0]).toContain('багато файлів')
    expect(asked[1]).toContain('запуск із sudo')
  })

  test('the report is appended to the end of that command\'s own output', async ($, on) => {
    stubs(on)
    on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: 'done\n', stderr: '' } }))
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    const out: any = await bash($, 'cp a.txt b.txt')

    expect(out.result.stdout.startsWith('done\n')).toBe(true)
    expect(out.result.stdout).toContain('⚠ Blast Radius [MEDIUM]')
    expect(out.result.stdout).toContain('cp can overwrite existing files')
    expect(out.result.stdout).toContain('Will touch:')
    expect(out.result.stderr).toBe('')
  })

  test('a harmless command logs nothing and its output is untouched', async ($, on) => {
    const logs: string[] = []
    stubs(on, logs)
    on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: 'x', stderr: '' } }))

    const out: any = await bash($, 'ls -la')

    expect(logs).toEqual([])
    expect(out.result.stdout).toBe('x')
  })
})
