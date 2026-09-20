const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const source = fs.readFileSync('src/app/(main)/profile/edit/_lib/representativePhotos.ts', 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
})
const loaded = { exports: {} }
new Function('require', 'module', 'exports', outputText)(require, loaded, loaded.exports)
const { addRepresentativePhotos: add, resolveRepresentativePhotos: resolve } = loaded.exports
const photo = (name) => new File(['photo'], name, { type: 'image/png' })

test('successive selections retain saved photo and both new files', () => {
  const second = photo('second.png'),
    third = photo('third.png')
  assert.deepEqual(add(add(['saved-url'], [second], 1), [third], 2), ['saved-url', second, third])
})
test('fills the clicked slot and reuses a deleted middle slot without shifting others', () => {
  const third = photo('third.png'),
    second = photo('second.png')
  const slots = add(['saved-url'], [third], 2)
  assert.deepEqual(slots, ['saved-url', null, third])
  assert.deepEqual(add(slots, [second], 1), ['saved-url', second, third])
})
test('cancelling retains slots; exceeding capacity rejects without losing current photos', () => {
  const slots = ['saved-url', photo('second.png'), null]
  assert.deepEqual(add(slots, []), slots)
  assert.throws(() => add(slots, [photo('third.png'), photo('fourth.png')]), /최대 3장/)
  assert.equal(slots[2], null)
})
test('rejects oversized, empty and non-image files', () => {
  assert.throws(
    () =>
      add([], [new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' })]),
    /5MB/,
  )
  assert.throws(() => add([], [new File([], 'empty.png', { type: 'image/png' })]), /이미지/)
  assert.throws(() => add([], [new File(['text'], 'text.txt', { type: 'text/plain' })]), /이미지/)
})
test('saving uploads only new files and keeps saved URLs in slot order', async () => {
  const file = photo('new.png'),
    uploaded = []
  const urls = await resolve(['existing-url', null, file], async (f) => {
    uploaded.push(f)
    return 'new-url'
  })
  assert.deepEqual(uploaded, [file])
  assert.deepEqual(urls, ['existing-url', 'new-url'])
})
test('deleting all photos produces an empty saved list without uploads', async () => {
  assert.deepEqual(await resolve([null, null, null], () => assert.fail('unexpected upload')), [])
})
test('failed uploads reject saving and leave the draft intact', async () => {
  const draft = ['existing-url', photo('new.png')]
  await assert.rejects(
    resolve(draft, async () => {
      throw new Error('upload failed')
    }),
    /upload failed/,
  )
  assert.equal(draft[0], 'existing-url')
  assert.equal(draft[1].name, 'new.png')
})
