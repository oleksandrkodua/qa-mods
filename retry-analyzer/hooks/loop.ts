export const SAME_CALL = 3
export const SAME_ERROR = 4

/** Stable key of a call: tool plus its arguments, minus the per-call ids and the free-text `description` (it changes between identical retries). */
export function signature(e: Record<string, unknown>): string {
  const rest = Object.fromEntries(Object.entries(e).filter(([k]) => k !== 'tool_use_id' && k !== 'agentId' && k !== 'description'))

  return JSON.stringify(rest).replace(/\s+/g, ' ').slice(0, 400)
}

export const errorKey = (tool: string, text: unknown) =>
  `${tool}|${String(text ?? '').replace(/\d+/g, '#').replace(/\s+/g, ' ').slice(0, 80)}`

export class Streaks {
  private calls = new Map<string, number>()
  private errors = new Map<string, number>()

  /** Record one outcome; returns the count that tripped a threshold, or 0. */
  record(sig: string, err: string, failed: boolean): { count: number; why: 'call' | 'error' } | null {
    if (!failed) {
      this.calls.delete(sig)
      return null
    }

    const c = (this.calls.get(sig) ?? 0) + 1
    const x = (this.errors.get(err) ?? 0) + 1

    this.calls.set(sig, c)
    this.errors.set(err, x)

    if (c >= SAME_CALL) return { count: c, why: 'call' }
    if (x >= SAME_ERROR) return { count: x, why: 'error' }

    return null
  }

  reset() {
    this.calls.clear()
    this.errors.clear()
  }
}

export const nudge = (hit: { count: number; why: 'call' | 'error' }) =>
  `retry-analyzer: ${
    hit.why === 'call' ? `this exact call has now failed ${hit.count} times in a row` : `the same error has now appeared ${hit.count} times`
  }. Stop repeating it: re-read the error, change the approach (different command or inputs, or investigate the cause first), and tell the user in one line what you are changing.`
