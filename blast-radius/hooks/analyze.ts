export type Risk = 'none' | 'medium' | 'high'

export interface Analysis {
  risk: Risk
  reasons: string[]
  /** path arguments worth expanding (may contain globs) */
  paths: string[]
  /** true when the command acts on the git working tree */
  git: boolean
  /** the first segment that raised the risk (what the dialog shows instead of the whole command line) */
  segment: string
  /** true when something other than plain file deletion is high risk (sudo, dd, git reset --hard ...): always asked */
  hard: boolean
  /** every rm / unlink / shred: where it runs and what it names, so the mod can look at git state and counts */
  deletes: { cwd: string; targets: string[]; recursive: boolean }[]
  /** where each git command works (after `cd dir &&` and `git -C dir`), so git state is read in that repo, not the session's */
  gitDirs: string[]
}

/** Split a command line into words, honouring single and double quotes. */
export function words(cmd: string): string[] {
  const out: string[] = []
  let cur = ''
  let q: string | null = null
  let has = false

  for (const ch of cmd) {
    if (q) {
      if (ch === q) q = null
      else cur += ch
    } else if (ch === "'" || ch === '"') {
      q = ch
      has = true
    } else if (/\s/.test(ch)) {
      if (has || cur) out.push(cur)
      cur = ''
      has = false
    } else {
      cur += ch
      has = true
    }
  }

  if (has || cur) out.push(cur)

  return out
}

/** Split on ; && || | and newlines (outside quotes, roughly). */
export function segments(cmd: string): string[] {
  return cmd
    .split(/\n|;|&&|\|\||\|/)
    .map(s => s.trim())
    .filter(Boolean)
}

/** Drop heredoc bodies (`<<EOF ... EOF`): they are data/code for another program, not shell. */
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
      keep = /\b(ba|z|da|)sh\s*(-\w+\s*)*(-\s*)?<</.test(line) // a shell reads this body: it is real commands
    }
  }

  return out.join('\n')
}

/** Empty out quoted strings so operators inside them (`"a > b"`, `=>`) are not read as shell. */
const maskQuotes = (s: string) => s.replace(/'[^']*'|"(?:[^"\\]|\\.)*"/g, '""')

const RANK: Record<Risk, number> = { none: 0, medium: 1, high: 2 }

function bump(a: Analysis, risk: Risk, reason: string, seg = '', isDelete = false) {
  if (RANK[risk] > RANK[a.risk]) {
    a.risk = risk
    a.segment = seg
  }

  if (risk === 'high' && !isDelete) a.hard = true
  if (!a.reasons.includes(reason)) a.reasons.push(reason)
}

const hasFlag = (args: string[], short: string, long?: string) =>
  args.some(
    w =>
      (/^-[a-zA-Z]+$/.test(w) && w.slice(1).includes(short)) ||
      (long !== undefined && w === long),
  )

const operands = (args: string[]) => args.filter(w => !w.startsWith('-'))

