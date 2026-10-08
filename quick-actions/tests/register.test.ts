import { describe, expect, test } from 'claude-code/testing'

// $.ui.ask is a tool.call of AskUserQuestion: the test answers it like the dialog would
const stubs = (on: any, answer: string | Error | (() => string), ran: string[] = [], asked: string[] = []) => {
  on('session.start', ($: any, e: any) => ({ cwd: e.cwd }))
  on('command.run', ($: any, e: any) => (ran.push(`${e.command}:${e.origin.kind}`), { text: `${e.command} done` }))
  on('tool.call', { tool: 'AskUserQuestion' }, ($: any, e: any) => {
    if (answer instanceof Error) throw answer

    const q = String(e.questions[0].question)

    asked.push(q)

    return { result: { questions: e.questions, answers: { [q]: typeof answer === 'function' ? answer() : answer } } }
  })
}

const run = ($: any, command: string, origin: any) => $.command.run({ command, args: '', origin })

describe('quick-actions', () => {
  test('VS Code: a typed /clear asks first; Скасувати stops it, Підтвердити lets it run', async ($, on) => {
    const ran: string[] = []
    const asked: string[] = []
    let answer = 'Скасувати'
    stubs(on, () => answer, ran, asked)
    await $.session.start({ surface: 'vscode', isInteractive: true, cwd: '/work' })

    const stopped = await run($, 'clear', { kind: 'composer' })

    expect(asked[0]).toContain('Очистити всю розмову')
    expect(stopped.text).toContain('скасовано')
    expect(ran).toEqual([])

    answer = 'Підтвердити'
    await run($, 'compact', { kind: 'composer' })

    expect(ran).toEqual(['compact:composer'])
  })

  test('a dismissed dialog counts as Скасувати', async ($, on) => {
    const ran: string[] = []
    stubs(on, new Error('dismissed'), ran)
    await $.session.start({ surface: 'vscode', isInteractive: true, cwd: '/work' })

    await run($, 'clear', { kind: 'composer' })

    expect(ran).toEqual([])
  })

  test('on desktop a typed /clear is not asked, and a plugin run is never asked', async ($, on) => {
    const ran: string[] = []
    const asked: string[] = []
    stubs(on, 'Підтвердити', ran, asked)
    await $.session.start({ surface: 'desktop', isInteractive: true, cwd: '/work' })
    await run($, 'clear', { kind: 'composer' })

    await $.session.start({ surface: 'vscode', isInteractive: true, cwd: '/work' })
    await run($, 'compact', { kind: 'plugin', name: 'hud' })

    expect(asked).toEqual([])
    expect(ran).toEqual(['clear:composer', 'compact:plugin'])
  })
})
