import type { Register } from 'claude-code'

import { analyze } from './analyze'
import { CHOICES, deleteQuestion, deleteTitle, hardQuestion, isHomeTarget, levelOf, parseFacts, reasonUk, readAnswer, stateWords } from './decide'
import type { Facts, Level } from './decide'

const MAX_PATHS = 5
const MAX_LISTED = 8

/**
 * Blast Radius: before a risky Bash command runs, say what it will touch.
 * Static analysis plus read-only listing (globs are expanded by bash from a
 * quoted positional, never eval'd, so nothing in the command is executed).
 *
 * The transcript gets one short label. The details are appended to the end of the command's
 * own output (the part inside the tool row that the person opens with its chevron) and printed
 * by /blast. The desktop app draws that row itself, so a render hook on the row cannot reach
 * it; the output is the one place that works. The model reads the appended block too.
 */
export const register: Register = on => {
  // /blast: the one-paragraph report of the last risky command
  let last = ''

  on('session.start', async ($, e, next) => {
    // a name already taken must not break the mod
    await $.command.register({ name: 'blast', description: 'Show the full Blast Radius report of the last risky command' }).catch(() => undefined)

    return next(e)
  })

  on('command.run', { command: 'blast' }, () => ({ text: last || 'Blast Radius: no risky command so far in this session.' }))

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    // multi-line report appended to this call's output
    let block = ''

    try {
      const a = analyze(String(e.command ?? ''))

      if (a.risk !== 'none') {
        // 1. what it will touch (read-only preview; globs are expanded by bash, never eval'd)
        const touched: string[] = []

        for (const p of a.paths.slice(0, MAX_PATHS)) {
          const r = await $.process.run([
            'bash',
            '-c',
            `shopt -s nullglob; IFS=$'\\n'; set -- $1; echo "$#"; printf "%s\\n" "$@" | head -n ${MAX_LISTED}`,
            '_',
            p,
          ])

          const [count, ...sample] = String(r.stdout ?? '').split('\n').filter(Boolean)
          const n = Number(count)

          touched.push(
            !n
              ? `${p} (matches nothing)`
              : n === 1 && sample[0] === p
                ? p
                : `${p} → ${n} path(s): ${sample.join(', ')}${n > MAX_LISTED ? ', …' : ''}`,
          )
        }

        if (a.paths.length > MAX_PATHS) touched.push(`…and ${a.paths.length - MAX_PATHS} more path argument(s)`)

        if (a.git) {
          // in the repo where the command works (`cd dir &&`, `git -C dir`), not the session's
          let n = 0

          for (const dir of new Set(a.gitDirs.length ? a.gitDirs : [''])) {
            const where = (dir || '.').replaceAll('$HOME', String((await $.env.get('HOME').catch(() => '')) ?? '')).replace(/^~(?=\/|$)/, String((await $.env.get('HOME').catch(() => '')) ?? ''))
            const r = await $.process.run(['git', '-C', where, 'status', '--porcelain'])

            n += String(r.stdout ?? '').split('\n').filter(Boolean).length
          }

          touched.push(`git: ${n} file(s) with uncommitted changes in the whole repo (the command may touch only some of them)`)
        }

        // 2. how bad it is: a plain deletion is judged by what git knows about the files, anything else harder is always asked
        const home = String((await $.env.get('HOME').catch(() => '')) ?? '')
        const segment = a.segment || String(e.command ?? '')
        let level: Level = a.risk === 'high' ? 'dialog' : 'medium'
        let title = a.reasons.map(reasonUk).join('; ')
        let question = hardQuestion(a.reasons, segment)

        if (a.risk === 'high' && !a.hard && a.deletes.length > 0) {
          const facts: Facts = { count: 0, tracked: 0, dirty: 0, untracked: 0, isHome: false }

          for (const d of a.deletes) {
            const targets = d.targets.map(t => t.replaceAll('$HOME', home).replace(/^~(?=\/|$)/, home))

            if (targets.some(t => isHomeTarget(t, home))) facts.isHome = true

            const r = await $.process.run([
              'bash',
              '-c',
              `cd "$1" 2>/dev/null || cd .; shopt -s nullglob; IFS=$'\\n'; set -- $2
if [ "$#" -eq 0 ]; then echo "COUNT 0"; exit 0; fi
files=$(for t in "$@"; do if [ -d "$t" ]; then find "$t" -type f 2>/dev/null | head -n 2000; elif [ -e "$t" ] || [ -L "$t" ]; then printf '%s\\n' "$t"; fi; done | head -n 2000)
echo "COUNT $(printf '%s\\n' "$files" | grep -c .)"
tr=0; di=0; un=0
for t in "$@"; do
  # each target is judged by the repo it lives in (a nested repo is invisible from the outer one)
  if [ -d "$t" ]; then d="$t"; p="."; else d=$(dirname "$t"); p=$(basename "$t"); fi
  git -C "$d" rev-parse --is-inside-work-tree >/dev/null 2>&1 || continue
  tr=$((tr + $(git -C "$d" ls-files -- "$p" 2>/dev/null | wc -l)))
  di=$((di + $(git -C "$d" status --porcelain -uno -- "$p" 2>/dev/null | wc -l)))
  case "$(cd "$d" && pwd -P)" in /tmp|/tmp/*|/private/tmp|/private/tmp/*|/var/folders/*|/private/var/folders/*) continue;; esac
  un=$((un + $(git -C "$d" ls-files --others --exclude-standard -- "$p" 2>/dev/null | grep -v -E '(^|/)(node_modules|\\.DS_Store)(/|$)|\\.log$' | wc -l)))
done
echo "TRACKED $tr"
echo "DIRTY $di"
echo "UNTRACKED $un"`,
              '_',
              d.cwd,
              targets.join('\n'),
            ])
            const f = parseFacts(String(r.stdout ?? ''))

            facts.count += f.count
            facts.tracked += f.tracked
            facts.dirty += f.dirty
            facts.untracked += f.untracked
          }

          level = levelOf(false, facts)
          title = `${deleteTitle(facts)} (${stateWords(facts)})`
          question = deleteQuestion(facts, segment)
        }

        const label = `⚠ Blast Radius [${level === 'dialog' ? 'HIGH' : level === 'medium' ? 'MEDIUM' : 'LOW'}]`
        // nothing is said when no path could be read (sudo, dd, curl | sh): "nothing found on disk" read like a verdict
        const willTouch = touched.length ? `Will touch: ${touched.join(' | ')}` : ''

        last = `${label}: ${title}. Команда: ${segment}.${willTouch ? ` ${willTouch}.` : ''}`
        block = [`── ${label} (додано модом blast-radius, це не вивід команди) ──`, title, willTouch].filter(Boolean).join('\n')

        // one short label; everything else is at the end of the tool row's output and under /blast
        $.ui.log(label)

        if (level === 'dialog') {
          // Panes and logs are not drawn on every surface (VS Code); the ask dialog is. "Other" is added by the dialog itself.
          // a dialog that fails to show counts as Скасувати: the command must not run unasked
          const answer = readAnswer(await $.ui.ask(question, [...CHOICES]).catch(() => ''))

          if (answer.kind === 'cancel') return { deny: 'Blast Radius: користувач скасував команду після перегляду.' }

          if (answer.kind === 'custom') {
            return { deny: `Blast Radius: команду не виконано. Замість «Виконати» чи «Скасувати» користувач дав своє рішення: «${answer.text}». Зроби саме так.` }
          }
        }
      }
    } catch {
      // a preview must never break the command it previews
    }

    const ran = await next(e)

    if (!block || ran.deny !== undefined || ran.isError === true) return ran

    const result: any = ran.result

    if (!result || typeof result !== 'object' || typeof result.stdout !== 'string') return ran

    // a changed result is returned as the hook's own { result, context } (no ref/text), as Secret Redactor does
    const sep = result.stdout === '' || result.stdout.endsWith('\n') ? '\n' : '\n\n'

    return { result: { ...result, stdout: `${result.stdout}${sep}${block}` }, context: ran.context }
  })
}
