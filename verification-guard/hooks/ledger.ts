import type { Claim, ClaimKind } from './claims'

export type EvKind = 'edit' | 'test' | 'http' | 'browser' | 'read' | 'run' | 'other'

export interface Entry {
  n: number
  turn: number
  tool: string
  kind: EvKind
  label: string
  ok: boolean
}

const TEST =
  /(^|[\s;&|(])((npm|pnpm|yarn|bun)\s+(run\s+)?(test|t|e2e|check)\b|(pytest|py\.test|jest|vitest|mocha|rspec|phpunit|tox)\b)|\b(go|cargo|dotnet|swift|mvn|gradlew?)\s+test\b|playwright\s+test|cypress\s+run|node\s+--test|python3?\s+-m\s+(pytest|unittest)|claude\s+plugin\s+test/

const HTTP = /(^|[\s;&|(])(curl|wget|http|https|xh|httpie)\s/
const TRIVIAL = /^\s*(ls|cat|pwd|echo|which|head|tail|wc|date|true|git\s+(status|diff|log|show|branch)|cd)\b/

const EDIT_TOOLS = ['Edit', 'Write', 'MultiEdit', 'NotebookEdit']
const READ_TOOLS = ['Read', 'Grep', 'Glob']

/** What kind of evidence one tool call is, from its name and arguments. */
export function classify(tool: string, args: { command?: unknown; file_path?: unknown }): { kind: EvKind; label: string } {
  if (EDIT_TOOLS.includes(tool)) return { kind: 'edit', label: String(args.file_path ?? '') }

  if (tool === 'Bash') {
    const cmd = String(args.command ?? '').replace(/\s+/g, ' ').trim()
    const label = cmd.length > 80 ? `${cmd.slice(0, 80)}…` : cmd

    if (TEST.test(cmd)) return { kind: 'test', label }
    if (HTTP.test(cmd)) return { kind: 'http', label }

    return { kind: TRIVIAL.test(cmd) ? 'other' : 'run', label }
  }

  if (READ_TOOLS.includes(tool)) return { kind: 'read', label: String(args.file_path ?? tool) }
  if (/screenshot|browser|playwright|computer|navigate|chrome/i.test(tool)) return { kind: 'browser', label: tool }

  return { kind: 'other', label: tool }
}

export interface Row {
  claim: Claim
  supported: boolean
  /** why it is unsupported, or what supports it */
  note: string
}

export interface Assessment {
  rows: Row[]
  supported: number
  status: 'VERIFIED' | 'PARTIALLY VERIFIED' | 'UNVERIFIED'
}

const WHY: Record<ClaimKind, string> = {
  tests: 'no passing test run after the last edit',
  api: 'no HTTP request or browser check after the last edit',
  verified: 'no successful check (test, request, read or command) in this turn',
  done: 'files were edited but nothing was run or tested afterwards',
  safe: 'no passing test run after the last edit',
}

/** Judge each claim against what actually ran. Evidence must be successful and, for fixes, come after the last edit. */
export function assess(claims: Claim[], ledger: readonly Entry[], turn: number): Assessment {
  const lastEdit = Math.max(0, ...ledger.filter(x => x.kind === 'edit').map(x => x.n))
  const after = ledger.filter(x => x.ok && x.n > lastEdit)
  const inTurn = ledger.filter(x => x.ok && x.turn === turn)
  const editedThisTurn = ledger.some(x => x.kind === 'edit' && x.turn === turn)
  const rows: Row[] = []

  for (const claim of claims) {
    let via: Entry | undefined

    switch (claim.kind) {
      case 'tests':
      case 'safe':
        via = after.find(x => x.kind === 'test')
        break
      case 'api':
        via = after.find(x => x.kind === 'http' || x.kind === 'browser')
        break
      case 'verified':
        via = inTurn.find(x => ['test', 'http', 'browser', 'read', 'run'].includes(x.kind))
        break
      case 'done':
        if (!editedThisTurn) continue // nothing was changed: "done" is not a code claim
        via = after.find(x => ['test', 'http', 'browser', 'run'].includes(x.kind))
        break
    }

    rows.push({ claim, supported: via !== undefined, note: via ? `${via.kind}: ${via.label}` : WHY[claim.kind] })
  }

  const supported = rows.filter(r => r.supported).length

  return {
    rows,
    supported,
    status: rows.length === 0 || supported === rows.length ? 'VERIFIED' : supported === 0 ? 'UNVERIFIED' : 'PARTIALLY VERIFIED',
  }
}

export function warning(a: Assessment): string {
  const bad = a.rows.filter(r => !r.supported)

  return (
    `\n\n⚠ verification-guard: ${a.status} (${a.supported}/${a.rows.length}) — ` +
    bad.map(r => `«${r.claim.quote}» → ${r.note}`).join('; ') +
    '. Run /evidence for the full list.'
  )
}
