const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const source = fs.readFileSync('src/shared/lib/preparePhoto.ts', 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
})
const loaded = { exports: {} }
new Function('require', 'module', 'exports', outputText)(require, loaded, loaded.exports)
const { validatePhoto, MAX_PHOTO_BYTES } = loaded.exports
for (const [name, type] of [
  ['iphone.HEIC', 'image/heic'],
  ['iphone.heif', 'image/heif'],
  ['galaxy.jpg', 'image/jpeg'],
  ['screenshot.png', 'image/png'],
  ['photo.webp', 'image/webp'],
  ['photo.avif', 'image/avif'],
  ['animation.gif', 'image/gif'],
  ['IMG_0001.HEIC', ''],
  ['photo.jpg', 'application/octet-stream'],
]) {
  test(`accepts ${name} (${type || 'empty MIME'})`, () =>
    assert.doesNotThrow(() => validatePhoto(new File(['photo'], name, { type }))))
}
test('rejects empty, corrupt candidate types, SVG, RAW and movies before decode', () => {
  assert.throws(() => validatePhoto(new File([], 'empty.jpg', { type: 'image/jpeg' })), /비어/)
  for (const [name, type] of [
    ['file.pdf', 'application/pdf'],
    ['file.svg', 'image/svg+xml'],
    ['file.dng', 'image/x-adobe-dng'],
    ['file.mov', 'video/quicktime'],
    ['fake.jpg', 'video/mp4'],
  ]) {
    assert.throws(() => validatePhoto(new File(['data'], name, { type })), /사진을 선택/)
  }
})
test('100MB boundary matches server input limit', () => {
  assert.doesNotThrow(() =>
    validatePhoto({ name: 'photo.jpg', type: 'image/jpeg', size: MAX_PHOTO_BYTES }),
  )
  assert.throws(
    () => validatePhoto({ name: 'photo.jpg', type: 'image/jpeg', size: MAX_PHOTO_BYTES + 1 }),
    /100MB/,
  )
})
