import assert from 'node:assert/strict'
import { test } from 'node:test'

import { MANY, findSummary, hardQuestion, isHomeTarget, levelOf, parseFacts, plural, readAnswer, reasonUk, stateWords } from '../hooks/decide.ts'
import { analyze } from '../hooks/analyze.ts'

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

test('find: the dialog says in Ukrainian what the change is, not only the command', () => {
  const del = analyze('find . -name "*.tmp" -delete')
  assert.deepEqual(del.reasons.map(reasonUk), ['find -delete видалить кожен знайдений файл'])

  const rm = analyze('find . -type f -exec /bin/rm {} +')
  assert.deepEqual(rm.reasons, ['find -exec rm runs it on every match'])
  assert.deepEqual(rm.reasons.map(reasonUk), ['find -exec запустить rm для кожного знайденого файлу'])
  assert.match(hardQuestion(rm.reasons, rm.segment), /^Ризик: find -exec запустить rm для кожного знайденого файлу\. Команда: find \. -type f/)

  const none = analyze('find . -type f -exec')
  assert.deepEqual(none.reasons.map(reasonUk), ['find -exec запустить команду для кожного знайденого файлу'])

  const both = analyze('find . -exec rm {} \\; -exec mv {} /tmp \\; -delete')
  assert.equal(both.reasons.length, 3)
})

test('find with a read-only -exec raises no reason at all', () => {
  assert.deepEqual(analyze("find . -type f -exec stat -f '%z %N' {} +").reasons, [])
})

test('findSummary says in plain Ukrainian where find looks, for what, and what it does to every match', () => {
  const sum = c => findSummary(analyze(c).finds[0])

  assert.equal(
    sum('find . -maxdepth 1 -name "no-such-file-xyz" -exec rm {} +'),
    'Шукає елементи з іменем «no-such-file-xyz» у поточній папці, лише на першому рівні, без вкладених папок, і видалить усе знайдене',
  )
  assert.equal(
    sum('find ~/Downloads -type f -name "*.tmp" -mtime +30 -delete'),
    'Шукає файли з іменем «*.tmp», старіші за 30 дн. у ~/Downloads, разом з усіма вкладеними папками, і видалить усе знайдене',
  )
  assert.equal(sum('find build -type d -maxdepth 3 -exec mv {} /tmp \\;'), 'Шукає папки у build, не глибше 3 рівнів, і перемістить усе знайдене')
  assert.equal(sum('find . -name "*.sh" -exec chmod 000 {} +'), 'Шукає елементи з іменем «*.sh» у поточній папці, разом з усіма вкладеними папками, і змінить права для всього знайденого')
  assert.equal(sum('find . -type f -exec sh -c "x" \\;'), 'Шукає файли у поточній папці, разом з усіма вкладеними папками, і запустить sh для всього знайденого')
  // the same action twice (-exec rm and -delete) is said once
  assert.equal(
    sum('find . -type f -exec rm {} \\; -exec mv {} /tmp \\; -delete'),
    'Шукає файли у поточній папці, разом з усіма вкладеними папками, і видалить усе знайдене і перемістить усе знайдене',
  )
})

test('the dialog puts "Що зробить" between the risk and the command; no line for other commands', () => {
  const a = analyze('find . -maxdepth 1 -name "x" -exec rm {} +')
  const q = hardQuestion(a.reasons, a.segment, a.finds)

  assert.match(q, /^Ризик: find -exec запустить rm для кожного знайденого файлу\. Що зробить: Шукає елементи з іменем «x» у поточній папці, лише на першому рівні, без вкладених папок, і видалить усе знайдене\. Команда: find \. /)
  assert.ok(!hardQuestion(['runs with sudo'], 'sudo ls').includes('Що зробить'))
  assert.deepEqual(analyze("find . -type f -exec stat {} +").finds, [])
})
