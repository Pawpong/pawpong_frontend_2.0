const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')

function load(file, dependencies = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  const output = {}
  new Function('exports', 'require', code)(output, (name) => {
    if (name === '@/shared/config/apiDiagnosticRoutes') {
      return load('src/shared/config/apiDiagnosticRoutes.ts')
    }
    if (!(name in dependencies)) throw new Error(`Missing test dependency: ${name}`)
    return dependencies[name]
  })
  return output
}

const { ApiError } = load('src/shared/api/unwrap.ts')
const recovery = load('src/features/ai-image/lib/aiImageRecovery.ts', {
  '@/shared/api/unwrap': { ApiError },
})
const job = (status = 'queued', jobId = 'fixture-job') => ({
  jobId,
  status,
  filterId: 'fixture-filter',
  resultImageUrl: status === 'succeeded' ? 'https://example.test/result.png' : undefined,
  resultObjectKey: status === 'succeeded' ? 'ai-image/result/fixture.png' : null,
  errorCode: null,
  createdAt: new Date(0).toISOString(),
  completedAt: null,
})
const input = { file: new File(['fixture'], 'pet.png'), filterId: 'fixture-filter' }
test('game generation fails closed after config refetch error even with enabled cached data; photo studio stays usable', () => {
  let config = { data: { enabled: true }, isPending: false, isError: true }
  const options = []
  const studio = () => null
  const { AiFilterContent } = load('src/app/(main)/ai-filter/_ui/AiFilterContent.tsx', {
    react: { useEffect() {} },
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/features/ai-image': { AiFilterStudio: studio },
    '@/features/auth': { useMe: () => ({ isLoggedIn: true }) },
    '@/features/in-app-purchase': {
      usePurchases: () => ({ refresh: async () => {}, account: { isError: false } }),
    },
    '@/entities/iap': { featureAllowance: () => undefined },
    '@tanstack/react-query': {
      useQuery: (value) => {
        options.push(value)
        return config
      },
    },
    '@/entities/playground-pet': { getPetConfig: async () => config.data },
  })
  const closed = AiFilterContent({ gameCharacter: true })
  assert.equal(closed.type, 'p')
  assert.equal(closed.props.role, 'status')
  assert.equal(AiFilterContent({}).type, studio)
  assert.deepEqual(
    options.map((option) => option.enabled),
    [true, false],
  )
  config = { ...config, isError: false }
  assert.equal(AiFilterContent({ gameCharacter: true }).type, studio)
})
const deferred = () => {
  let resolve, reject
  const promise = new Promise((a, b) => {
    resolve = a
    reject = b
  })
  return { promise, resolve, reject }
}
const flush = async () => {
  for (let i = 0; i < 20; i++) await Promise.resolve()
}
const advance = async (t, ms = 3000) => {
  t.mock.timers.tick(ms)
  await flush()
}
const clock = (t) => t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 1000 })

function mount(overrides = {}) {
  const slots = [],
    cleanups = [],
    calls = { upload: [], request: [], status: [], image: [] }
  let cursor = 0
  const wrap =
    (key, fallback) =>
    async (...args) => {
      calls[key].push(args)
      return (overrides[key] ?? fallback)(...args)
    }
  const api = {
    uploadAiImageSource: wrap('upload', () => ({ inputObjectKey: 'ai-image/source/fixture.png' })),
    requestAiImageGeneration: wrap('request', () => job()),
    getAiImageGeneration: wrap('status', () => job('succeeded')),
    getAiImageGenerationImage: wrap('image', () => new Blob(['fixture-result'])),
  }
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
    useCallback(fn) {
      return fn
    },
    useEffect(fn) {
      const i = cursor++
      if (!(i in slots)) {
        slots[i] = true
        cleanups.push(fn())
      }
    },
  }
  const { useAiPixelTransform } = load('src/features/ai-image/lib/useAiPixelTransform.ts', {
    react: hooks,
    '@/entities/ai-image': api,
    './aiImageRecovery': recovery,
  })
  return {
    calls,
    render() {
      cursor = 0
      return useAiPixelTransform()
    },
    unmount() {
      cleanups.forEach((cleanup) => cleanup?.())
    },
  }
}

