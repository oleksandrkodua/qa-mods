const MAX_LINES = 1500

type Op = { t: ' ' | '+' | '-'; s: string }

const lines = (s: string) => (s === '' ? [] : s.split('\n'))

/** Unified diff with real `@@ -a,b +c,d @@` headers (LCS-based), for Code format="diff". */
export function unifiedDiff(before: string, after: string, context = 3): string {
  const a = lines(before)
  const b = lines(after)

  if (a.length > MAX_LINES || b.length > MAX_LINES) {
    return `@@ -1 +1 @@\n-${a.length} lines\n+${b.length} lines (too large for a line diff)`
  }

  const n = a.length
  const m = b.length
  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))

  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!)

  const ops: Op[] = []
  let i = 0
  let j = 0

  while (i < n && j < m) {
    if (a[i] === b[j]) ops.push({ t: ' ', s: a[i++]! }), j++
    else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) ops.push({ t: '-', s: a[i++]! })
    else ops.push({ t: '+', s: b[j++]! })
  }

  while (i < n) ops.push({ t: '-', s: a[i++]! })
  while (j < m) ops.push({ t: '+', s: b[j++]! })

  if (!ops.some(o => o.t !== ' ')) return '@@ -1 +1 @@\n (no textual change)'

  const keep = new Array<boolean>(ops.length).fill(false)

  ops.forEach((o, k) => {
    if (o.t !== ' ')
      for (let x = Math.max(0, k - context); x <= Math.min(ops.length - 1, k + context); x++) keep[x] = true
  })

  // old/new line number of each op's start
  const oldAt: number[] = []
  const newAt: number[] = []
  let o = 1
  let nn = 1

  ops.forEach((op, k) => {
    oldAt[k] = o
    newAt[k] = nn
    if (op.t !== '+') o++
    if (op.t !== '-') nn++
  })

  const out: string[] = []
  let k = 0

  while (k < ops.length) {
    if (!keep[k]) {
      k++
      continue
    }

    let end = k

    while (end < ops.length && keep[end]) end++

    const hunk = ops.slice(k, end)
    const oc = hunk.filter(x => x.t !== '+').length
    const nc = hunk.filter(x => x.t !== '-').length

    out.push(`@@ -${oc === 0 ? oldAt[k]! - 1 : oldAt[k]},${oc} +${nc === 0 ? newAt[k]! - 1 : newAt[k]},${nc} @@`)
    hunk.forEach(x => out.push(x.t + x.s))
    k = end
  }

  return out.join('\n')
}

export const stats = (d: string) => ({
  added: d.split('\n').filter(l => l.startsWith('+')).length,
  removed: d.split('\n').filter(l => l.startsWith('-')).length,
})
