const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const source = ts.transpileModule(fs.readFileSync('src/shared/lib/preparePhoto.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

function photoModule() {
  const blobs = new Map(),
    counts = { canvas: 0, fallback: 0 }
  let nextUrl = 0
  const loaded = { exports: {} }
  class Image {
    naturalWidth = 400
    naturalHeight = 200
    async decode() {
      const blob = blobs.get(this.src)
      if (!blob || (await blob.text()) === 'corrupt') throw new Error('decode failure')
      const bytes = await blob.slice(0, 64).text()
      if (
        blob.type.includes('heic') ||
        (/ftyp/.test(bytes) && !/avif|avis/.test(bytes)) ||
        blob.name?.endsWith('.HEIC')
      )
        throw new Error('HEIC not natively supported')
    }
  }
  new Function('require', 'module', 'exports', 'URL', 'Image', 'document', source)(
    (id) => {
      assert.equal(id, 'heic-to/csp')
      return {
        heicTo: async () => {
          counts.fallback++
          return new Blob(['jpeg'], { type: 'image/jpeg' })
        },
      }
    },
    loaded,
    loaded.exports,
    {
      createObjectURL(blob) {
        const url = `blob:${++nextUrl}`
        blobs.set(url, blob)
        return url
      },
      revokeObjectURL(url) {
        blobs.delete(url)
      },
    },
    Image,
    {
      createElement() {
        counts.canvas++
        return {
          getContext: () => ({ fillRect() {}, drawImage() {} }),
          toBlob: (fn) => fn(new Blob(['jpeg'], { type: 'image/jpeg' })),
        }
      },
    },
  )
  return { ...loaded.exports, counts, blobs }
}

for (const [name, type] of [
  ['a.jpg', 'image/jpeg'],
  ['a.png', 'image/png'],
  ['animated.gif', 'image/gif'],
  ['a.webp', 'image/webp'],
  ['a.avif', 'image/avif'],
]) {
  test(`keeps the exact ${type} file (bytes, MIME and animation) after decoding`, async () => {
    const lib = photoModule(),
      file = new File(['image bytes'], name, { type })
    assert.equal(await lib.preparePhotoForPreview(file), file)
    assert.deepEqual(lib.counts, { canvas: 0, fallback: 0 })
    assert.equal(lib.blobs.size, 0)
  })
}
for (const [name, type, data] of [
  ['IMG_1.HEIC', '', 'heic bytes'],
  ['photo.dat', 'image/heic', 'heic bytes'],
  ['photo.jpg', 'image/jpeg', '\x00\x00\x00\x18ftypheic\x00\x00\x00\x00mif1heic'],
  ['photo.heif', 'application/octet-stream', '\x00\x00\x00\x18ftypmif1\x00\x00\x00\x00mif1heic'],
]) {
  test(`normalizes HEIF via extension, MIME or header: ${name} / ${type || 'empty'}`, async () => {
    const lib = photoModule(),
      file = new File([data], name, { type })
    const result = await lib.preparePhotoForPreview(file)
    assert.notEqual(result, file)
    assert.equal(result.type, 'image/jpeg')
    assert.match(result.name, /\.jpg$/)
    assert.equal(lib.counts.canvas, 1)
    assert.equal(lib.counts.fallback, 1)
    assert.equal(lib.blobs.size, 0)
  })
}
test('existing preparePhoto callers still normalize GIF to a JPEG still frame', async () => {
  const lib = photoModule(),
    file = new File(['animation'], 'animated.gif', { type: 'image/gif' })
  assert.equal((await lib.preparePhoto(file)).type, 'image/jpeg')
  assert.equal(lib.counts.canvas, 1)
})
test('corrupt standard photos get a readable error and release their preview URL', async () => {
  const lib = photoModule()
  await assert.rejects(
    lib.preparePhotoForPreview(new File(['corrupt'], 'bad.jpg', { type: 'image/jpeg' })),
    /사진을 읽을 수 없습니다/,
  )
  assert.equal(lib.blobs.size, 0)
})

// Actual 2×2 alpha AVIF (libvips/sharp), ftyp includes avif + mif1 + miaf.
const alphaAvif = Buffer.from(
  'AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAAXBtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAANGlsb2MAAAAAREAAAgABAAAAAAGUAAEAAAAAAAAAGwACAAAAAAGvAAEAAAAAAAAAEAAAADhpaW5mAAAAAAACAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAAFWluZmUCAAAAAAIAAGF2MDEAAAAAr2lwcnAAAACKaXBjbwAAAAxhdjFDgSACAAAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAcAAAAAA5waXhpAAAAAAEIAAAAOGF1eEMAAAAAdXJuOm1wZWc6bXBlZ0I6Y2ljcDpzeXN0ZW1zOmF1eGlsaWFyeTphbHBoYQAAAAAdaXBtYQAAAAAAAAACAAEDgQIDAAIEhAIFhgAAABppcmVmAAAAAAAAAA5hdXhsAAIAAQABAAAAM21kYXQSAAoHOAA2EBDQaTIOGAAAAEAAsBNX1fo2qnQSAAoEGAA2FTIGGAAAAUAP',
  'base64',
)
test('preserves a real alpha AVIF with compatible mif1 brand byte for byte', async () => {
  const lib = photoModule(),
    file = new File([alphaAvif], 'alpha.avif', { type: 'image/avif' })
  assert.equal(await lib.isHeifPhoto(file), true) // the shared fallback stays unchanged
  assert.equal(await lib.preparePhotoForPreview(file), file)
  assert.deepEqual(Buffer.from(await file.arrayBuffer()), alphaAvif)
  assert.deepEqual(lib.counts, { canvas: 0, fallback: 0 })
})
