/** What a deletion touches, read from disk and git (read-only). */
export interface Facts {
  count: number
  /** how many of them git tracks */
  tracked: number
  /** tracked files with uncommitted changes (staged or not) */
  dirty: number
  /** files git does not track and does not ignore (not counting temp files): nothing can bring them back */
  untracked: number
  /** a target is the home folder (or something above it) */
  isHome: boolean
}

export type Level = 'dialog' | 'medium' | 'low'

/** Where the line is: a dialog only for work that cannot come back from git. */
export const MANY = 20

export function parseFacts(stdout: string): Pick<Facts, 'count' | 'tracked' | 'dirty' | 'untracked'> {
  const num = (key: string) => Number(new RegExp(`^${key} (\\d+)`, 'm').exec(stdout)?.[1] ?? 0)

  return { count: num('COUNT'), tracked: num('TRACKED'), dirty: num('DIRTY'), untracked: num('UNTRACKED') }
}

/** `~`, `$HOME`, `~/*`, `/Users/me/`, `/Users`, `/`: deleting this is deleting a life. */
export function isHomeTarget(target: string, home: string): boolean {
  const t = target
    .replaceAll('$HOME', home)
    .replace(/^~(?=\/|$)/, home)
    .replace(/\/(\.\*|\*|\.)?$/, '')
    .replace(/\/+$/, '')

  if (t === '' || t === home.replace(/\/+$/, '')) return true

  const parent = home.replace(/\/[^/]*\/?$/, '')

  return t === parent
}

export function levelOf(hard: boolean, facts: Facts): Level {
  if (hard || facts.dirty > 0 || facts.untracked > 0 || facts.isHome || facts.count > MANY) return 'dialog'

  return facts.tracked > 0 ? 'medium' : 'low'
}

/** 1 файл, 2 файли, 5 файлів */
export function plural(n: number, forms: [string, string, string]): string {
  const m10 = n % 10
  const m100 = n % 100
  const form = m10 === 1 && m100 !== 11 ? forms[0] : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? forms[1] : forms[2]

  return `${n} ${form}`
}