test('only an explicit game generation sends its purpose; both paths keep one normal result download', async () => {
  for (const purpose of [undefined, 'pet-sprite-v1']) {
    const hook = mount({ request: () => job('succeeded') })
    const result = await hook
      .render()
      .transform({ ...input, ...(purpose && { generationPurpose: purpose }) })
    assert.equal(hook.calls.request.length, 1)
    assert.deepEqual(hook.calls.request[0][0], {
      filterId: input.filterId,
      inputObjectKey: 'ai-image/source/fixture.png',
      ...(purpose && { generationPurpose: purpose }),
    })
    assert.equal(hook.render().phase, 'done')
    assert.equal(result.jobId, 'fixture-job')
    assert.equal(hook.calls.image.length, 1)
    hook.unmount()
  }
})

test('a polling timeout recovers the same job without replaying the generation POST', async (t) => {
  clock(t)
  let attempts = 0
  const hook = mount({
    status: () => {
      if (++attempts === 1) throw new ApiError('timeout of 30000ms exceeded')
      return job('succeeded')
    },
  })
  const work = hook.render().transform(input)
  await flush()
  await advance(t)
  assert.equal(hook.render().phase, 'reconnecting')
  assert.equal(hook.render().isWorking, true)
  assert.equal(hook.render().error, null)
  await advance(t)
  const result = await work
  assert.equal(hook.render().phase, 'done')
  assert.equal(await result.file.text(), 'fixture-result')
  assert.equal(hook.calls.request.length, 1)
  assert.deepEqual(
    hook.calls.status.map(([id]) => id),
    ['fixture-job', 'fixture-job'],
  )
  assert.equal(hook.calls.status[0][1].timeout, 10000)
})

test('same-tick clicks share one upload and generation request', async (t) => {
  clock(t)
  const accepted = deferred()
  const hook = mount({ request: () => accepted.promise })
  const initial = hook.render()
  const first = initial.transform(input),
    second = initial.transform(input)
  assert.equal(first, second)
  await flush()
  assert.equal(hook.calls.upload.length, 1)
  assert.equal(hook.calls.request.length, 1)
  accepted.resolve(job())
  await flush()
  await advance(t)
  await first
})

test('a four-minute wait is pending, and resume only reads the original job', async (t) => {
  clock(t)
  const hook = mount()
  const work = hook.render().transform(input)
  await flush()
  await advance(t, 240000)
  assert.equal(await work, null)
  assert.equal(hook.render().phase, 'pending')
  assert.equal(hook.render().canResume, true)
  assert.doesNotMatch(hook.render().error, /timeout|failed|Network Error/)
  const resumed = hook.render().resume()
  assert.equal(hook.render().resume(), resumed)
  await advance(t)
  assert.equal((await resumed).jobId, 'fixture-job')
  assert.equal(hook.calls.request.length, 1)
  assert.equal(hook.calls.upload.length, 1)
})

test('lost generation acknowledgement is not retried and directs the user to the archive', async () => {
  const hook = mount({
    request: () => {
      throw new ApiError('timeout of 30000ms exceeded')
    },
  })
  assert.equal(await hook.render().transform(input), null)
  assert.equal(hook.render().phase, 'pending')
  assert.equal(hook.render().canResume, false)
  assert.match(hook.render().error, /접수 여부.*보관함/)
  await hook.render().resume()
  assert.equal(hook.calls.request.length, 1)
  assert.equal(hook.calls.status.length, 0)
})

test('a failed source upload never sends a generation request or displays raw technical errors', async () => {
  const hook = mount({
    upload: () => {
      throw new ApiError('Network Error')
    },
  })
  await hook.render().transform(input)
  assert.equal(hook.render().phase, 'failed')
  assert.match(hook.render().error, /연결/)
  assert.doesNotMatch(hook.render().error, /Network Error/)
  assert.equal(hook.calls.request.length, 0)
})

test('rejected animal classification preserves its actionable message without retrying', async () => {
  const hook = mount({
    request: () => {
      throw new ApiError('동물이 잘 보이는 사진을 올려 주세요.', 400)
    },
  })
  await hook.render().transform(input)
  assert.equal(hook.render().phase, 'failed')
  assert.equal(hook.render().error, '동물이 잘 보이는 사진을 올려 주세요.')
  assert.equal(hook.render().canResume, false)
  assert.equal(hook.calls.request.length, 1)
})

