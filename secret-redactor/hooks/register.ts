import type { Register } from 'claude-code'

import { redactDeep } from './redact'

const count = (v: unknown) => (JSON.stringify(v) ?? '').split('[REDACTED').length - 1

/**
 * Secret Redactor: masks secrets in every tool result before the model reads it.
 * A changed result is returned as the hook's own `{ result, context }` (no `ref`/`text`),
 * so the engine re-maps it for the model; `context` asks the model to tell the user.
 */
export const register: Register = on => {
  on('tool.call', async ($, e, next) => {
    const ran = await next(e)

    if (ran.deny !== undefined) return ran

    // A blocked call (e.g. a PreToolUse guard) carries its message as a string `result`; the engine
    // checks `result` against the tool's output shape (an object), so only redact object results.
    if (ran.isError === true) {
      const isObject = typeof ran.result === 'object' && ran.result !== null

      return { ...ran, result: isObject ? redactDeep(ran.result) : ran.result, text: redactDeep(ran.text) }
    }

    const result = redactDeep(ran.result)
    const masked = count(result) - count(ran.result)

    if (masked <= 0) return ran

    return {
      result,
      context: [
        ...(ran.context ?? []),
        `secret-redactor: ${masked} secret value(s) were masked as [REDACTED] in this tool output. Tell the user briefly.`,
      ],
    }
  })
}
