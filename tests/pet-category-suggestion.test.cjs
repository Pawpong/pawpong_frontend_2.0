const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

const source = ts.transpileModule(
  fs.readFileSync('src/features/community/lib/usePetCategorySuggestion.ts', 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText
const deferred = () => {
  let resolve, reject
  const promise = new Promise((a, b) => {
    resolve = a
    reject = b
  })
  return { promise, resolve, reject }
}

function mount(classify, thumbnail = async () => new Blob(['photo'])) {
  const slots = [],
    pendingEffects = []
  let cursor = 0,
    currentText = '',
    currentPhoto
  const hooks = {
    useState(initial) {
      const i = cursor++
      if (!(i in slots)) slots[i] = initial
      return [
        slots[i],
        (value) => {
          slots[i] = value
        },
      ]
    },
    useRef(initial) {
      const i = cursor++
      if (!(i in slots)) slots[i] = { current: initial }
      return slots[i]
    },
    useEffect(fn, deps) {
      const i = cursor++
      const previous = slots[i]
      if (!previous || deps.some((dep, n) => !Object.is(dep, previous.deps[n]))) {
        pendingEffects.push(() => {
          previous?.cleanup?.()
          slots[i] = { deps, cleanup: fn() }
        })
      }
    },
  }
  const loaded = { exports: {} }
  new Function('require', 'module', 'exports', source)(
    (id) => {
      if (id === 'react') return hooks
      if (id === '@/entities/ai-image') return { classifyPetContent: classify }
      return { categoryThumbnail: thumbnail }
    },
    loaded,
    loaded.exports,
  )
  const render = (text = currentText, photo = currentPhoto) => {
    currentText = text
    currentPhoto = photo
    cursor = 0
    const result = loaded.exports.usePetCategorySuggestion(text, photo)
    pendingEffects.splice(0).forEach((fn) => fn())
    return result
  }
  return { render, unmount: () => slots.forEach((slot) => slot?.cleanup?.()) }
}

test('does not send drafts automatically and deduplicates same-tick requests', async () => {
  const pending = deferred(),
    calls = []
  const hook = mount((...args) => {
    calls.push(args)
    return pending.promise
  })
  const initial = hook.render('우리 강아지')
  assert.equal(calls.length, 0)
  const a = initial.request(),
    b = initial.request()
  assert.equal(calls.length, 1)
  assert.equal(hook.render().state.phase, 'loading')
  pending.resolve({ subject: 'animal', petType: 'dog' })
  await Promise.all([a, b])
  assert.equal(hook.render().state.result.petType, 'dog')
})

test('manual selection dismisses pending suggestions even if the API ignores abort', async () => {
  const pending = deferred()
  let signal
  const hook = mount((_, __, s) => {
    signal = s
    return pending.promise
  })
  const initial = hook.render('우리 고양이')
  const work = initial.request()
  hook.render().dismiss()
  assert.equal(signal.aborted, true)
  pending.resolve({ subject: 'animal', petType: 'dog' })
  await work
  assert.equal(hook.render().state, null)
})

test('changing a photo while preparing its thumbnail never sends the old photo', async () => {
  const preparing = deferred(),
    calls = []
  const hook = mount(
    (...args) => calls.push(args),
    () => preparing.promise,
  )
  const work = hook.render('사진', new File(['a'], 'a.jpg')).request()
  hook.render('바뀐 사진', new File(['b'], 'b.jpg'))
  preparing.resolve(new Blob(['old']))
  await work
  assert.equal(calls.length, 0)
  assert.equal(hook.render().state, null)
})

test('an old response cannot replace a suggestion for newer text', async () => {
  const old = deferred(),
    recent = deferred()
  const hook = mount((text) => (text === '강아지' ? old.promise : recent.promise))
  const first = hook.render('강아지').request()
  const second = hook.render('고양이').request()
  recent.resolve({ subject: 'animal', petType: 'cat' })
  await second
  old.resolve({ subject: 'animal', petType: 'dog' })
  await first
  assert.equal(hook.render().state.result.petType, 'cat')
})

test('failed requests can be retried, and leaving the page cancels an active request', async () => {
  let count = 0,
    signal
  const pending = deferred()
  const hook = mount((_, __, s) => {
    signal = s
    return ++count === 1 ? Promise.reject(new Error('offline')) : pending.promise
  })
  await hook.render('크레스티드게코').request()
  assert.equal(hook.render().state.phase, 'error')
  const retry = hook.render().request()
  hook.unmount()
  assert.equal(signal.aborted, true)
  pending.resolve({ subject: 'animal', petType: 'reptile' })
  await retry
})