test('an authoritative failed job is not mislabelled as a connection interruption', async (t) => {
  clock(t)
  const hook = mount({ status: () => ({ ...job('failed'), errorCode: 'INPUT_DOWNLOAD_FAILED' }) })
  const work = hook.render().transform(input)
  await flush()
  await advance(t)
  await work
  assert.equal(hook.render().phase, 'failed')
  assert.match(hook.render().error, /사진을 읽지 못/)
  assert.equal(hook.calls.image.length, 0)
})

test('a transient result download failure retries the completed job instead of generating again', async (t) => {
  clock(t)
  let downloads = 0
  const hook = mount({
    image: () => {
      if (++downloads === 1) throw new ApiError('upstream unavailable', 503)
      return new Blob(['recovered-result'])
    },
  })
  const work = hook.render().transform(input)
  await flush()
  await advance(t)
  assert.equal(hook.render().phase, 'reconnecting')
  await advance(t)
  assert.equal(await (await work).file.text(), 'recovered-result')
  assert.equal(hook.calls.request.length, 1)
  assert.equal(hook.calls.image.length, 2)
})

test('a long download interruption retains a completed job for quota-free resume', async (t) => {
  clock(t)
  let offline = true
  const hook = mount({
    image: () => {
      if (offline) throw new ApiError('Network Error')
      return new Blob(['completed'])
    },
  })
  const work = hook.render().transform(input)
  await flush()
  await advance(t)
  await advance(t, 120000)
  await work
  assert.equal(hook.render().phase, 'pending')
  assert.match(hook.render().error, /사진은 완성/)
  offline = false
  const result = await hook.render().resume()
  assert.equal(result.jobId, 'fixture-job')
  assert.equal(hook.calls.request.length, 1)
  assert.equal(hook.calls.status.length, 1)
})

test('authentication errors stop polling rather than retrying forever', async (t) => {
  clock(t)
  const hook = mount({
    status: () => {
      throw new ApiError('Request failed with status code 401', 401)
    },
  })
  const work = hook.render().transform(input)
  await flush()
  await advance(t)
  await work
  assert.equal(hook.render().phase, 'failed')
  assert.match(hook.render().error, /로그인.*보관함/)
  assert.equal(hook.calls.status.length, 1)
})

test('reset aborts the request and an old acknowledgement cannot replace the new job', async (t) => {
  clock(t)
  const old = deferred()
  let requests = 0
  const hook = mount({
    request: () => (++requests === 1 ? old.promise : job('queued', 'new-job')),
    status: (id) => job('succeeded', id),
  })
  const previous = hook.render().transform(input)
  await flush()
  hook.render().reset()
  assert.equal(hook.calls.request[0][1].signal.aborted, true)
  const recent = hook.render().transform(input)
  await flush()
  old.resolve(job('queued', 'old-job'))
  assert.equal(await previous, null)
  await advance(t)
  assert.equal((await recent).jobId, 'new-job')
  assert.deepEqual(
    hook.calls.status.map(([id]) => id),
    ['new-job'],
  )
})

test('unmount cancels a retry wait without sending further requests', async (t) => {
  clock(t)
  const hook = mount({
    status: () => {
      throw new ApiError('Network Error')
    },
  })
  const work = hook.render().transform(input)
  await flush()
  await advance(t)
  hook.unmount()
  assert.equal(await work, null)
  await advance(t, 60000)
  assert.equal(hook.calls.status.length, 1)
  assert.equal(hook.calls.status[0][1].signal.aborted, true)
})

test('only transient API failures are retryable, and unknown errors are not exposed', () => {
  for (const status of [undefined, 408, 429, 500, 502, 503, 504])
    assert.equal(recovery.isRetryableAiImageError(new ApiError('fixture', status)), true)
  for (const status of [200, 400, 401, 403, 404, 409, 422])
    assert.equal(recovery.isRetryableAiImageError(new ApiError('fixture', status)), false)
  assert.equal(recovery.isRetryableAiImageError(new Error('programming error')), false)
  assert.doesNotMatch(recovery.aiImageErrorMessage(new Error('internal stack details')), /internal/)
  for (const status of [401, 403, 404])
    assert.doesNotMatch(
      recovery.aiImageErrorMessage(
        new ApiError(`Request failed with status code ${status}`, status),
      ),
      /Request failed/,
    )
})

