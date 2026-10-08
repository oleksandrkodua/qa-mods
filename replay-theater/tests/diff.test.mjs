import assert from 'node:assert/strict'
import { test } from 'node:test'

import { stats, unifiedDiff } from '../hooks/diff.ts'

test('single line change has a real hunk header', () => {
  const d = unifiedDiff('a\nb\nc', 'a\nB\nc')
  assert.equal(d, '@@ -1,3 +1,3 @@\n a\n-b\n+B\n c')
  assert.deepEqual(stats(d), { added: 1, removed: 1 })
})

test('new file', () => assert.equal(unifiedDiff('', 'x\ny'), '@@ -0,0 +1,2 @@\n+x\n+y'))

test('identical', () => assert.match(unifiedDiff('a', 'a'), /^@@ .* @@\n \(no textual change\)$/))

test('far-apart hunks give two headers with right numbers', () => {
  const base = Array.from({ length: 30 }, (_, i) => `l${i}`)
  const next = [...base]
  next[2] = 'X'
  next[27] = 'Y'
  const d = unifiedDiff(base.join('\n'), next.join('\n'))
  assert.equal(d.split('\n').filter(l => l.startsWith('@@')).length, 2)
  assert.ok(d.startsWith('@@ -1,6 +1,6 @@'))
  assert.ok(d.includes('@@ -25,6 +25,6 @@'))
})

test('huge file falls back to a valid hunk', () => {
  const big = Array.from({ length: 2000 }, (_, i) => `l${i}`).join('\n')
  assert.match(unifiedDiff(big, big + '\nz'), /^@@ -1 \+1 @@\n/)
})
