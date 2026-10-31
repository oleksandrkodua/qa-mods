import { describe, expect, test } from 'claude-code/testing'

describe('replay-theater', () => {
  test('restores steps and cursor from host state and continues recording', async ($, on) => {
    const ref = { plugin: 'replay-theater', key: 'replay' } as const
    on('command.register', ($, e) => ({ value: { command: e.name } }))
    on('session.start', ($, e) => ({ cwd: e.cwd }))
    on('ui.open', () => ({ value: { isPlaced: true } }))
    let content = 'old'
    on('fs.read', () => ({ value: content }))
    on('tool.call', () => ((content = 'new'), { result: {} }))
    const initial = {
      steps: [
        { n: 1, tool: 'Edit', path: '/work/first.txt', diff: '-a\n+b' },
        { n: 2, tool: 'Write', path: '/work/second.txt', diff: '+second' },
      ],
      cursor: 0,
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
    const ui = await $.ui.mount({ plugin: 'replay-theater', surface: 'terminal', component: 'Pane', requestId: 'replay-theater', props: { placement: 'dock', bodyColumns: 80, scroll: { bodyRows: 20 } } } as any)
    expect(await ui.find({ type: 'Text', text: /step 1\/2/ })).toBeDefined()
    await ui.press({ key: 'Next ▶' })
    expect(await ui.find({ type: 'Text', text: /step 2\/2/ })).toBeDefined()
    await $.tool.call({ tool: 'Edit', file_path: '/work/third.txt', old_string: 'old', new_string: 'new' })
    expect(await ui.find({ type: 'Text', text: /step 3\/3/ })).toBeDefined()
    expect(saved.steps.map(s => s.path)).toEqual(['/work/first.txt', '/work/second.txt', '/work/third.txt'])
    expect(saved.cursor).toBe(2)
    await ui.unmount()
  })

  test('/replay says so with no edits', async ($, on) => {
    on('command.register', ($, e) => ({ value: { command: e.name } }))
    on('session.start', ($, e) => ({ cwd: e.cwd }))
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    const { text } = await $.command.run({ command: 'replay', args: '', origin: { kind: 'composer' } })

    expect(text).toContain('no file edits')
  })

  test('records an edit and /replay opens the pane', async ($, on) => {
    const opened: string[] = []
    let content = 'a\nb'
    on('command.register', ($, e) => ({ value: { command: e.name } }))
    on('fs.read', () => ({ value: content }))
    on('ui.open', ($, e) => (opened.push(e.id), { value: { isPlaced: true } }))
    on('tool.call', () => ((content = 'a\nB'), { result: {} }))
    on('session.start', ($, e) => ({ cwd: e.cwd }))
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    await $.tool.call({ tool: 'Edit', file_path: '/work/f.txt', old_string: 'b', new_string: 'B' })
    await $.command.run({ command: 'replay', args: '', origin: { kind: 'composer' } })

    expect(opened).toEqual(['replay-theater'])
  })
})

describe('replay-theater pane', () => {
  test('draws a step and pages with Prev/Next on every surface', async ($, on) => {
    let content = 'a'
    on('session.start', ($, e) => ({ cwd: e.cwd }))
    on('command.register', ($, e) => ({ value: { command: e.name } }))
    on('fs.read', () => ({ value: content }))
    on('ui.open', () => ({ value: { isPlaced: true } }))
    on('tool.call', () => ((content += 'x'), { result: {} }))
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    await $.tool.call({ tool: 'Edit', file_path: '/work/f.txt', old_string: 'a', new_string: 'ax' })
    await $.tool.call({ tool: 'Edit', file_path: '/work/f.txt', old_string: 'ax', new_string: 'axx' })

    for (const surface of ['terminal', 'desktop', 'vscode'] as const) {
      const ui = await $.ui.mount({
        plugin: 'replay-theater',
        surface,
        component: 'Pane',
        requestId: 'replay-theater',
        props: { placement: 'dock', bodyColumns: 80, scroll: { bodyRows: 20 } },
      } as any)

      expect(await ui.find({ type: 'Text', text: /step 2\/2/ })).toBeDefined()
      await ui.press({ key: '◀ Prev' })
      expect(await ui.find({ type: 'Text', text: /step 1\/2/ })).toBeDefined()
      await ui.press({ key: 'Next ▶' })
      expect(await ui.find({ type: 'Text', text: /step 2\/2/ })).toBeDefined()
      await ui.unmount()
    }
  })
})
