const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const http = require('node:http')
const ts = require('typescript')
const axios = require('axios')

const code = ts.transpileModule(
  fs.readFileSync('src/features/notification/model/useOpenNotification.ts', 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
).outputText

function harness(markAsRead = async () => {}) {
  const exports = {}
  const paths = []
  const cleanups = []
  const browser = { location: { href: 'https://pawpong.kr/notifications' } }
  const dependencies = {
    react: {
      useRef: (current) => ({ current }),
      useEffect: (effect) => cleanups.push(effect()),
    },
    'next/navigation': { useRouter: () => ({ push: (path) => paths.push(path) }) },
    '../api/notification.mutations': { useMarkAsRead: () => ({ mutateAsync: markAsRead }) },
  }
  new Function('exports', 'require', 'window', code)(exports, (name) => dependencies[name], browser)
  return { ...exports, paths, browser, cleanups }
}

const notification = (overrides = {}) => ({
  notificationId: 'notification-1',
  isRead: false,
  targetUrl: '/applications/application-1?view=received#details',
  ...overrides,
})

test('stored legacy notifications preserve their destination, query and fragment', () => {
  const { resolveNotificationTargetUrl: resolve } = harness()
  assert.equal(
    resolve('/applications/application-1?view=received#details'),
    '/activity/applications/application-1?view=received#details',
  )
  assert.equal(
    resolve('/applications/application-1/edit'),
    '/activity/applications/application-1/edit',
  )
  assert.equal(resolve('/applications'), '/activity')
  assert.equal(
    resolve('/activity/applications/application-1?view=sent'),
    '/activity/applications/application-1?view=sent',
  )
  assert.equal(resolve('/community/post/post-1'), '/community/post/post-1')
})

test('notification targets cannot open external or malformed URLs', () => {
  const { resolveNotificationTargetUrl: resolve } = harness()
  for (const target of [
    undefined,
    '',
    '//other.example/path',
    '/\\other.example',
    '/%2f%2fother.example',
    '/%5cother.example',
    '/\n/other.example',
    'https://other.example',
    'javascript:alert(1)',
    '/%invalid',
  ]) {
    assert.equal(resolve(target), null, String(target))
  }
})

test('unread PATCH completes before navigation can unload the document', async () => {
  let complete
  const reads = []
  const h = harness((id) => {
    reads.push(id)
    return new Promise((resolve) => {
      complete = resolve
    })
  })
  const open = h.useOpenNotification()
  const pending = open(notification())
  assert.deepEqual(reads, ['notification-1'])
  assert.deepEqual(h.paths, [])
  complete()
  await pending
  assert.deepEqual(h.paths, ['/activity/applications/application-1?view=received#details'])
})

test('a failed read still allows opening the notification and an already read item sends no PATCH', async () => {
  let attempts = 0
  const h = harness(async () => {
    attempts += 1
    throw new Error('Network Error')
  })
  const open = h.useOpenNotification()
  await open(notification())
  await open(notification({ isRead: true, targetUrl: '/community/post/post-1' }))
  assert.equal(attempts, 1)
  assert.deepEqual(h.paths, [
    '/activity/applications/application-1?view=received#details',
    '/community/post/post-1',
  ])
})

test('a slow earlier selection cannot replace the latest selected notification', async () => {
  const completions = new Map()
  const h = harness((id) => new Promise((resolve) => completions.set(id, resolve)))
  const open = h.useOpenNotification()
  const first = open(notification())
  const second = open(
    notification({ notificationId: 'notification-2', targetUrl: '/community/post/post-2' }),
  )
  completions.get('notification-2')()
  await second
  completions.get('notification-1')()
  await first
  assert.deepEqual(h.paths, ['/community/post/post-2'])
})

test('leaving the page or unmounting cancels delayed notification navigation', async () => {
  for (const leave of ['navigation', 'unmount']) {
    let complete
    const h = harness(
      () =>
        new Promise((resolve) => {
          complete = resolve
        }),
    )
    const pending = h.useOpenNotification()(notification())
    if (leave === 'navigation') h.browser.location.href = 'https://pawpong.kr/home'
    else h.cleanups.forEach((cleanup) => cleanup())
    complete()
    await pending
    assert.deepEqual(h.paths, [], leave)
  }
})

test(
  'notification selection waits for the actual Axios PATCH response',
  { timeout: 10000 },
  async () => {
    let receive
    let respond
    const received = new Promise((resolve) => {
      receive = resolve
    })
    const server = http.createServer((req, res) => {
      receive({ method: req.method, path: req.url })
      respond = () => {
        res.setHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify({
            success: true,
            data: {
              notificationId: 'notification-1',
              isRead: true,
              readAt: '2026-10-01T00:00:00Z',
            },
          }),
        )
      }
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

    const load = (file, dependencies) => {
      const output = {}
      const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      }).outputText
      new Function('exports', 'require', source)(output, (name) => dependencies[name])
      return output
    }

    try {
      const envelope = load('src/shared/api/unwrap.ts', {})
      const api = load('src/features/notification/api/notification.api.ts', {
        '@/shared/api': {
          ...envelope,
          API_VERSION: '/api/v2',
          apiClient: axios.create({
            baseURL: `http://127.0.0.1:${server.address().port}`,
            proxy: false,
          }),
        },
      })
      const h = harness(api.markAsRead)
      const pending = h.useOpenNotification()(notification())
      assert.deepEqual(await received, {
        method: 'PATCH',
        path: '/api/v2/notification/notification-1/read',
      })
      assert.deepEqual(h.paths, [])
      respond()
      await pending
      assert.deepEqual(h.paths, ['/activity/applications/application-1?view=received#details'])
    } finally {
      server.closeAllConnections()
      await new Promise((resolve) => server.close(resolve))
    }
  },
)
