const { test } = require('node:test')
const assert = require('node:assert/strict')
const { loadModule } = require('./helpers/load-module.cjs')

const archivedFile = new File(['archived-result'], 'ai-photo.png', { type: 'image/png' })
const sourceJobId = '0123456789abcdef01234567'
const flush = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve()
}
const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function mount(t, overrides = {}, initial = {}) {
  const states = [],
    effects = [],
    refs = [],
    pending = []
  const calls = { fetch: [], prepare: [], create: [], revoke: [] }
  let cursor = 0,
    token = 'owner-token',
    generation = 3
  let props = { sourceJobId, enabled: true, generation, ...initial }
  t.mock.method(URL, 'createObjectURL', (file) => {
    calls.create.push(file)
    return `blob:fixture-${calls.create.length}`
  })
  t.mock.method(URL, 'revokeObjectURL', (url) => calls.revoke.push(url))
  const hooks = {
    useState(initial) {
      const index = cursor++
      if (!(index in states)) states[index] = initial
      return [
        states[index],
        (next) => {
          states[index] = next
        },
      ]
    },
    useRef(initial) {
      const index = cursor++
      return (refs[index] ??= { current: initial })
    },
    useEffect(callback, deps) {
      const index = cursor++
      const old = effects[index]
      if (!old || deps.some((value, i) => !Object.is(value, old.deps[i])))
        pending.push(() => {
          old?.cleanup?.()
          effects[index] = { deps, cleanup: callback() }
        })
    },
  }
  const { useAiSourcePhoto } = loadModule('src/features/ai-image/lib/useAiSourcePhoto.ts', {
    react: hooks,
    '@/shared/lib/authReadSession': {
      getAuthReadSession: () => ({ identity: token.split(':')[0], generation }),
      isAuthReadSessionCurrent: (session) =>
        session.identity === token.split(':')[0] && session.generation === generation,
    },
    '@/shared/lib/authSessionLifecycle': { isAuthSessionCurrent: (value) => value === generation },
    '@/shared/lib/preparePhoto': {
      preparePhoto: async (file) => {
        calls.prepare.push(file)
        return overrides.prepare ? overrides.prepare(file) : file
      },
    },
    './aiImageFile': {
      fetchAiImageFile: async (...args) => {
        calls.fetch.push(args)
        return overrides.fetch ? overrides.fetch(...args) : archivedFile
      },
    },
  })
  const render = (next = {}) => {
    props = { ...props, ...next }
    cursor = 0
    const value = useAiSourcePhoto(props)
    while (pending.length) pending.shift()()
    return value
  }
  const unmount = () => effects.forEach((effect) => effect?.cleanup?.())
  t.after(unmount)
  return {
    render,
    unmount,
    calls,
    changeAccount() {
      token = 'other-owner'
      generation++
    },
    changeToken() {
      token = 'new-token'
    },
    refreshToken() {
      token = 'owner-token:refreshed'
    },
  }
}

test('보관함 사진 선택은 본인 결과를 취소 가능한 요청으로 가져오며 생성하지 않음', async (t) => {
  const hook = mount(t)
  assert.equal(hook.render().preparing, true)
  await flush()
  const state = hook.render()
  assert.equal(state.photo.file, archivedFile)
  assert.equal(state.photo.fromArchive, true)
  assert.equal(state.preparing, false)
  assert.equal(hook.calls.fetch.length, 1)
  assert.equal(hook.calls.fetch[0][0], sourceJobId)
  assert.ok(hook.calls.fetch[0][2] instanceof AbortSignal)
  assert.deepEqual(hook.calls.prepare, [archivedFile])
})

test('비로그인과 일반 사진 모드에서는 보관함 결과를 조회하지 않음', async (t) => {
  for (const initial of [{ enabled: false }, { sourceJobId: undefined }]) {
    const hook = mount(t, {}, initial)
    hook.render()
    await flush()
    assert.deepEqual(hook.calls.fetch, [])
    assert.equal(hook.render().preparing, false)
    hook.unmount()
  }
})

