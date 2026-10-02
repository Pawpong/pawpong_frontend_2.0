const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const source = ts.transpileModule(
  fs.readFileSync('src/features/community/lib/usePetCategorySuggestion.ts', 'utf8'),
  {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  },
).outputText
const deferred = () => {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}
const flush = async () => {
  for (let i = 0; i < 6; i++) await Promise.resolve()
}
function mount(classify, thumbnail = async () => new Blob(['photo'])) {
  const slots = [],
    effects = [],
    timers = new Map()
  let cursor = 0,
    text = '',
    photo,
    automatic = true,
    now = 0,
    timerId = 0
  const changed = (a, b) => !a || b.some((v, i) => !Object.is(v, a.deps[i]))
  const hooks = {
    useState(initial) {
      const i = cursor++
      if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial
      return [
        slots[i],
        (v) => {
          slots[i] = typeof v === 'function' ? v(slots[i]) : v
        },
      ]
    },
    useRef(initial) {
      const i = cursor++
      if (!(i in slots)) slots[i] = { current: initial }
      return slots[i]
    },
    useCallback(fn, deps) {
      const i = cursor++
      if (changed(slots[i], deps)) slots[i] = { deps, fn }
      return slots[i].fn
    },
    useEffect(fn, deps) {
      const i = cursor++,
        previous = slots[i]
      if (changed(previous, deps))
        effects.push(() => {
          previous?.cleanup?.()
          slots[i] = { deps, cleanup: fn() }
        })
    },
  }
  const loaded = { exports: {} }
  new Function('require', 'module', 'exports', 'Date', 'setTimeout', 'clearTimeout', source)(
    (id) =>
      id === 'react'
        ? hooks
        : id === '@/entities/ai-image'
          ? { classifyPetContent: classify }
          : { categoryThumbnail: thumbnail },
    loaded,
    loaded.exports,
    { now: () => now },
    (fn, delay) => {
      const id = ++timerId
      timers.set(id, { fn, at: now + delay })
      return id
    },
    (id) => timers.delete(id),
  )
  return {
    render(nextText = text, nextPhoto = photo, nextAuto = automatic) {
      text = nextText
      photo = nextPhoto
      automatic = nextAuto
      cursor = 0
      const result = loaded.exports.usePetCategorySuggestion(text, photo, automatic)
      effects.splice(0).forEach((fn) => fn())
      return result
    },
    async tick(ms) {
      now += ms
      for (const [id, timer] of timers)
        if (timer.at <= now) {
          timers.delete(id)
          timer.fn()
        }
      await flush()
    },
    unmount() {
      slots.forEach((slot) => slot?.cleanup?.())
    },
  }
}

test('automatically classifies the latest input after typing settles without a button click', async () => {
  const calls = []
  const hook = mount(async (text) => {
    calls.push(text)
    return { subject: 'animal', petType: 'dog' }
  })
  hook.render('우리')
  await hook.tick(700)
  hook.render('우리 강아지')
  await hook.tick(1100)
  assert.equal(calls.length, 0)
  await hook.tick(100)
  assert.deepEqual(calls, ['우리 강아지'])
  assert.equal(hook.render().state.result.petType, 'dog')
})

test('manual mode stops automatic sending and aborts a pending response', async () => {
  const pending = deferred()
  let calls = 0,
    signal
  const hook = mount((_, __, s) => {
    calls++
    signal = s
    return pending.promise
  })
  hook.render('고양이', undefined, false)
  await hook.tick(2000)
  assert.equal(calls, 0)
  hook.render('고양이', undefined, true)
  await hook.tick(1200)
  hook.render().dismiss()
  hook.render('고양이', undefined, false)
  assert.equal(signal.aborted, true)
  pending.resolve({ subject: 'animal', petType: 'dog' })
  await flush()
  assert.equal(hook.render().state, null)
})

test('a changed photo cancels thumbnail preparation before sending the old photo', async () => {
  const preparing = deferred(),
    calls = []
  const hook = mount(
    (...args) => calls.push(args),
    () => preparing.promise,
  )
  hook.render('사진', new File(['a'], 'a.jpg'))
  await hook.tick(1200)
  hook.render('사진', new File(['b'], 'b.jpg'))
  preparing.resolve(new Blob(['old']))
  await flush()
  assert.equal(calls.length, 0)
  assert.equal(hook.render().state.phase, 'waiting')
})

test('old responses cannot replace the newer input and requests respect the server rate limit', async () => {
  const old = deferred(),
    calls = []
  const hook = mount((text) => {
    calls.push(text)
    return text === '강아지' ? old.promise : Promise.resolve({ subject: 'animal', petType: 'cat' })
  })
  hook.render('강아지')
  await hook.tick(1200)
  hook.render('고양이')
  await hook.tick(10999)
  assert.deepEqual(calls, ['강아지'])
  await hook.tick(1)
  old.resolve({ subject: 'animal', petType: 'dog' })
  await flush()
  assert.equal(hook.render().state.result.petType, 'cat')
  assert.deepEqual(calls, ['강아지', '고양이'])
})

test('errors are retryable without a request loop and retries also wait for the rate window', async () => {
  let count = 0
  const hook = mount(async () => {
    if (++count === 1) throw new Error('offline')
    return { subject: 'animal', petType: 'reptile' }
  })
  hook.render('크레스티드게코')
  await hook.tick(1200)
  assert.equal(hook.render().state.phase, 'error')
  await hook.tick(20000)
  assert.equal(count, 1)
  hook.render().retry()
  hook.render()
  await hook.tick(1200)
  assert.equal(hook.render().state.result.petType, 'reptile')
})

test('blank input sends nothing; leaving the page aborts the request', async () => {
  let signal,
    calls = 0
  const hook = mount((_, __, s) => {
    calls++
    signal = s
    return new Promise(() => {})
  })
  hook.render('  ')
  await hook.tick(2000)
  assert.equal(calls, 0)
  hook.render('도마뱀')
  await hook.tick(1200)
  hook.unmount()
  assert.equal(signal.aborted, true)
})

test('only the first 2000 characters are sent and edits beyond them do not trigger requests', async () => {
  const calls = []
  const hook = mount(async (text) => {
    calls.push(text)
    return { subject: 'unclear', petType: 'unknown' }
  })
  hook.render('a'.repeat(2000) + 'b')
  await hook.tick(1200)
  hook.render('a'.repeat(2000) + 'c')
  await hook.tick(11000)
  assert.deepEqual(calls, ['a'.repeat(2000)])
})
