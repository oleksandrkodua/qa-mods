import assert from 'node:assert/strict'
import { test } from 'node:test'

import { MANY, isHomeTarget, levelOf, parseFacts, plural, readAnswer, stateWords } from '../hooks/decide.ts'

const F = (o = {}) => ({ count: 2, tracked: 0, dirty: 0, untracked: 0, isHome: false, ...o })

test('parseFacts reads the three counters, missing ones are 0', () => {
  assert.deepEqual(parseFacts('COUNT 4\nTRACKED 3\nDIRTY 1\nUNTRACKED 2\n'), { count: 4, tracked: 3, dirty: 1, untracked: 2 })
  assert.deepEqual(parseFacts('COUNT 0'), { count: 0, tracked: 0, dirty: 0, untracked: 0 })
  assert.deepEqual(parseFacts(''), { count: 0, tracked: 0, dirty: 0, untracked: 0 })
})

test('levels: a dialog only for uncommitted changes, home, many files or a hard risk', () => {
  assert.equal(levelOf(false, F()), 'low')
  assert.equal(levelOf(false, F({ tracked: 2 })), 'medium')
  assert.equal(levelOf(false, F({ tracked: 2, dirty: 1 })), 'dialog')
  assert.equal(levelOf(false, F({ untracked: 1 })), 'dialog')
  assert.equal(levelOf(false, F({ isHome: true })), 'dialog')
  assert.equal(levelOf(false, F({ count: MANY })), 'low')
  assert.equal(levelOf(false, F({ count: MANY + 1 })), 'dialog')
  assert.equal(levelOf(true, F()), 'dialog')
})

test('home targets', () => {
  const h = '/Users/x'

  for (const t of ['~', '~/', '~/*', '~/.*', '$HOME', '$HOME/*', '/Users/x', '/Users/x/', '/Users', '/', '/*']) assert.equal(isHomeTarget(t, h), true, t)
  for (const t of ['~/Desktop', '/Users/x/Desktop/a', 'build', './x', '/tmp/x']) assert.equal(isHomeTarget(t, h), false, t)
})

test('answers: the two choices, a skipped dialog, and the typed decision', () => {
  assert.deepEqual(readAnswer('Виконати'), { kind: 'run' })
  assert.deepEqual(readAnswer('Скасувати'), { kind: 'cancel' })
  assert.deepEqual(readAnswer(''), { kind: 'cancel' })
  assert.deepEqual(readAnswer(undefined), { kind: 'cancel' })
  assert.deepEqual(readAnswer('  видали лише перший '), { kind: 'custom', text: 'видали лише перший' })
})

test('Ukrainian plural and the state words', () => {
  const f = ['файл', 'файли', 'файлів']

  assert.deepEqual([1, 2, 5, 11, 12, 21, 22, 25].map(n => plural(n, f)), ['1 файл', '2 файли', '5 файлів', '11 файлів', '12 файлів', '21 файл', '22 файли', '25 файлів'])
  assert.equal(stateWords(F()), 'поза git')
  assert.equal(stateWords(F({ tracked: 2 })), 'усі в git, без змін')
  assert.equal(stateWords(F({ untracked: 1 })), '1 файл без git-копії, не відновити')
  assert.equal(stateWords(F({ tracked: 2, dirty: 2, count: 30 })), 'незакомічених змін: 2, багато файлів')
})
