import type { Register } from 'claude-code'

import { checkCommand, checkPath, denyText } from './guard'

/** Sandbox Guard: refuses writes to protected config paths up front. */
export const register: Register = on => {
  let home = ''

  on('session.start', async ($, e, next) => {
    home = String((await $.env.get('HOME')) ?? '')

    return next(e)
  })

  on('tool.call', { tool: ['Edit', 'Write'] }, ($, e, next) => {
    const hit = home ? checkPath(String(e.file_path ?? ''), home) : null

    return hit ? { deny: denyText(hit, `${e.tool} on ${e.file_path}`) } : next(e)
  })

  on('tool.call', { tool: 'Bash' }, ($, e, next) => {
    const hit = home ? checkCommand(String(e.command ?? ''), home) : null

    return hit ? { deny: denyText(hit, 'this command') } : next(e)
  })
}
