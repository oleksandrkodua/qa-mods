import { describe, expect, test } from 'claude-code/testing'

// $.ui.ask is a tool.call of AskUserQuestion: the test answers it like the dialog would
const stubs = (on: any, answer: string | Error, argvs: string[][] = [], asked: string[] = []) => {
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('env.get', ($: any, e: any) => ({ value: e.name === 'HOME' ? '/Users/x' : undefined }))
  on('process.run', ($: any, e: any) => (argvs.push([...e.argv]), { value: { exitCode: 0, stdout: 'origin\tgit@github.com:x/y.git (push)\n', stderr: '' } }))
  on('tool.call', { tool: 'AskUserQuestion' }, ($: any, e: any) => {
    if (answer instanceof Error) throw answer

    const q = String(e.questions[0].question)

    asked.push(q)

    return { result: { questions: e.questions, answers: { [q]: answer } } }
  })
}

describe('remote-gate', () => {
  test('a confirmed push runs; the dialog names the remote', async ($, on) => {
    let ran = 0
    const argvs: string[][] = []
    const asked: string[] = []
    stubs(on, 'Виконати', argvs, asked)
    on('tool.call', { tool: 'Bash' }, () => (ran++, { result: { stdout: '', stderr: '' } }))
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    const out: any = await $.tool.call({ tool: 'Bash', command: 'git push origin main' })

    expect(out.deny).toBeUndefined()
    expect(ran).toBe(1)
    expect(argvs.some(a => a.join(' ').includes('remote -v'))).toBe(true)
    expect(asked[0]).toContain('git push origin main')
    expect(asked[0]).toContain('git@github.com:x/y.git')
  })

  test('a cancelled push is refused and never runs', async ($, on) => {
    let ran = 0
    stubs(on, 'Скасувати')
    on('tool.call', { tool: 'Bash' }, () => (ran++, { result: { stdout: '', stderr: '' } }))
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    const out: any = await $.tool.call({ tool: 'Bash', command: 'git push --force origin main' })

    expect(out.deny).toContain('remote-gate')
    expect(ran).toBe(0)
  })

  test('a dialog that fails or is dismissed refuses the command (fail closed)', async ($, on) => {
    let ran = 0
    stubs(on, new Error('dismissed'))
    on('tool.call', { tool: 'Bash' }, () => (ran++, { result: { stdout: '', stderr: '' } }))
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    const out: any = await $.tool.call({ tool: 'Bash', command: 'git push' })

    expect(out.deny).toBeDefined()
    expect(ran).toBe(0)
  })

  test('git -C <dir> push inspects that folder, and unrelated commands are not asked about', async ($, on) => {
    const argvs: string[][] = []
    const asked: string[] = []
    stubs(on, 'Виконати', argvs, asked)
    on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: '', stderr: '' } }))
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    await $.tool.call({ tool: 'Bash', command: 'git -C public push' })

    expect(argvs.some(a => a.slice(0, 3).join(' ') === 'git -C public')).toBe(true)
    expect(asked[0]).toContain('Тека: public')

    argvs.length = 0
    asked.length = 0

    const out: any = await $.tool.call({ tool: 'Bash', command: 'git status' })

    expect(out.deny).toBeUndefined()
    expect(argvs).toEqual([])
    expect(asked).toEqual([])
  })
})
