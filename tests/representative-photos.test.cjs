const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const source = fs.readFileSync('src/app/(main)/profile/edit/_lib/representativePhotos.ts', 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
})
const loaded = { exports: {} }
const photoModule = { exports: {} }
const photoOutput = ts.transpileModule(fs.readFileSync('src/shared/lib/preparePhoto.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
new Function('require', 'module', 'exports', photoOutput)(require, photoModule, photoModule.exports)
new Function('require', 'module', 'exports', outputText)(
  (id) =>
    id === '@/shared/lib/preparePhoto'
      ? {
          validatePhoto: photoModule.exports.validatePhoto,
          preparePhoto: async (file) =>
            new File(['converted'], file.name + '.jpg', { type: 'image/jpeg' }),
        }
      : require(id),
  loaded,
  loaded.exports,
)
const { addRepresentativePhotos: add, resolveRepresentativePhotos: resolve } = loaded.exports
const photo = (name) => new File(['photo'], name, { type: 'image/png' })

test('successive selections retain saved photo and both new files', () => {
  const second = photo('second.png'),
    third = photo('third.png')
  assert.deepEqual(add(add(['saved-url'], [second], 1), [third], 2), [
    'saved-url',
    second,
    third,
    null,
  ])
})
test('fills the clicked slot and reuses a deleted middle slot without shifting others', () => {
  const third = photo('third.png'),
    second = photo('second.png')
  const slots = add(['saved-url'], [third], 2)
  assert.deepEqual(slots, ['saved-url', null, third, null])
  assert.deepEqual(add(slots, [second], 1), ['saved-url', second, third, null])
})
test('cancelling retains slots; exceeding capacity rejects without losing current photos', () => {
  const slots = ['saved-url', photo('second.png'), null, null]
  assert.deepEqual(add(slots, []), slots)
  assert.throws(
    () => add(slots, [photo('third.png'), photo('fourth.png'), photo('fifth.png')]),
    /최대 4장/,
  )
  assert.equal(slots[2], null)
})
test('rejects oversized, empty and non-image files', () => {
  assert.throws(
    () => add([], [{ size: 100 * 1024 * 1024 + 1, name: 'big.png', type: 'image/png' }]),
    /100MB/,
  )
  assert.throws(() => add([], [new File([], 'empty.png', { type: 'image/png' })]), /비어/)
  assert.throws(
    () => add([], [new File(['text'], 'text.txt', { type: 'text/plain' })]),
    /사진을 선택/,
  )
})
test('accepts empty MIME HEIC, generic MIME JPEG and originals above 5MB', () => {
  for (const file of [
    new File(['photo'], 'IMG_0001.HEIC'),
    new File(['photo'], 'p.jpg', { type: 'application/octet-stream' }),
    { name: 'large.HEIC', type: '', size: 9 * 1024 * 1024 },
  ])
    assert.equal(add([], [file])[0], file)
})
test('saving uploads only new files and keeps saved URLs in slot order', async () => {
  const file = photo('new.png'),
    uploaded = []
  const urls = await resolve(['existing-url', null, file], async (f) => {
    uploaded.push(f)
    return 'new-url'
  })
  assert.equal(uploaded.length, 1)
  assert.notEqual(uploaded[0], file)
  assert.equal(uploaded[0].type, 'image/jpeg')
  assert.equal(await uploaded[0].text(), 'converted')
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