export function analyze(raw: string): Analysis {
  const cmd = stripHeredocs(raw)
  const a: Analysis = { risk: 'none', reasons: [], paths: [], git: false, segment: '', hard: false, deletes: [], gitDirs: [] }
  // `cd dir && rm x`: relative paths belong to the directory the last cd moved to
  let cwd = ''
  const at = (p: string) => (cwd && !/^([/~]|\$)/.test(p) ? `${cwd.replace(/\/$/, '')}/${p}` : p)
  const push = (...p: string[]) => a.paths.push(...p.map(at))

  if (/\b(curl|wget)\b[^|]*\|\s*(sudo\s+)?(ba|z|)sh\b/.test(cmd)) {
    bump(a, 'high', 'pipes a download into a shell', cmd)
  }

  for (const seg of segments(cmd)) {
    let w = words(seg.replace(/^\(+\s*/, ''))

    while (w[0] && (/^\w+=/.test(w[0]) || w[0] === 'env')) w = w.slice(1)

    let bin = w[0]
    let args = w.slice(1)

    if (bin === 'sudo') {
      bump(a, 'high', 'runs with sudo', seg)
      bin = args[0]
      args = args.slice(1)
    }

    if (!bin) continue

    if (bin === 'cd' && args[0] && !args[0].startsWith('-')) {
      cwd = at(args[0])
      continue
    }

    switch (bin) {
      case 'rm':
      case 'rmdir':
      case 'unlink':
      case 'shred': {
        const recursive = hasFlag(args, 'r', '--recursive') || hasFlag(args, 'R')
        const force = hasFlag(args, 'f', '--force')

        // rm has no trash: every deletion is permanent, so only rmdir (empty dirs) stays medium
        bump(
          a,
          bin === 'rmdir' ? 'medium' : 'high',
          `deletes files permanently${recursive ? ', recursively' : ''}${force ? ', without prompts' : ''}`,
          seg,
          true,
        )

        push(...operands(args))
        a.deletes.push({ cwd, targets: operands(args), recursive })
        break
      }
      case 'mv':
      case 'cp': {
        bump(a, 'medium', `${bin} can overwrite existing files`, seg)
        push(...operands(args).slice(-1))
        break
      }
      case 'chmod':
      case 'chown':
      case 'chgrp': {
        const rec = hasFlag(args, 'R', '--recursive')

        bump(a, rec ? 'high' : 'medium', `${bin} changes permissions/ownership${rec ? ' recursively' : ''}`, seg)
        push(...operands(args).slice(1))
        break
      }
      case 'dd':
      case 'mkfs':
      case 'diskutil':
      case 'truncate': {
        bump(a, 'high', `${bin} can destroy data at block/file level`, seg)
        break
      }
      case 'find': {
        if (args.includes('-delete') || args.includes('-exec')) {
          bump(a, 'high', 'find with -delete/-exec acts on every match', seg)
          push(args[0] && !args[0].startsWith('-') ? args[0] : '.')
        }

        break
      }
      case 'sed':
      case 'perl': {
        if (hasFlag(args, 'i')) {
          bump(a, 'medium', `${bin} -i edits files in place`, seg)

          // the script is the first operand unless -e/-f give it; the BSD `-i ''` suffix is an empty word
          const files: string[] = []
          let hasScript = false

          for (let k = 0; k < args.length; k++) {
            const w = args[k]!

            if (w === '-e' || w === '-f' || w.startsWith('--expression') || w.startsWith('--file')) {
              hasScript = true
              if (!w.includes('=')) k++
            } else if (!w.startsWith('-') && w !== '') files.push(w)
          }

          push(...(hasScript ? files : files.slice(1)))
        }

        break
      }
      case 'git': {
        // git's own options come before the subcommand: `git -C dir reset --hard`, `git -c k=v clean -fd`
        let at = 0
        let gdir = cwd

        while (at < args.length && args[at]!.startsWith('-')) {
          if (args[at] === '-C' && args[at + 1] !== undefined) {
            const p = args[at + 1]!

            gdir = /^([/~]|\$)/.test(p) || !gdir ? p : `${gdir.replace(/\/$/, '')}/${p}`
          }

          at += ['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path'].includes(args[at]!) ? 2 : 1
        }

        const sub = args[at]
        const rest = args.slice(at + 1)

        if (sub === 'reset' && rest.includes('--hard')) {
          bump(a, 'high', 'git reset --hard discards uncommitted changes', seg)
          { a.git = true; a.gitDirs.push(gdir) }
        } else if (sub === 'clean' && (hasFlag(rest, 'f', '--force') || rest.includes('-fd'))) {
          bump(a, 'high', 'git clean deletes untracked files', seg)
          { a.git = true; a.gitDirs.push(gdir) }
        } else if (
          (sub === 'checkout' && (rest.includes('--') || rest.includes('.'))) ||
          (sub === 'restore' && !rest.includes('--staged'))
        ) {
          bump(a, 'high', `git ${sub} overwrites working-tree files`, seg)
          { a.git = true; a.gitDirs.push(gdir) }
        // git push: the remote-gate mod asks (remote, branch, outgoing commits); one dialog per push
        } else if (sub === 'branch' && rest.includes('-D')) {
          bump(a, 'high', 'git branch -D deletes a branch even if unmerged', seg)
        } else if (sub === 'stash' && (rest[0] === 'drop' || rest[0] === 'clear')) {
          bump(a, 'medium', 'drops stashed work', seg)
        }

        break
      }
    }
  }

  // truncating redirect to a file: `> file` (but not >&2, >>, 2>/dev/null)
  // (not `=>`, `->`, `>=`, and nothing inside quotes or heredoc bodies)
  const redirect = /(^|[^>&\d=-])>(?!=)\s*([^\s>&|;"']+)/.exec(maskQuotes(cmd))

  if (redirect && !redirect[2]!.startsWith('/dev/')) {
    bump(a, 'medium', `redirect truncates ${redirect[2]}`, cmd)
    push(redirect[2]!)
  }

  // `(cd x && rm y)`: the closing bracket of the subshell is not part of the file name (a name like `a (1)` keeps its own pair)
  const unwrap = (x: string) => (x.split(')').length > x.split('(').length ? x.replace(/\)+$/, '') : x)

  a.paths = [...new Set(a.paths.map(unwrap))]

  return a
}
