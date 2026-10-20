import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

// The Handoff button of the hud fills the box with its own copy of the prompt; it must stay equal to /handoff's.
const prompt = file => readFileSync(new URL(file, import.meta.url), 'utf8').match(/HANDOFF_PROMPT = `([^`]*)`/)?.[1]

test('the hud button and /handoff in the handoff mod use the same prompt text', () => {
  const fromHud = prompt('../hooks/register.tsx')

  assert.equal(fromHud, '/active-memory:amhandoff')
  assert.equal(fromHud, prompt('../../handoff/hooks/logic.ts'))
})