test('화면을 닫으면 요청을 취소하고 늦은 사진과 미리보기는 버림', async (t) => {
  const waiting = deferred()
  const hook = mount(t, { fetch: () => waiting.promise })
  hook.render()
  hook.unmount()
  assert.equal(hook.calls.fetch[0][2].aborted, true)
  waiting.resolve(archivedFile)
  await flush()
  assert.deepEqual(hook.calls.prepare, [])
  assert.deepEqual(hook.calls.create, [])
})

test('계정 또는 인증 토큰이 바뀌면 이전 계정의 늦은 사진을 표시하지 않음', async (t) => {
  for (const change of ['changeAccount', 'changeToken']) {
    const waiting = deferred()
    const hook = mount(t, { fetch: () => waiting.promise })
    hook.render()
    hook[change]()
    waiting.resolve(archivedFile)
    await flush()
    assert.equal(hook.render().photo, undefined)
    assert.deepEqual(hook.calls.create, [])
    hook.unmount()
  }
})

test('이미지 준비 도중 계정이 바뀌어도 이전 사진의 미리보기를 만들지 않음', async (t) => {
  const waiting = deferred()
  const hook = mount(t, { prepare: () => waiting.promise })
  hook.render()
  await flush()
  assert.equal(hook.calls.prepare.length, 1)
  hook.changeAccount()
  waiting.resolve(archivedFile)
  await flush()
  assert.deepEqual(hook.calls.create, [])
})

test('같은 작성자의 인증 갱신은 보관함 사진을 버리지 않고 표시함', async (t) => {
  const waiting = deferred()
  const hook = mount(t, { fetch: () => waiting.promise })
  hook.render()
  hook.refreshToken()
  waiting.resolve(archivedFile)
  await flush()
  assert.equal(hook.render().photo.file, archivedFile)
  assert.equal(hook.render().preparing, false)
})

test('보관함 조회 실패는 안전하게 안내하고 새 사진 선택으로 복구함', async (t) => {
  const hook = mount(t, {
    fetch: async () => {
      throw new Error('private details')
    },
  })
  hook.render()
  await flush()
  let state = hook.render()
  assert.match(state.error, /AI 사진을 가져오지 못했어요/)
  assert.doesNotMatch(state.error, /private/)
  assert.equal(state.preparing, false)
  const file = new File(['new-photo'], 'new.png', { type: 'image/png' })
  assert.equal(await state.selectPhoto(file), true)
  state = hook.render()
  assert.equal(state.error, null)
  assert.equal(state.photo.file, file)
  assert.equal(state.photo.fromArchive, false)
})

test('사진 교체와 삭제 시 이전 미리보기 URL을 해제함', async (t) => {
  const hook = mount(t)
  hook.render()
  await flush()
  let state = hook.render()
  const oldUrl = state.photo.url
  await state.selectPhoto(new File(['new'], 'new.png'))
  state = hook.render()
  assert.deepEqual(hook.calls.revoke, [oldUrl])
  const newUrl = state.photo.url
  state.clearPhoto()
  assert.equal(hook.render().photo, undefined)
  assert.deepEqual(hook.calls.revoke, [oldUrl, newUrl])
})

test('사진 파일 도우미는 취소 신호를 전달하고 기존 파일명과 PNG 타입을 유지함', async () => {
  const signal = new AbortController().signal
  const calls = []
  const { fetchAiImageFile } = loadModule('src/features/ai-image/lib/aiImageFile.ts', {
    '@/entities/ai-image': {
      getAiImageGenerationImage: async (...args) => {
        calls.push(args)
        return new Blob(['result'])
      },
    },
  })
  const file = await fetchAiImageFile(sourceJobId, undefined, signal)
  assert.deepEqual(calls, [[sourceJobId, { signal }]])
  assert.equal(file.name, `pawpong-${sourceJobId}.png`)
  assert.equal(file.type, 'image/png')
  assert.equal(await file.text(), 'result')
})
