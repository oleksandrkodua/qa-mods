import assert from 'node:assert/strict'
import { test } from 'node:test'

import { HANDOFF_PROMPT, hintLevel, hintLine } from '../hooks/logic.ts'

test('hintLevel: nothing below the threshold, then one level per 5 points', () => {
  assert.equal(hintLevel(79, 80), 0)
  assert.equal(hintLevel(80, 80), 1)
  assert.equal(hintLevel(84, 80), 1)
  assert.equal(hintLevel(85, 80), 2)
  assert.equal(hintLevel(96, 80), 4)
  assert.equal(hintLevel(60, 50), 3)
})

test('the prompt is the active-memory handoff command', () => {
  assert.equal(HANDOFF_PROMPT, '/active-memory:amhandoff')
})

test('the hint names the percent and the command', () => {
  assert.match(hintLine(83), /83%/)
  assert.match(hintLine(83), /\/handoff/)
  assert.match(hintLine(83), /amhandoff/)
})