test('a read deadline bounds the next request and stops additional reads', async (t) => {
  clock(t)
  let remaining,
    reads = 0
  const controller = new AbortController()
  const work = recovery.readAiImageWithRetry(
    (budget) => {
      reads++
      remaining = budget
      throw new ApiError('timeout')
    },
    { signal: controller.signal, deadline: Date.now() + 100, onRetry() {} },
  )
  const rejection = assert.rejects(work, recovery.AiImagePendingError)
  await advance(t, 100)
  await rejection
  assert.equal(remaining, 100)
  assert.equal(reads, 1)
})

test('API wrappers pass cancellation and bounded read timeouts without auto-retrying writes', async () => {
  const calls = []
  const apiClient = {
    post: async (...args) => {
      calls.push(['POST', ...args])
      return { data: { success: true, data: job() } }
    },
    get: async (...args) => {
      calls.push(['GET', ...args])
      return { data: { success: true, data: job() } }
    },
  }
  const { unwrap } = load('src/shared/api/unwrap.ts')
  const api = load('src/entities/ai-image/api/aiImage.api.ts', {
    '@/shared/api': { apiClient, API_VERSION: '/api/v2', unwrap },
  })
  const signal = new AbortController().signal
  await api.uploadAiImageSource(input.file, { signal })
  await api.requestAiImageGeneration({ filterId: 'fixture', inputObjectKey: 'source' }, { signal })
  await api.getAiImageGeneration('fixture-job', { signal, timeout: 123 })
  await api.getAiImageGeneration('fixture-job')
  await api.getAiImageGenerationImage('fixture-job', { signal, timeout: 234 })
  assert.equal(calls[0][3].signal, signal)
  assert.equal(calls[0][3].timeout, 60000)
  assert.equal(calls[1][3].signal, signal)
  assert.equal(calls[2][2].signal, signal)
  assert.equal(calls[2][2].timeout, 123)
  assert.equal(calls[3][2].timeout, 10000)
  assert.equal(calls[4][2].timeout, 234)
  assert.equal(calls[4][2].responseType, 'blob')
})

test('archive refreshes only while pending jobs exist and never enables anonymous reads', () => {
  const { aiImageQueries } = load('src/entities/ai-image/api/aiImage.queries.ts', {
    '@tanstack/react-query': { queryOptions: (config) => config },
    '@/shared/api': { createQuery: (config) => config, STALE_TIME: { REALTIME: 0 } },
    './aiImage.api': {},
  })
  const config = aiImageQueries.myGenerations(false)
  assert.equal(config.enabled, false)
  for (const status of ['pending', 'queued', 'processing'])
    assert.equal(config.refetchInterval({ state: { data: [job(status)] } }), 5000)
  for (const data of [undefined, [], [job('succeeded')], [job('failed')]])
    assert.equal(config.refetchInterval({ state: { data } }), false)
})

