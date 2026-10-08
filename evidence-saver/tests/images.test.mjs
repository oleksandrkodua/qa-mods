import assert from 'node:assert/strict'
import { test } from 'node:test'

import { findImages } from '../hooks/images.ts'

const b64 = 'A'.repeat(200)

test('finds nested image blocks', () => {
  const r = { content: [{ type: 'text', text: 'hi' }, { type: 'image', source: { type: 'base64', media_type: 'image/png', data: b64 } }] }
  assert.deepEqual(findImages(r), [{ ext: 'png', b64 }])
})

test('flat mimeType form', () => assert.equal(findImages({ data: b64, mimeType: 'image/jpeg' })[0].ext, 'jpg'))

test('ignores text and short blobs', () => {
  assert.deepEqual(findImages({ stdout: b64, x: { data: 'abc', mimeType: 'image/png' } }), [])
})
