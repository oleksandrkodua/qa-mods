import assert from 'node:assert/strict'
import { test } from 'node:test'

import { duration, oneLine } from '../hooks/format.ts'

test('duration', () => {
  assert.equal(duration(45), '45s')
  assert.equal(duration(72), '1m 12s')
  assert.equal(duration(125.4), '2m 05s')
  assert.equal(duration(3900), '1h 05m')
  assert.equal(duration(-3), '0s')
})

test('oneLine: single line, no quotes or backslashes, cut with an ellipsis', () => {
  assert.equal(oneLine('npm  run\nbuild "prod" \\x'), 'npm run build prod x')
  assert.equal(oneLine('a'.repeat(100), 10), 'aaaaaaaaa…')
})
