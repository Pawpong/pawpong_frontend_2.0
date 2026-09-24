const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

const source = ts.transpileModule(
  fs.readFileSync('src/widgets/post-form/lib/usePostForm.ts', 'utf8'),
  {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  },
).outputText

// Run the real hook callbacks with state/ref slots. Browser checks cover the rendered controls.
function mount(prepare, options = {}) {
  const slots = [],
    effects = [],
    revoked = [],
    urls = new Map()
  let cursor = 0,
    nextUrl = 0
  const hooks = {
    useState(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial
      return [
        slots[index],
        (value) => {
          slots[index] = typeof value === 'function' ? value(slots[index]) : value
        },
      ]
    },
    useRef(initial) {
      const index = cursor++
      if (!(index in slots)) slots[index] = { current: initial }
      return slots[index]
    },
    useCallback(fn) {
      return fn
    },
    useEffect(fn) {
      const index = cursor++
      if (!(index in slots)) {
        slots[index] = true
        effects.push(fn)
      }
    },
  }
  const loaded = { exports: {} }
  new Function('require', 'module', 'exports', 'URL', source)(
    (id) => (id === 'react' ? hooks : { preparePhotoForPreview: prepare }),
    loaded,
    loaded.exports,
    {
      createObjectURL(file) {
        const url = `blob:${++nextUrl}`
        urls.set(url, file)
        return url
      },
      revokeObjectURL(url) {
        revoked.push(url)
        urls.delete(url)
      },
    },
  )
  const render = () => {
    cursor = 0
    return loaded.exports.usePostForm(options)
  }
  render()
  const cleanups = effects.map((effect) => effect())
  return { render, urls, revoked, unmount: () => cleanups.forEach((cleanup) => cleanup?.()) }
}
const photo = (name) => new File(['photo'], name, { type: 'image/jpeg' })
const deferred = () => {
  let resolve, reject
  const promise = new Promise((a, b) => {
    resolve = a
    reject = b
  })
  return { promise, resolve, reject }
}

test('copies the input before reset, preserves selection order and pairs each preview with its file', async () => {
  const first = deferred(),
    calls = [],
    a = photo('a.jpg'),
    b = photo('b.jpg')
  const form = mount(async (file) => {
    calls.push(file.name)
    return file === a ? first.promise : file
  })
  const selected = [a, b]
  const pending = form.render().handleAddImages(selected)
  selected.length = 0
  assert.deepEqual(calls, ['a.jpg'])
  assert.equal(form.render().isProcessingPhotos, true)
  assert.equal(form.render().hasPendingPhotos(), true)
  first.resolve(a)
  await pending
  const result = form.render()
  assert.deepEqual(result.files, [a, b])
  assert.deepEqual(
    result.images.map((url) => form.urls.get(url)),
    [a, b],
  )
  assert.equal(result.isProcessingPhotos, false)
  assert.equal(result.hasPendingPhotos(), false)
})

test('guards same-tick repeated input and removal before React renders disabled controls', async () => {
  const wait = deferred(),
    a = photo('a.jpg'),
    b = photo('b.jpg'),
    calls = []
  const form = mount(
    async (file) => {
      calls.push(file)
      return wait.promise
    },
    { initialImages: ['saved'] },
  )
  const staleRender = form.render()
  const pending = staleRender.handleAddImages([a])
  assert.equal(staleRender.hasPendingPhotos(), true)
  await staleRender.handleAddImages([b])
  staleRender.handleRemoveImage(0)
  assert.deepEqual(form.render().images, ['saved'])
  wait.resolve(a)
  await pending
  assert.deepEqual(calls, [a])
  assert.deepEqual(form.render().files, [a])
})

test('respects capacity including saved images and allows replacement after removal', async () => {
  const a = photo('a.jpg'),
    b = photo('b.jpg'),
    form = mount(async (file) => file, { initialImages: ['saved'], maxImages: 2 })
  await form.render().handleAddImages([a, b])
  assert.deepEqual(form.render().files, [a])
  form.render().handleRemoveImage(0)
  await form.render().handleAddImages([b])
  assert.deepEqual(form.render().files, [a, b])
  const removed = form.render().images[0]
  form.render().handleRemoveImage(0)
  assert.deepEqual(form.render().files, [b])
  assert.deepEqual(
    form.render().images.map((url) => form.urls.get(url)),
    [b],
  )
  assert.ok(form.revoked.includes(removed))
})

test('reports a failed file without discarding previous or other successfully prepared photos', async () => {
  const a = photo('a.jpg'),
    broken = photo('broken.heic'),
    b = photo('b.jpg')
  const form = mount(async (file) => {
    if (file === broken) throw new Error('변환 실패')
    return file
  })
  await form.render().handleAddImages([a])
  await form.render().handleAddImages([broken, b])
  assert.deepEqual(form.render().files, [a, b])
  assert.match(form.render().photoError, /broken.heic: 변환 실패/)
  assert.equal(form.render().hasPendingPhotos(), false)
})

test('cancel keeps existing previews; a late old result cannot append or unlock a new selection', async () => {
  const old = deferred(),
    next = deferred(),
    kept = photo('kept.jpg'),
    stale = photo('old.heic'),
    fresh = photo('new.heic')
  const form = mount((file) =>
    file === stale ? old.promise : file === fresh ? next.promise : Promise.resolve(file),
  )
  await form.render().handleAddImages([kept])
  const cancelled = form.render().handleAddImages([stale])
  form.render().cancelPhotoProcessing()
  assert.deepEqual(form.render().files, [kept])
  const pending = form.render().handleAddImages([fresh])
  old.resolve(photo('old.jpg'))
  await cancelled
  assert.equal(form.render().hasPendingPhotos(), true)
  assert.deepEqual(form.render().files, [kept])
  const converted = photo('new.jpg')
  next.resolve(converted)
  await pending
  assert.deepEqual(form.render().files, [kept, converted])
  assert.equal(form.urls.size, 2)
})

test('unmount releases committed previews and discards late success without creating object URLs', async () => {
  const wait = deferred(),
    kept = photo('kept.jpg'),
    pendingFile = photo('pending.heic')
  const form = mount((file) => (file === pendingFile ? wait.promise : Promise.resolve(file)))
  await form.render().handleAddImages([kept])
  const pending = form.render().handleAddImages([pendingFile])
  form.unmount()
  wait.resolve(photo('converted.jpg'))
  await pending
  assert.equal(form.urls.size, 0)
  assert.equal(form.revoked.length, 1)
  assert.equal(form.render().files.length, 1)
})

test('cancelled failure does not replace the error or photos from a newer selection', async () => {
  const wait = deferred(),
    old = photo('old.heic'),
    fresh = photo('new.jpg')
  const form = mount((file) => (file === old ? wait.promise : Promise.resolve(file)))
  const pending = form.render().handleAddImages([old])
  form.render().cancelPhotoProcessing()
  await form.render().handleAddImages([fresh])
  wait.reject(new Error('old error'))
  await pending
  assert.equal(form.render().photoError, null)
  assert.deepEqual(form.render().files, [fresh])
})

test('file chooser cancellation does not start processing or change selected photos', async () => {
  const kept = photo('kept.jpg'),
    form = mount(async (file) => file)
  await form.render().handleAddImages([kept])
  await form.render().handleAddImages([])
  assert.deepEqual(form.render().files, [kept])
  assert.equal(form.render().hasPendingPhotos(), false)
})
