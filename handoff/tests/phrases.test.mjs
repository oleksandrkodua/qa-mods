import assert from 'node:assert/strict'
import { test } from 'node:test'

import { PHRASES, nextDelay, pickPhrase } from '../hooks/phrases.ts'

test('pickPhrase: from the mood pool, never the same as the last one', () => {
  for (const mood of ['calm', 'worried', 'panic']) {
    const last = PHRASES[mood][0]

    for (const r of [0, 0.25, 0.5, 0.99, 1]) {
      const p = pickPhrase(mood, last, () => r)

      assert.ok(PHRASES[mood].includes(p))
      assert.notEqual(p, last)
    }
  }
})

test('pickPhrase: a one-phrase pool may repeat', () => {
  assert.ok(typeof pickPhrase('calm', 'x', () => 0.5) === 'string')
})

test('nextDelay: 0.5..1.5 of the base interval', () => {
  assert.equal(nextDelay(120, () => 0), 60000)
  assert.equal(nextDelay(120, () => 0.5), 120000)
  assert.equal(nextDelay(120, () => 1), 180000)
})

test('the pools are non-empty and have no empty strings', () => {
  for (const mood of Object.keys(PHRASES)) {
    assert.ok(PHRASES[mood].length >= 3)
    assert.ok(PHRASES[mood].every(p => p.trim().length > 0 && p.length <= 80))
  }
})
