import assert from 'node:assert/strict'
import { test } from 'node:test'

import { detectClaims } from '../hooks/claims.ts'
import { assess, classify } from '../hooks/ledger.ts'

const kinds = t => detectClaims(t).map(c => c.kind).sort()

test('detects claims in English, Russian, Ukrainian', () => {
  assert.deepEqual(kinds('All tests pass now.'), ['tests'])
  assert.deepEqual(kinds('I verified the fix.'), ['verified'])
  assert.deepEqual(kinds('The endpoint returns 200.'), ['api'])
  assert.deepEqual(kinds('No regressions found.'), ['safe'])
  assert.deepEqual(kinds('Все тесты теперь проходят.'), ['tests'])
  assert.deepEqual(kinds('Я перевірив зміни, готово.'), ['done', 'verified'])
})

test('negated, conditional and code-block sentences are not claims', () => {
  assert.deepEqual(kinds('I have not verified this yet.'), [])
  assert.deepEqual(kinds('Tests should pass once you rebuild.'), [])
  assert.deepEqual(kinds('Я не проверил это.'), [])
  assert.deepEqual(kinds('Run:\n```\nnpm test # all tests pass\n```'), [])
  assert.deepEqual(kinds('This is unverified.'), [])
})

test('classify', () => {
  assert.equal(classify('Edit', { file_path: 'a.ts' }).kind, 'edit')
  assert.equal(classify('Bash', { command: 'npm test -- --watch=false' }).kind, 'test')
  assert.equal(classify('Bash', { command: 'cd x && pytest -q' }).kind, 'test')
  assert.equal(classify('Bash', { command: 'curl -s localhost:3000/health' }).kind, 'http')
  assert.equal(classify('Bash', { command: 'ls -la' }).kind, 'other')
  assert.equal(classify('Bash', { command: 'node build.js' }).kind, 'run')
  assert.equal(classify('mcp__browser__screenshot', {}).kind, 'browser')
})

const E = (n, turn, kind, ok = true) => ({ n, turn, tool: 't', kind, label: kind, ok })

test('tests claim needs a passing run AFTER the last edit', () => {
  const claims = detectClaims('All tests pass.')
  assert.equal(assess(claims, [E(1, 1, 'test'), E(2, 1, 'edit')], 1).status, 'UNVERIFIED')
  assert.equal(assess(claims, [E(1, 1, 'edit'), E(2, 1, 'test', false)], 1).status, 'UNVERIFIED')
  assert.equal(assess(claims, [E(1, 1, 'edit'), E(2, 1, 'test')], 1).status, 'VERIFIED')
})

test('done is only judged when files were edited this turn', () => {
  const claims = detectClaims('Готово.')
  assert.equal(assess(claims, [], 1).rows.length, 0)
  assert.equal(assess(claims, [E(1, 1, 'edit')], 1).status, 'UNVERIFIED')
  assert.equal(assess(claims, [E(1, 1, 'edit'), E(2, 1, 'run')], 1).status, 'VERIFIED')
})

test('partial status and counts', () => {
  const claims = detectClaims('I verified it. All tests pass.')
  const a = assess(claims, [E(1, 1, 'read')], 1)
  assert.equal(a.status, 'PARTIALLY VERIFIED')
  assert.equal(a.supported, 1)
})
