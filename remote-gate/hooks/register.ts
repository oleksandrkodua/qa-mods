import type { Register } from 'claude-code'

import { classify, repoDir } from './gate'

/**
 * Remote Gate: asks before `git push` and `wrangler ... --remote`, showing the remote, the branch
 * and the commits that will go out. The repository shown is the one the command works in
 * (`git -C dir push`, `cd dir && git push`), not only the session's own.
 * Fail closed: a dismissed or unavailable dialog refuses the command.
 */
export const register: Register = on => {
  let home = ''

  on('session.start', async ($, e, next) => {
    home = String((await $.env.get('HOME')) ?? '')

    return next(e)
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const command = String(e.command ?? '')
    const kind = classify(command)

    if (kind === undefined) return next(e)

    let approved = false

    try {
      let info = ''

      if (kind !== 'remote-db') {
        const dir = repoDir(command, home)
        const where = dir ? ['-C', dir] : []
        const remote = await $.process.run(['git', ...where, 'remote', '-v'])
        const branch = await $.process.run(['git', ...where, 'rev-parse', '--abbrev-ref', 'HEAD'])
        const out = await $.process.run(['git', ...where, 'log', '--oneline', '@{u}..HEAD'])
        const urls = remote.stdout.split('\n').filter(l => l.includes('(push)')).join('; ')
        const commits = out.exitCode === 0 ? out.stdout.trim() || 'немає нових комітів' : 'upstream не задано'

        // the dialog collapses line breaks, so the parts are labelled sentences
        info = ` Тека: ${dir ?? 'тека сесії'}. Гілка: ${branch.stdout.trim() || '?'}. Remote: ${urls || '?'}. Піде: ${commits.split('\n').slice(0, 12).join(' | ')}.`
      }

      const label = kind === 'force-push' ? 'FORCE-PUSH' : kind === 'push' ? 'git push' : 'wrangler --remote (бойові дані)'
      const answer = await $.ui.ask(`Remote Gate: ${label}. Команда: ${command.slice(0, 200)}.${info} Виконати?`, {
        options: ['Виконати', 'Скасувати'],
        header: 'Remote Gate',
      })

      approved = answer === 'Виконати'
    } catch {
      // dismissed or headless: fail closed
    }

    if (!approved) return { deny: 'remote-gate: не підтверджено. Не повторюй команду без нової згоди користувача.' }

    return next(e)
  })
}
