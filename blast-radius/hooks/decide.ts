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
  'find with -delete/-exec acts on every match': 'find з -delete/-exec зачіпає кожен збіг',
}

export const reasonUk = (r: string) =>
  REASONS[r] ?? (/^git (checkout|restore) overwrites/.test(r) ? 'git перезаписує файли робочої копії' : /changes permissions\/ownership recursively/.test(r) ? 'рекурсивна зміна прав або власника' : /can destroy data/.test(r) ? 'може знищити дані на рівні диска або файлу' : r)

export function hardQuestion(reasons: string[], segment: string): string {
  return `Ризик: ${reasons.map(reasonUk).join('; ')}. Команда: ${short(segment, 120)}. Виконати?`
}

export const CHOICES = ['Виконати', 'Скасувати'] as const

/** What the answer means: run, cancel, or the user's own decision typed under Other. */
export function readAnswer(answer: unknown): { kind: 'run' } | { kind: 'cancel' } | { kind: 'custom'; text: string } {
  const text = String(answer ?? '').trim()

  if (text === CHOICES[0]) return { kind: 'run' }
  if (text === '' || text === CHOICES[1]) return { kind: 'cancel' }

  return { kind: 'custom', text }
}