test(
  'the actual Axios client recovers a timed-out HTTP status response without a second POST',
  { timeout: 12000 },
  async () => {
    const http = require('node:http')
    const axios = require('axios')
    const calls = []
    let reads = 0
    const server = http.createServer(async (req, res) => {
      calls.push({ method: req.method, path: req.url })
      for await (const _ of req) {
        /* Drain upload bytes before sending the response. */
      }
      if (req.url.endsWith('/image')) {
        res.setHeader('Content-Type', 'image/png')
        res.end('actual-result-bytes')
        return
      }
      if (req.method === 'GET' && ++reads === 1) return
      res.setHeader('Content-Type', 'application/json')
      const data = req.url.endsWith('/source')
        ? { inputObjectKey: 'ai-image/source/fixture.png' }
        : job(req.method === 'POST' ? 'queued' : 'succeeded')
      res.end(JSON.stringify({ success: true, data }))
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
    let hook
    try {
      const { apiClient } = load('src/shared/api/client.ts', {
        axios,
        './unwrap': { ApiError },
        './token': { getAccessToken: () => null },
        '@/shared/lib/authSessionLifecycle': {
          getAuthSessionGeneration: () => 1,
          isAuthSessionCurrent: () => true,
        },
        '@/shared/lib/authSessionRecovery': {
          refreshAuthSession: async () => {
            throw new Error('unexpected refresh')
          },
        },
        '@/shared/config/apiBaseUrl': {
          getApiBaseUrl: () => `http://127.0.0.1:${server.address().port}`,
        },
      })
      apiClient.defaults.proxy = false
      // Shorten only the fixture's timeout; production read limits are asserted above.
      apiClient.interceptors.request.use((config) => {
        if (config.method === 'get') config.timeout = 50
        return config
      })
      const { unwrap } = load('src/shared/api/unwrap.ts')
      const api = load('src/entities/ai-image/api/aiImage.api.ts', {
        '@/shared/api': { apiClient, API_VERSION: '/api/v2', unwrap },
      })
      hook = mount({
        upload: api.uploadAiImageSource,
        request: api.requestAiImageGeneration,
        status: api.getAiImageGeneration,
        image: api.getAiImageGenerationImage,
      })
      const result = await hook.render().transform(input)
      assert.equal(hook.render().phase, 'done')
      assert.equal(await result.file.text(), 'actual-result-bytes')
      assert.equal(
        calls.filter((call) => call.method === 'POST' && call.path.endsWith('/generation')).length,
        1,
      )
      assert.equal(reads, 2)
    } finally {
      hook?.unmount()
      server.closeAllConnections()
      await new Promise((resolve) => server.close(resolve))
    }
  },
)

function studioMarkup(phase, canResume = true, props = {}) {
  const React = require('react')
  const { renderToStaticMarkup } = require('react-dom/server')
  const { AiFilterStudio } = load('src/features/ai-image/ui/AiFilterStudio.tsx', {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/image': { default: () => null },
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
    'next/navigation': { useRouter: () => ({ push() {} }) },
    '@tanstack/react-query': {
      useQuery: () => ({ data: [] }),
      useQueryClient: () => ({ invalidateQueries() {} }),
    },
    '@/entities/ai-image': { aiImageQueries: { myGenerations: () => ({ queryKey: [] }) } },
    '@/features/playground-pet/ui/PetResultLink': { PetResultLink: () => null },
    '@/shared/assets': { PawPrintIcon: () => null },
    '@/shared/lib/fonts': { cafe24Proup: { className: 'fixture-font' } },
    '@/shared/config/playground': load('src/shared/config/playground.ts'),
    '@/shared/lib/cn': { cn: (...args) => args.filter(Boolean).join(' ') },
    '@/shared/lib/preparePhoto': {},
    '@/shared/ui': {
      Button: ({ children }) => React.createElement('button', null, children),
      ComposerSectionHeading: ({ children }) => React.createElement('h2', null, children),
      buttonVariants: () => '',
    },
    '@/shared/ui/PhotoUploadField': { PhotoUploadField: () => null },
    '../lib/aiImageFile': {},
    '../lib/pendingCommunityPhoto': {},
    './AiPostShareChoice': {},
    '../lib/useAiPixelFilter': {
      useAiPixelFilter: () => ({
        filters: [{ filterId: 'fixture', name: '포퐁 도트 초상화' }],
        selectedFilterId: 'fixture',
        phase,
        canResume,
        isWorking: phase === 'reconnecting',
        error: '아직 결과를 확인하지 못했어요. 보관함을 확인해 주세요.',
      }),
    },
    './AiPhotoArchive': { AiPhotoArchive: () => null },
    './BeforeAfterCompare': {},
  })
  return renderToStaticMarkup(React.createElement(AiFilterStudio, { isLoggedIn: true, ...props }))
}

test('pending feedback offers read-only recovery and the archive instead of another generation button', () => {
  const markup = studioMarkup('pending')
  assert.match(markup, /결과 다시 확인/)
  assert.match(markup, /보관함 확인/)
  assert.match(markup, /\/home\?tab=ai-photos/)
  assert.doesNotMatch(markup, /포퐁 도트 초상화 씌우기|timeout of|role="alert"/)
  assert.doesNotMatch(studioMarkup('pending', false), /결과 다시 확인/)
})

test('reconnecting feedback explains the existing job and does not claim a generation failure', () => {
  const markup = studioMarkup('reconnecting')
  assert.match(markup, /같은 사진의 결과를 다시 확인/)
  assert.match(markup, /생성 횟수를 추가로 쓰지 않/)
  assert.doesNotMatch(markup, /timeout of|role="alert"/)
})

test('before billing launch the studio shows the free allowance without credit purchase navigation', () => {
  const markup = studioMarkup('idle', true, {
    allowance: { remaining: 0, freeRemaining: 0, dailyFreeLimit: 3, enabled: true },
  })
  assert.match(markup, /오늘 무료 0\/3회/)
  assert.match(markup, /오늘 만들 수 있는 횟수를 모두 사용했어요/)
  assert.doesNotMatch(markup, /이용권|href="\/playground"/)
})
