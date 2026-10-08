import assert from 'node:assert/strict'
import { test } from 'node:test'

import { errorKey, signature, Streaks } from '../hooks/loop.ts'

test('signature ignores ids but not arguments', () => {
  const a = signature({ tool: 'Bash', command: 'npm test', tool_use_id: '1' })
  assert.equal(a, signature({ tool: 'Bash', command: 'npm test', tool_use_id: '2', agentId: 'x' }))
  assert.notEqual(a, signature({ tool: 'Bash', command: 'npm run build' }))
})

test('3 identical failures trip, success resets', () => {
  const s = new Streaks()
  assert.equal(s.record('a', 'e1', true), null)
  assert.equal(s.record('a', 'e2', true), null)
  assert.deepEqual(s.record('a', 'e3', true), { count: 3, why: 'call' })
  s.record('a', 'e4', false)
  assert.equal(s.record('a', 'e5', true), null)
})

test('4 different calls with the same error trip', () => {
  const s = new Streaks()
  const err = errorKey('Bash', 'ENOENT: no such file /tmp/x1')
  assert.equal(err, errorKey('Bash', 'ENOENT: no such file /tmp/x22'))
  for (const sig of ['a', 'b', 'c']) assert.equal(s.record(sig, err, true), null)
  assert.deepEqual(s.record('d', err, true), { count: 4, why: 'error' })
})

test('reset clears everything', () => {
  const s = new Streaks()
  s.record('a', 'e', true)
  s.record('a', 'e', true)
  s.reset()
  assert.equal(s.record('a', 'e', true), null)
})

test('a changed free-text description does not make a retry look like a new call', () => {
  const a = signature({ tool: 'Bash', command: 'ls /nope', description: 'Failing command, attempt 1' })

  assert.equal(a, signature({ tool: 'Bash', command: 'ls /nope', description: 'Failing command, attempt 2' }))
  assert.notEqual(a, signature({ tool: 'Bash', command: 'ls /other', description: 'Failing command, attempt 1' }))
})
