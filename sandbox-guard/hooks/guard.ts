export const PROTECTED = [
  '~/.claude/settings',
  '~/.claude/projects/',
  '~/.claude/skills/',
  '~/.claude/plugins/',
  '~/.claude/hooks/',
  '~/.local/',
  '/opt/homebrew',
  '~/Library/Application Support/Claude/',
]

const WRITEISH = /((?<![=>&-])>(?![=&])|\btee\b|\bsed\s+-i|\bcp\b|\bmv\b|\brm\b|\bmkdir\b|\btouch\b|\bchmod\b|\bln\b|\bnpm\s+(i|install)\b|\bbrew\s+install\b|\bpip3?\s+install\b)/

function expand(p: string, home: string) {
  return p.startsWith('~/') ? home + p.slice(1) : p
}

export function protectedHit(text: string, home: string): string | null {
  const t = text.replaceAll('$HOME', home).replaceAll('~', home)

  for (const p of PROTECTED) {
    if (t.includes(expand(p, home))) return p
  }

  return null
}

export function checkPath(path: string, home: string) {
  return protectedHit(path, home)
}

/** Drop heredoc bodies (documents/code fed to another program) unless a shell reads them. */
export function stripHeredocs(cmd: string): string {
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

const maskQuotes = (s: string) => s.replace(/'[^']*'|"(?:[^"\\]|\\.)*"/g, '""')

const words = (seg: string) => [...seg.matchAll(/"((?:[^"\\]|\\.)*)"|'([^']*)'|(\S+)/g)].map(m => m[1] ?? m[2] ?? m[3] ?? '')

const COPY = new Set(['cp', 'mv', 'ln', 'install', 'rsync'])
const EVERY = new Set(['rm', 'rmdir', 'unlink', 'shred', 'mkdir', 'touch', 'chmod', 'chown', 'tee', 'truncate'])

/** The words a write verb in this segment writes to: the last argument of cp/mv/ln, every argument of rm/mkdir/tee, files of sed -i, redirect targets. */
function writeTargets(seg: string): string[] {
  const out = [...seg.matchAll(/(?<![=>&-])>>?(?![=&])\s*("[^"]*"|'[^']*'|\S+)/g)].map(m => m[1]!.replace(/^["']|["']$/g, ''))
  const w = words(seg)

  w.forEach((word, i) => {
    const rest = w.slice(i + 1)
    const args = rest.filter(x => !x.startsWith('-'))

    if (COPY.has(word)) {
      const dir = rest.findIndex(x => x === '-t')
      const long = rest.find(x => x.startsWith('--target-directory='))

      if (dir >= 0 && rest[dir + 1]) out.push(rest[dir + 1]!)
      else if (long) out.push(long.slice('--target-directory='.length))
      else if (args.length > 0) out.push(args[args.length - 1]!)
    } else if (EVERY.has(word)) out.push(...args)
    else if (word === 'sed' && rest.some(x => /^-\w*i/.test(x))) out.push(...args)
  })

  return out
}

export function checkCommand(raw: string, home: string) {
  // judge each shell segment alone: `cp a b && ls ~/.claude/projects` is a write and a read, not a write there
  for (const seg of stripHeredocs(raw).split(/\n|;|&&|\|\||\|/)) {
    const masked = maskQuotes(seg)

    // the write verb must be real shell, not text inside a quoted string; the path itself may be quoted
    if (!WRITEISH.test(masked)) continue

    // installers write somewhere we cannot name: any mention of a protected path counts
    if (/\b(npm\s+(i|install)|brew\s+install|pip3?\s+install)\b/.test(masked)) {
      const hit = protectedHit(seg, home)

      if (hit) return hit
    }

    // other verbs: only a protected path that is written to counts; a source of cp/mv or an argument of cat is only read
    for (const target of writeTargets(seg)) {
      const hit = protectedHit(target, home)

      if (hit) return hit
    }
  }

  return null
}

export const denyText = (hit: string, what: string) =>
  `sandbox-guard: BLOCKED — ${what} touches ${hit}, which this environment cannot write. Do not try to work around it. ` +
  `Tell the user what was blocked, give them one ready-to-run command for their own Terminal, and ask them to send back the output.`
