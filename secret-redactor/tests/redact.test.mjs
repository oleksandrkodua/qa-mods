import assert from 'node:assert/strict'
import { test } from 'node:test'

import { redact, redactDeep } from '../hooks/redact.ts'

test('known token shapes', () => {
  assert.equal(redact('k=ghp_' + 'a'.repeat(36)), 'k=[REDACTED:github-token]')
  assert.match(redact('AKIAABCDEFGHIJKLMNOP'), /REDACTED:aws/)
  assert.match(redact('sk-ant-' + 'x'.repeat(30)), /anthropic-key/)
})

test('assignments keep the key name', () => {
  assert.equal(redact('DB_PASSWORD=hunter2hunter2'), 'DB_PASSWORD=[REDACTED]')
  assert.equal(redact('"api_key": "abcdef123456"'), '"api_key": "[REDACTED]"')
})

test('normal text untouched', () => {
  const s = 'password must be 8 chars; token count: 5; see README'
  assert.equal(redact(s), s)
})

test('deep: shape preserved', () => {
  const r = redactDeep({ stdout: 'TOKEN=abcdef123456', n: 3, list: ['ok', 'secret: zzzzzz1'] })
  assert.deepEqual(r, { stdout: 'TOKEN=[REDACTED]', n: 3, list: ['ok', 'secret: [REDACTED]'] })
})

test('code expressions on the right-hand side are not secrets', () => {
  for (const s of ['token = getToken(user)', 'secret: process.env.SECRET', 'password = user.password', 'const apiKey = config.apiKey', 'token => token.trim()'])
    assert.equal(redact(s), s, s)
  assert.equal(redact('password = hunter2hunter'), 'password = [REDACTED]')
})
