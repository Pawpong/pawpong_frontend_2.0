const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const http = require('node:http')
const ts = require('typescript')
const axios = require('axios')

const jsx = (type, props) => ({ type, props })
const jsxRuntime = { jsx, jsxs: jsx, Fragment: 'Fragment' }

function load(file, dependencies) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  new Function('exports', 'require', code)(exports, (name) => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`)
    return dependencies[name]
  })
  return exports
}

function nodes(tree) {
  if (!tree || typeof tree !== 'object') return []
  if (Array.isArray(tree)) return tree.flatMap(nodes)
  return [tree, ...nodes(tree.props?.children)]
}

function bellHarness(api, records) {
  const states = []
  let cursor = 0
  const pending = []
  const paths = []
  const requestedFilters = []
  const mutations = {}
  const mutation = (fn, key) => {
    mutations[key] ??= {
      isPending: false,
      mutate(value, callbacks) {
        this.isPending = true
        pending.push(
          fn(value)
            .catch((error) => callbacks?.onError?.(error))
            .finally(() => {
              this.isPending = false
            }),
        )
      },
    }
    return mutations[key]
  }
  const { NotificationBell } = load('src/widgets/gnb/ui/NotificationBell.tsx', {
    'react/jsx-runtime': jsxRuntime,
    react: {
      useState(initial) {
        const index = cursor++
        if (!(index in states)) states[index] = initial
        return [
          states[index],
          (value) => {
            states[index] = value
          },
        ]
      },
      useRef: (current) => ({ current }),
      useCallback: (fn) => fn,
      useEffect() {},
    },
    'next/navigation': { useRouter: () => ({ push: (path) => paths.push(path) }) },
    '@tanstack/react-query': {
      useQuery: () => ({ data: records.filter((item) => !item.isRead).length }),
      useInfiniteQuery: ({ filter }) => {
        requestedFilters.push(filter)
        const items = records.filter(
          (item) => filter?.isRead === undefined || item.isRead === filter.isRead,
        )
        return { data: { pages: [{ items: items.slice(0, 20) }] }, hasNextPage: items.length > 20 }
      },
    },
    '@/shared/lib/cn': { cn: (...parts) => parts.filter(Boolean).join(' ') },
    '@/features/auth': { useAuthStatus: () => ({ isLoggedIn: true }) },
    '@/entities/notification': {
      NotificationListItem: 'NotificationListItem',
      notificationQueries: { unreadCount: () => ({}), list: (filter) => ({ filter }) },
    },
    '@/shared/lib/uniqueBy': { uniqueBy: (items) => items },
    '@/features/notification': {
      useOpenNotification: () => () => {},
      useMarkAsRead: () => mutation(api.markAsRead, 'one'),
      useMarkAllAsRead: () => mutation(api.markAllAsRead, 'all'),
      useDeleteNotification: () => assert.fail('The popup must never mount a delete mutation'),
      useDeleteAllNotifications: () => assert.fail('The popup must never mount bulk delete'),
    },
    '@/shared/api': { normalizeApiError: (error) => error },
    '@/shared/ui': {
      Button: 'Button',
      EmptyState: 'EmptyState',
      ActionSheetItem: 'ActionSheetItem',
    },
  })
  const render = () => {
    cursor = 0
    return nodes(NotificationBell({}))
  }
  render()
    .find((node) => node.props?.['aria-label'] === '알림')
    .props.onClick()
  return { render, requestedFilters, mutations, paths, flush: () => Promise.all(pending.splice(0)) }
}

async function fixture(t, { failRead = false, failDelete = false } = {}) {
  const control = { failRead, failDelete }
  const records = Array.from({ length: 26 }, (_, index) => ({
    notificationId: `notification-${index}`,
    title: `알림 ${index}`,
    isRead: index === 0,
  }))
  const requests = []
  const server = http.createServer((req, res) => {
    requests.push({ method: req.method, path: req.url })
    res.setHeader('Content-Type', 'application/json')
    if (
      (control.failRead && req.method === 'PATCH') ||
      (control.failDelete && req.method === 'DELETE')
    ) {
      res.writeHead(503)
      return res.end(JSON.stringify({ success: false, error: '다시 시도해 주세요.' }))
    }
    if (req.method === 'PATCH' && req.url.endsWith('/read-all')) {
      records.forEach((item) => {
        item.isRead = true
      })
      return res.end(JSON.stringify({ success: true, data: { updatedCount: 25 } }))
    }
    if (req.method === 'PATCH' && req.url.endsWith('/read')) {
      const id = req.url.split('/').at(-2)
      const item = records.find((entry) => entry.notificationId === id)
      item.isRead = true
      return res.end(JSON.stringify({ success: true, data: item }))
    }
    if (req.method === 'DELETE') {
      const id = req.url.split('/').at(-1)
      records.splice(
        records.findIndex((item) => item.notificationId === id),
        1,
      )
      return res.end(JSON.stringify({ success: true, data: null }))
    }
    res.writeHead(404)
    res.end()
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(async () => {
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
  })
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
  return { records, requests, api, control }
}

test('popup clear marks one unread notification read and preserves the center record', async (t) => {
  const f = await fixture(t)
  const h = bellHarness(f.api, f.records)
  const rows = h.render().filter((node) => node.type === 'NotificationListItem')
  assert.deepEqual(h.requestedFilters.at(-1), { isRead: false })
  assert.equal(rows.length, 20)
  assert.equal(rows[0].props.item.notificationId, 'notification-1')
  assert.equal(rows[0].props.onDelete, undefined)
  rows[0].props.onDismiss(rows[0].props.item)
  await h.flush()
  assert.deepEqual(f.requests, [
    { method: 'PATCH', path: '/api/v2/notification/notification-1/read' },
  ])
  assert.equal(f.records.length, 26)
  assert.equal(f.records[1].isRead, true)
  assert.ok(
    h
      .render()
      .filter((node) => node.type === 'NotificationListItem')
      .every((node) => node.props.item.notificationId !== 'notification-1'),
  )
  h.render()
    .find((node) => node.type === 'Button' && node.props.children === '알림 센터')
    .props.onClick()
  assert.deepEqual(h.paths, ['/notifications'])
})

test('clear all includes unloaded pages, disables duplicate actions and preserves all center records', async (t) => {
  const f = await fixture(t)
  const h = bellHarness(f.api, f.records)
  h.render()
    .find((node) => node.type === 'Button' && node.props.children === '모두 지우기')
    .props.onClick()
  assert.equal(
    h.render().find((node) => node.type === 'Button' && node.props.children === '지우는 중').props
      .disabled,
    true,
  )
  assert.ok(
    h
      .render()
      .filter((node) => node.type === 'NotificationListItem')
      .every((node) => node.props.dismissing),
  )
  await h.flush()
  assert.deepEqual(f.requests, [{ method: 'PATCH', path: '/api/v2/notification/read-all' }])
  assert.equal(f.records.length, 26)
  assert.ok(f.records.every((item) => item.isRead))
  assert.equal(
    h.render().find((node) => node.type === 'EmptyState').props.message,
    '새 알림이 없어요.',
  )
})

test('failed clearing keeps the notification visible and exposes a retryable error', async (t) => {
  const f = await fixture(t, { failRead: true })
  const h = bellHarness(f.api, f.records)
  const row = h.render().find((node) => node.type === 'NotificationListItem')
  row.props.onDismiss(row.props.item)
  await h.flush()
  assert.equal(f.records.length, 26)
  assert.equal(f.records[1].isRead, false)
  assert.ok(h.render().find((node) => node.props?.role === 'alert'))
  assert.equal(
    h.render().find((node) => node.type === 'NotificationListItem').props.dismissing,
    false,
  )
})

test('compact rows expose only non-destructive clearing; center retains its delete menu', () => {
  const { NotificationListItem } = load('src/entities/notification/ui/NotificationListItem.tsx', {
    'react/jsx-runtime': jsxRuntime,
    '@/shared/lib/cn': { cn: () => '' },
    '@/shared/lib/formatRelativeTime': { formatRelativeTime: () => '방금' },
    '@/shared/ui/OwnerActionsMenu': { OwnerActionsMenu: 'OwnerActionsMenu' },
    '@/shared/ui/IconButton': { IconButton: 'IconButton' },
    '@/shared/assets': { CloseIcon: 'CloseIcon' },
    '../model/notificationCategory': {
      notificationCategoryOf: () => null,
      notificationCategoryLabel: () => '',
    },
  })
  const item = { title: '새 알림' }
  let dismissed = 0
  let deleted = 0
  const props = { item, onSelect() {}, onDelete: () => deleted++, onDismiss: () => dismissed++ }
  const compact = nodes(NotificationListItem({ ...props, compact: true }))
  const clear = compact.find((node) => node.type === 'IconButton')
  assert.equal(clear.props['aria-label'], '새 알림 알림 지우기')
  clear.props.onClick()
  assert.equal(dismissed, 1)
  assert.equal(deleted, 0)
  assert.ok(!compact.some((node) => node.type === 'OwnerActionsMenu'))
  assert.ok(
    !nodes(NotificationListItem({ ...props, compact: true, onDismiss: undefined })).some(
      (node) => node.type === 'IconButton' || node.type === 'OwnerActionsMenu',
    ),
  )
  const center = nodes(NotificationListItem({ ...props, compact: false }))
  center.find((node) => node.type === 'OwnerActionsMenu').props.onDelete()
  assert.equal(deleted, 1)
})

test('center deletion reports failure in the confirmation dialog and succeeds on retry', async (t) => {
  const f = await fixture(t, { failDelete: true })
  const states = []
  let cursor = 0
  let pending
  const deleteMutation = {
    isPending: false,
    mutate(id, callbacks) {
      deleteMutation.isPending = true
      pending = f.api
        .deleteNotification(id)
        .then(() => callbacks.onSuccess())
        .catch((error) => callbacks.onError(error))
        .finally(() => {
          deleteMutation.isPending = false
        })
    },
  }
  const { NotificationsContent } = load(
    'src/app/(main)/notifications/_ui/NotificationsContent.tsx',
    {
      'react/jsx-runtime': jsxRuntime,
      react: {
        useState(initial) {
          const index = cursor++
          if (!(index in states)) states[index] = initial
          return [
            states[index],
            (value) => {
              states[index] = value
            },
          ]
        },
        useMemo: (fn) => fn(),
      },
      '@tanstack/react-query': {
        useQuery: () => ({ data: 25 }),
        useInfiniteQuery: () => ({ data: { pages: [{ items: f.records }] }, isPending: false }),
      },
      '@/entities/notification': {
        NOTIFICATION_CATEGORY_OPTIONS: [],
        NotificationListItem: 'NotificationListItem',
        notificationCategoryLabel: () => '',
        notificationQueries: { unreadCount: () => ({}), list: () => ({}) },
      },
      '@/features/notification': {
        useOpenNotification: () => () => {},
        useMarkAllAsRead: () => ({}),
        useDeleteNotification: () => deleteMutation,
        useDeleteAllNotifications: () => ({}),
      },
      '@/shared/assets': { PawPrintIcon: 'PawPrintIcon' },
      '@/shared/ui/Skeleton': { SkeletonBlock: 'SkeletonBlock' },
      '@/shared/api': { normalizeApiError: (error) => error },
      '@/shared/lib/dedupeBy': { dedupeBy: (items) => items },
      '@/shared/lib/infiniteList': {
        flattenPages: (data) => data.pages.flatMap((page) => page.items),
      },
      '@/shared/ui': Object.fromEntries(
        [
          'Button',
          'Chip',
          'Container',
          'CtaModal',
          'DeleteConfirmModal',
          'InfiniteScrollTrigger',
          'ListState',
          'NavigationBar',
        ].map((name) => [name, name]),
      ),
    },
  )
  const { DeleteConfirmModal } = load('src/shared/ui/DeleteConfirmModal.tsx', {
    'react/jsx-runtime': jsxRuntime,
    './CtaModal': { CtaModal: 'CtaModal' },
  })
  const render = () => {
    cursor = 0
    return nodes(NotificationsContent())
  }
  const modal = () => render().find((node) => node.type === 'DeleteConfirmModal').props
  render()
    .find((node) => node.type === 'NotificationListItem')
    .props.onDelete(f.records[0])
  assert.equal(modal().open, true)
  modal().onConfirm()
  assert.equal(modal().isPending, true)
  await pending
  assert.equal(f.records.length, 26)
  assert.equal(modal().open, true)
  const dialog = DeleteConfirmModal(modal())
  assert.equal(
    nodes(dialog.props.description).find((node) => node.props?.role === 'alert').props.children,
    '알림을 삭제하지 못했어요. 다시 시도해 주세요.',
  )
  f.control.failDelete = false
  modal().onConfirm()
  assert.equal(modal().errorMessage, null)
  await pending
  assert.equal(f.records.length, 25)
  assert.equal(modal().open, false)
  assert.deepEqual(
    f.requests,
    Array(2).fill({ method: 'DELETE', path: '/api/v2/notification/notification-0' }),
  )
})
