import assert from 'node:assert/strict'
import { test } from 'node:test'

import { cacheChip, cacheLeft, countdown, isReset, report, tone, untilReset } from '../hooks/format.ts'

test('countdown', () => {
  assert.equal(countdown(59 * 60000 + 49000), '59:49')
  assert.equal(countdown(3600000), '1:00:00')
  assert.equal(countdown(-5), '0:00')
})

test('untilReset', () => {
  const now = Date.parse('2026-10-06T10:00:00Z')
  assert.equal(untilReset('2026-10-06T11:07:00Z', now), '1г 07х')
  assert.equal(untilReset('2026-10-06T10:25:00Z', now), '25х')
  assert.equal(untilReset('2026-10-09T13:00:00Z', now), '3д 3г')
  assert.equal(untilReset('2026-10-06T09:00:00Z', now), '')
  assert.equal(untilReset(undefined, now), '')
})

test('tone thresholds', () => {
  assert.equal(tone(14, 80), 'ok')
  assert.equal(tone(83, 80), 'warn')
  assert.equal(tone(84.9, 80), 'warn')
  assert.equal(tone(85, 80), 'hot')
  assert.equal(tone(95, 80), 'hot')
  assert.equal(tone(88, 80, 90), 'warn')
})

test('cache estimate: last reply plus ttl, null before the first reply, 0 when expired', () => {
  assert.equal(cacheLeft(0, 60, 1000), null)
  assert.equal(cacheLeft(1000, 60, 1000 + 60000), 3540000)
  assert.equal(cacheLeft(1000, 5, 1000 + 6 * 60000), 0)
})

test('report: plain text, flags a limit over the threshold, says when there is no data', () => {
  const now = Date.parse('2026-10-06T10:00:00Z')
  const text = report({ limits: [{ kind: 'seven_day', percentUsed: 83, resetsAt: '2026-10-06T13:47:00Z' }], usd: 0.1, lastReplyAt: now, ttlMinutes: 60, now, warnAt: 80 })
  assert.match(text, /7 дн\s+83%/)
  assert.match(text, /понад 80%/)
  assert.match(text, /\$0\.10/)
  assert.match(text, /≈ 1:00:00/)
  assert.match(report({ limits: [], usd: null, lastReplyAt: 0, ttlMinutes: 60, now, warnAt: 80 }), /даних немає/)
})

test('report marks a limit over the red threshold more strongly than over the warn one', () => {
  const now = Date.parse('2026-10-06T10:00:00Z')
  const text = report({
    limits: [
      { kind: 'five_hour', percentUsed: 86 },
      { kind: 'seven_day', percentUsed: 83 },
    ],
    usd: null,
    lastReplyAt: 0,
    ttlMinutes: 60,
    now,
    warnAt: 80,
  })
  assert.match(text, /5 год\s+86%.*‼ понад 85%/)
  assert.match(text, /7 дн\s+83%.*⚠ понад 80%/)
})

test('isReset: true only when the reset time is known and has passed', () => {
  const now = Date.parse('2026-10-06T10:00:00Z')

  assert.equal(isReset('2026-10-06T09:00:00Z', now), true)
  assert.equal(isReset('2026-10-06T11:00:00Z', now), false)
  assert.equal(isReset(undefined, now), false)
  assert.equal(isReset('not a date', now), false)
})

test('report: a window whose reset time passed says "скинуто", not the old percent as current', () => {
  const now = Date.parse('2026-10-06T10:00:00Z')
  const text = report({ limits: [{ kind: 'five_hour', percentUsed: 91, resetsAt: '2026-10-06T09:00:00Z' }], usd: 0.1, lastReplyAt: now, ttlMinutes: 60, now, warnAt: 80 })

  assert.match(text, /скинуто \(було 91%/)
  assert.doesNotMatch(text, /‼|⚠/)
})

test('cacheChip: minutes left while counting, empty before the first reply and after expiry', () => {
  assert.equal(cacheChip(0, 60, 1000), '')
  assert.equal(cacheChip(1000, 60, 1000 + 18 * 60000), 'кеш 42хв')
  assert.equal(cacheChip(1000, 60, 1000 + 59 * 60000 + 30000), 'кеш 1хв')
  assert.equal(cacheChip(1000, 5, 1000 + 6 * 60000), '')
})
