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
test('detects HEIF bytes even with a JPEG filename and MIME', async () => {
  const disguised = new File(['\x00\x00\x00\x18ftypheic\x00\x00\x00\x00mif1heic'], 'photo.jpg', {
    type: 'image/jpeg',
  })
  assert.equal(await loaded.exports.isHeifPhoto(disguised), true)
  assert.equal(await loaded.exports.isHeifPhoto(new Blob(['not an image'])), false)
  assert.equal(
    await loaded.exports.isHeifPhoto(new Blob(['\x00\x00\x00\x18ftypavif\x00\x00\x00\x00avif'])),
    false,
  )
})
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

test('image loading settles on load/error and times out without retaining handlers', async () => {
  let image,
    timeout,
    cleared = 0
  class PendingDecodeImage {
    naturalWidth = 640
    naturalHeight = 480
    constructor() {
      image = this
    }
    decode() {
      return new Promise(() => {})
    }
  }
  const module = { exports: {} }
  new Function('require', 'module', 'exports', 'Image', 'setTimeout', 'clearTimeout', outputText)(
    require,
    module,
    module.exports,
    PendingDecodeImage,
    (callback, delay) => {
      assert.equal(delay, 30_000)
      timeout = callback
      return 1
    },
    () => {
      cleared++
    },
  )
  const load = module.exports.loadPhotoImage
  const ready = load('blob:ready')
  image.onload()
  assert.equal(await ready, image)
  assert.equal(image.onload, null)
  assert.equal(image.onerror, null)
  assert.equal(image.src, 'blob:ready')

  const failed = load('blob:broken')
  const rejected = assert.rejects(failed, /불러오지 못했습니다/)
  image.onerror()
  await rejected
  assert.equal(image.src, '')

  const stalled = load('blob:stalled')
  const bounded = assert.rejects(stalled, /오래 걸리고/)
  timeout()
  await bounded
  assert.equal(image.src, '')
  assert.equal(image.onload, null)
  assert.equal(image.onerror, null)
  assert.equal(cleared, 3)
})
