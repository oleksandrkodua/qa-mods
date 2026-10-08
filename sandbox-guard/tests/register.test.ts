import { describe, expect, test } from 'claude-code/testing'

describe('sandbox-guard', () => {
  test('denies Write to a protected path, allows others', async ($, on) => {
    on('env.get', () => ({ value: '/Users/x' }))
    on('tool.call', () => ({ result: { ok: true } }))
    on('session.start', ($, e) => ({ cwd: e.cwd }))
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    const bad = await $.tool.call({ tool: 'Write', file_path: '/Users/x/.claude/skills/a/SKILL.md', content: '' })
    expect(bad.deny).toContain('Terminal')

    const good = await $.tool.call({ tool: 'Write', file_path: '/Users/x/Desktop/a.md', content: '' })
    expect(good.deny).toBeUndefined()
  })

  test('denies a Bash write, allows a Bash read', async ($, on) => {
    on('env.get', () => ({ value: '/Users/x' }))
    on('tool.call', () => ({ result: { stdout: '', stderr: '' } }))
    on('session.start', ($, e) => ({ cwd: e.cwd }))
    await $.session.start({ surface: 'terminal', isInteractive: true, cwd: '/work' })

    expect((await $.tool.call({ tool: 'Bash', command: 'echo {} > ~/.claude/settings.json' })).deny).toBeDefined()
    expect((await $.tool.call({ tool: 'Bash', command: 'cat ~/.claude/settings.json' })).deny).toBeUndefined()
  })
})
