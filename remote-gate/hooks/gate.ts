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

export function classify(command: string): Kind | undefined {
  const cmd = maskQuotes(stripHeredocs(command))

  if (/\bgit\b[^|;&]*\bpush\b/.test(cmd)) {
    return /--force\b|--force-with-lease|--force-if-includes|(^|\s)-f(\s|$)|\+\S+:|\s\+\S+/.test(cmd) ? 'force-push' : 'push'
  }

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
