export type Kind = 'push' | 'force-push' | 'remote-db'

/** Drop heredoc bodies (documents/code fed to another program) unless a shell reads them. */
function stripHeredocs(cmd: string): string {
  const out: string[] = []
  let end: string | null = null
  let keep = false

  for (const line of cmd.split('\n')) {
    if (end !== null) {
      if (line.trim() === end) end = null
      else if (keep) out.push(line)

      continue
    }

    out.push(line)

    const m = /<<-?\s*(['"]?)([A-Za-z_]\w*)\1/.exec(line)

    if (m) {
      end = m[2]!
      keep = /\b(ba|z|da|)sh\s*(-\w+\s*)*(-\s*)?<</.test(line)
    }
  }

  return out.join('\n')
}

/** Quoted strings emptied: `echo "git push"` and a commit message that mentions it are not a push. */
const maskQuotes = (s: string) => s.replace(/'[^']*'|"(?:[^"\\]|\\.)*"/g, '""')

// git's own options that take the next word as their value: `git -C dir push`, `git -c k=v push`
const GIT_ARG_OPTS = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path', '--config-env', '--super-prefix', '--attr-source'])

/** Where the git subcommand sits after the `git` at words[at], past git's own options: in `git -C dir stash push` it is `stash`. */
function gitSubIndex(words: string[], at: number): number {
  for (let i = at + 1; i < words.length; ) {
    if (!words[i]!.startsWith('-')) return i

    i += GIT_ARG_OPTS.has(words[i]!) ? 2 : 1
  }

  return -1
}

const gitSubcommand = (words: string[], at: number) => words[gitSubIndex(words, at)]

const segmentWords = (seg: string) => seg.trim().replace(/^[({]+\s*/, '').split(/\s+/).filter(Boolean)

/** The words after `push` in the first `git push` of the command line, or undefined if there is none. */
function pushArgs(command: string): { words: string[]; seg: string } | undefined {
  for (const seg of maskQuotes(stripHeredocs(command)).split(/\n|;|&&|\|\||\|/)) {
    const words = segmentWords(seg)

    for (let at = 0; at < words.length; at++) {
      if (words[at]!.replace(/^.*\//, '') === 'git' && gitSubcommand(words, at) === 'push') return { words: words.slice(gitSubIndex(words, at) + 1), seg }
    }
  }

  return undefined
}

const FORCE = /--force\b|--force-with-lease|--force-if-includes|(^|\s)-f(\s|$)|\+\S+:|\s\+\S+/

export function classify(command: string): Kind | undefined {
  const cmd = maskQuotes(stripHeredocs(command))
  let push: Kind | undefined

  // `push` counts only as the git subcommand (`git push`, `git -C dir push`); `git stash push` and `git log --grep push` do not
  for (const seg of cmd.split(/\n|;|&&|\|\||\|/)) {
    const words = segmentWords(seg)

    for (let at = 0; at < words.length; at++) {
      if (words[at]!.replace(/^.*\//, '') !== 'git' || gitSubcommand(words, at) !== 'push') continue

      push = push === 'force-push' || FORCE.test(seg) ? 'force-push' : 'push'
    }
  }

  if (push) return push

  if (/\bwrangler\b/.test(cmd) && /--remote\b/.test(cmd)) return 'remote-db'

  return undefined
}

const unquote = (s: string) => s.replace(/^["']|["']$/g, '')

/**
 * The folder the command works in: `git -C <dir> push` or a leading `cd <dir> &&`.
 * Without it the gate would describe the session's own repository, not the one being pushed.
 */
export function repoDir(command: string, home: string): string | undefined {
  const cmd = stripHeredocs(command)
  const c = /\bgit\s+(?:--?[\w-]+(?:=\S+)?\s+)*-C\s+("[^"]+"|'[^']+'|[^\s"']+)/.exec(cmd)
  const cd = /^\s*cd\s+("[^"]+"|'[^']+'|[^\s;&"']+)\s*(?:&&|;)/.exec(cmd)
  const raw = c?.[1] ?? cd?.[1]

  if (!raw) return undefined

  const dir = unquote(raw)

  return dir.startsWith('~/') && home ? `${home}${dir.slice(1)}` : dir
}

export interface PushContext {
  /** the branch checked out in the repository the push runs in */
  branch?: string
  /** `git remote -v`: the push URL of every remote */
  remotes: { name: string; url: string }[]
  /** the commits not yet on the upstream (one line each); null when no upstream is set so they cannot be counted */
  commits: string[] | null
}

// push options that take the next word as their value (so it is not read as the remote or a refspec)
const PUSH_ARG_OPTS = new Set(['-o', '--push-option', '--repo', '--receive-pack', '--exec'])

/** What a `git push` will do, in plain words: what goes where, and how much it can hurt. */
export function pushSummary(command: string, ctx: PushContext): string {
  const parsed = pushArgs(command)
  const words = parsed?.words ?? []
  const flags = new Set<string>()
  const positional: string[] = []

  for (let i = 0; i < words.length; i++) {
    const w = words[i]!

    if (w.startsWith('-')) {
      flags.add(w.replace(/=.*$/, ''))
      if (PUSH_ARG_OPTS.has(w)) i++
    } else positional.push(w)
  }

  const known = ctx.remotes.find(r => r.name === positional[0])
  const asUrl = positional[0] && !known && /[/:@]/.test(positional[0]) ? positional[0] : undefined
  const remote = known ?? (asUrl ? { name: asUrl, url: '' } : positional[0] ? { name: positional[0], url: '' } : ctx.remotes.find(r => r.name === 'origin') ?? ctx.remotes[0])
  const refs = positional.slice(remote && positional[0] ? 1 : 0)
  const where = remote ? `remote ${remote.name}${remote.url && remote.url !== remote.name ? ` (${remote.url})` : ''}` : 'remote'
  const target = refs.length ? refs.join(', ') : `гілку ${ctx.branch || '?'}`
  const deleted = flags.has('--delete') || flags.has('-d') ? refs : refs.filter(r => r.startsWith(':')).map(r => r.slice(1))
  const count = ctx.commits?.length ?? 0
  const sent =
    ctx.commits === null
      ? 'upstream не задано, кількість комітів невідома'
      : count === 0
        ? 'нових комітів немає, на сервері майже нічого не зміниться'
        : `нових комітів: ${count}`

  if (flags.has('--dry-run') || flags.has('-n')) return `Пробний запуск (--dry-run): покаже, що було б відправлено в ${where}, але нічого не відправить і нічого не змінить.`
  if (deleted.length) return `ВИДАЛИТЬ ${deleted.join(', ')} у ${where}: гілка зникне на сервері.`
  if (flags.has('--mirror')) return `ПЕРЕЗАПИШЕ усі refs у ${where} дзеркально: те, чого немає локально, буде видалено на сервері.`
  if (flags.has('--force-with-lease') || flags.has('--force-if-includes')) return `Примусово оновить ${target} у ${where}, але лише якщо на сервері немає чужих нових комітів (--force-with-lease).`
  if (flags.has('--force') || flags.has('-f') || refs.some(r => r.startsWith('+'))) return `ПРИМУСОВО (force) перезапише ${target} у ${where}: коміти на сервері, яких немає локально, буде втрачено.`
  if (flags.has('--all')) return `Відправить усі локальні гілки в ${where} (${sent}).`
  if (flags.has('--tags')) return `Відправить усі локальні теги в ${where}.`

  const upstream = flags.has('-u') || flags.has('--set-upstream') ? ' і запам\'ятає її як основну (-u)' : ''

  return `Відправить ${target} з локальної теки в ${where} (${sent})${upstream}.${ctx.commits === null || count > 0 ? " Зміни одразу з'являться на сервері." : ''}`
}

/** What a `wrangler ... --remote` command will do, in plain words: it works on the live database, not the local one. */
export function remoteDbSummary(command: string): string {
  const db = /\bd1\s+execute\s+(?:--\S+\s+)*([\w-]+)/.exec(command)?.[1]
  const sql = /--command[= ]\s*(?:"([^"]*)"|'([^']*)'|(\S+))/.exec(command)
  const text = (sql?.[1] ?? sql?.[2] ?? sql?.[3] ?? '').trim()
  const verb = /^\s*(\w+)/.exec(text)?.[1]?.toUpperCase()
  const effect = !verb
    ? 'виконає команду'
    : /^(SELECT|PRAGMA|EXPLAIN|WITH)$/.test(verb)
      ? 'лише читає дані'
      : /^(DROP|ALTER|CREATE|TRUNCATE)$/.test(verb)
        ? 'ЗМІНЮЄ структуру бази'
        : /^(INSERT|UPDATE|DELETE|REPLACE)$/.test(verb)
          ? 'ЗМІНЮЄ дані'
          : 'виконає запит'

  if (db) return `Виконає запит у БОЙОВІЙ базі ${db} (Cloudflare D1, не локальній): ${effect}. Зміни одразу бачать усі користувачі.`

  return 'Виконає команду wrangler проти бойового середовища Cloudflare (--remote), а не локального: зміни одразу побачать усі.'
}