const short = (s: string, max: number) => {
  const t = s.replace(/\s+/g, ' ').trim()

  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

/** The state of the files in a few words, for the dialog and the line in the chat. */
export function stateWords(f: Facts): string {
  const parts: string[] = []

  if (f.isHome) parts.push('це домашня папка')
  if (f.dirty > 0) parts.push(`незакомічених змін: ${f.dirty}`)
  if (f.untracked > 0) parts.push(`${plural(f.untracked, ['файл', 'файли', 'файлів'])} без git-копії, не відновити`)
  if (f.count > MANY) parts.push('багато файлів')
  if (parts.length === 0) parts.push(f.tracked > 0 ? 'усі в git, без змін' : 'поза git')

  return parts.join(', ')
}

export const deleteTitle = (f: Facts) => `Видалення ${plural(f.count, ['файлу', 'файлів', 'файлів'])}`

/** One short question: what, how many, in what state, and the risky command only. */
export function deleteQuestion(f: Facts, segment: string): string {
  return `${deleteTitle(f)} (${stateWords(f)}). Команда: ${short(segment, 120)}. Виконати?`
}

const REASONS: Record<string, string> = {
  'runs with sudo': 'запуск із sudo',
  'pipes a download into a shell': 'завантаження передається прямо в shell',
  'git reset --hard discards uncommitted changes': 'git reset --hard відкидає незакомічені зміни',
  'git clean deletes untracked files': 'git clean видаляє файли, яких немає в git',
  'git branch -D deletes a branch even if unmerged': 'git branch -D видаляє гілку, навіть незлиту',
  'find -delete deletes every matching file': 'find -delete видалить кожен знайдений файл',
  'find -exec runs a command on every match': 'find -exec запустить команду для кожного знайденого файлу',
}

const findExecUk = (r: string) => {
  const cmd = /^find -exec (\S+) runs it on every match$/.exec(r)?.[1]

  return cmd ? `find -exec запустить ${cmd} для кожного знайденого файлу` : undefined
}

export const reasonUk = (r: string) =>
  REASONS[r] ??
  findExecUk(r) ??
  (/^git (checkout|restore) overwrites/.test(r) ? 'git перезаписує файли робочої копії' : /changes permissions\/ownership recursively/.test(r) ? 'рекурсивна зміна прав або власника' : /can destroy data/.test(r) ? 'може знищити дані на рівні диска або файлу' : r)

const EXEC_ACTIONS: Record<string, string> = {
  rm: 'видалить усе знайдене',
  mv: 'перемістить усе знайдене',
  chmod: 'змінить права для всього знайденого',
  chown: 'змінить власника для всього знайденого',
}

/** What a risky `find` will do, in plain words: where it looks, for what, and what it then does to every match. */
export function findSummary(args: string[]): string {
  const value = (flag: string) => args.flatMap((w, k) => (w === flag && args[k + 1] ? [args[k + 1]!] : []))
  const root = args[0] && !/^[-(!]/.test(args[0]) ? args[0] : '.'
  const type = value('-type')[0]
  const names = [...value('-name'), ...value('-iname')].map(n => `«${n}»`)
  const depth = Number(value('-maxdepth')[0])
  const age = /^\+(\d+)$/.exec(value('-mtime')[0] ?? '')?.[1]
  const what = type === 'f' ? 'файли' : type === 'd' ? 'папки' : 'елементи'
  const where = root === '.' ? 'у поточній папці' : `у ${root}`
  const how = Number.isInteger(depth) && depth > 0 ? (depth === 1 ? 'лише на першому рівні, без вкладених папок' : `не глибше ${depth} рівнів`) : 'разом з усіма вкладеними папками'
  const acts: string[] = []

  if (args.includes('-delete')) acts.push('видалить усе знайдене')

  args.forEach((w, k) => {
    if (!['-exec', '-execdir', '-ok', '-okdir'].includes(w)) return

    const cmd = (args[k + 1] ?? '').replace(/^.*\//, '')

    acts.push(EXEC_ACTIONS[cmd] ?? (cmd ? `запустить ${cmd} для всього знайденого` : 'запустить команду для всього знайденого'))
  })

  const filter = `${names.length ? ` з іменем ${names.join(' або ')}` : ''}${age ? `, старіші за ${age} дн.` : ''}`

  return `Шукає ${what}${filter} ${where}, ${how}, і ${[...new Set(acts)].join(' і ')}`
}

/** What dd / git reset --hard / chmod -R / sudo will do, in plain words (sudo adds that it runs as root). */
export function opSummary(op: { sudo: boolean; words: string[] }): string {
  const [bin = '', ...args] = op.words
  const sub = args.find(w => !w.startsWith('-'))
  const operands = args.filter(w => !w.startsWith('-'))
  const root = op.sudo ? ' Працює з правами адміністратора (root), обмежень доступу немає.' : ''
  let text: string

  if (bin === 'dd') {
    const val = (k: string) => args.find(w => w.startsWith(`${k}=`))?.slice(k.length + 1)

    text = `Копіює дані з ${val('if') ?? 'stdin'} у ${val('of') ?? 'stdout'} блок за блоком${val('of') ? ' і перезапише все, що там було (файл або диск), без запиту' : ''}`
  } else if (bin === 'git' && args.includes('reset')) {
    const ref = args.slice(args.indexOf('reset') + 1).find(w => !w.startsWith('-'))

    text = `Скине всі файли робочої копії до стану ${ref ?? 'останнього коміту (HEAD)'}: усі незакомічені зміни пропадуть, повернути їх не вийде`
  } else if (bin === 'chmod' || bin === 'chown' || bin === 'chgrp') {
    const what = bin === 'chmod' ? 'права доступу' : bin === 'chown' ? 'власника' : 'групу'
    const targets = operands.slice(1).join(', ') || '(не вказано)'

    text = `Змінить ${what} на «${operands[0] ?? '?'}» для ${targets} і для всього, що лежить всередині`
  } else {
    text = `Запустить «${short([bin, ...args].join(' '), 60)}»`
  }

  return `${text}.${root}`.replace(/\.\./g, '.')
}

export function hardQuestion(reasons: string[], segment: string, finds: string[][] = [], ops: { sudo: boolean; words: string[] }[] = []): string {
  const what = [...finds.map(findSummary), ...ops.map(opSummary)].join('; ').replace(/\.(; |$)/g, '$1')

  return `Ризик: ${reasons.map(reasonUk).join('; ')}. ${what ? `Що зробить: ${what}. ` : ''}Команда: ${short(segment, 120)}. Виконати?`
}

export const CHOICES = ['Виконати', 'Скасувати'] as const

/** What the answer means: run, cancel, or the user's own decision typed under Other. */
export function readAnswer(answer: unknown): { kind: 'run' } | { kind: 'cancel' } | { kind: 'custom'; text: string } {
  const text = String(answer ?? '').trim()

  if (text === CHOICES[0]) return { kind: 'run' }
  if (text === '' || text === CHOICES[1]) return { kind: 'cancel' }

  return { kind: 'custom', text }
}
