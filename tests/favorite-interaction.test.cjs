const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const query = require('@tanstack/react-query')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

function load(file, dependencies = {}) {
  const module = { exports: {} }
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  }).outputText
  new Function('require', 'module', 'exports', source)(
    (name) => (name in dependencies ? dependencies[name] : require(name)),
    module,
    module.exports,
  )
  return module.exports
}

function renderFavoriteButton(props) {
  const { tv } = load('src/shared/lib/tv.ts', {
    './cn': load('src/shared/lib/cn.ts'),
  })
  const { ToggleIconButton } = load('src/shared/ui/ToggleIconButton.tsx', {
    '@/shared/lib/tv': { tv },
  })
  const { FavoriteIcon } = load('src/shared/assets/icons/FavoriteIcon.tsx', {
    './PixelActionIcon': load('src/shared/assets/icons/PixelActionIcon.tsx'),
  })
  return renderToStaticMarkup(
    React.createElement(ToggleIconButton, {
      icon: FavoriteIcon,
      hasFillState: true,
      onClick: () => {},
      'aria-label': '관심',
      ...props,
    }),
  )
}

test('heart hover is removed without removing other shared action feedback', () => {
  const heart = renderFavoriteButton({ tone: 'onImage', size: 'md' })
  assert.doesNotMatch(heart, /hover:/)
  assert.match(heart, /text-brand/)
  assert.doesNotMatch(heart, /text-base-white/)
  assert.match(renderFavoriteButton({ pressed: true }), /text-pressed-favorite/)
  // The same control also renders non-heart actions, such as ShareButton.
  assert.match(renderFavoriteButton({ hasFillState: false }), /hover:bg-brand-subtle/)
  assert.match(renderFavoriteButton({ pressedTone: 'bookmark' }), /hover:bg-brand-subtle/)
})

test('hearts share the action grid at both medium and large sizes', () => {
  const medium = renderFavoriteButton({ size: 'md' })
  assert.match(medium, /width="30" height="30" viewBox="0 0 30 30"/)
  assert.match(medium, /stroke-width="1.5"/)
  assert.doesNotMatch(medium, /size-8/)
  const large = renderFavoriteButton({ size: 'lg' })
  assert.match(large, /width="48" height="48" viewBox="0 0 30 30"/)
  assert.doesNotMatch(large, /width="30"/)
  const responsive = renderFavoriteButton({ size: 'responsive' })
  assert.match(responsive, /width="30"[^>]+pc:hidden/)
  assert.match(responsive, /width="48"[^>]+hidden pc:block/)
  assert.equal((responsive.match(/aria-hidden="true"/g) || []).length, 2)
})

const patch = load('src/shared/lib/patchCachedItem.ts')
const breeder = (id, selected = false) => ({
  breederId: id,
  isFavorited: selected,
  favoriteCount: 3,
  nickname: id,
})
const pages = (items) => ({
  pages: [{ items, pagination: { totalItems: items.length, currentPage: 1 } }],
  pageParams: [1],
})
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
async function until(predicate) {
  for (let i = 0; i < 30; i++) {
    if (predicate()) return
    await new Promise(setImmediate)
  }
  assert.fail('mutation did not reach the expected state')
}
function setup(api) {
  const client = new query.QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } },
  })
  const hooks = load('src/features/adopter/api/adopter.mutations.ts', {
    '@tanstack/react-query': {
      ...query,
      useQueryClient: () => client,
      useMutation: (options) => {
        const observer = new query.MutationObserver(client, options)
        return { mutateAsync: (variables) => observer.mutate(variables) }
      },
    },
    '@/entities/adopter': {
      adopterQueries: {
        all: () => ['adopter'],
        profile: () => ({ queryKey: ['adopter', 'profile'] }),
      },
    },
    '@/entities/breeder': { breederQueries: { all: () => ['breeder'] } },
    '@/entities/profile': { profileQueries: { all: () => ['profile'] } },
    '@/entities/application': {},
    '@/entities/community': {},
    '@/shared/lib/patchCachedItem': patch,
    './adopter.api': { addFavorite: api, removeFavorite: api },
  })
  return { client, ...hooks }
}

test('star updates popular, paginated and profile views immediately without refetching them', async () => {
  const request = deferred()
  const { client, useAddFavorite } = setup(() => request.promise)
  const popular = ['breeder', 'popular']
  const explore = ['breeder', 'explore', {}]
  const profile = ['breeder', 'public-profile', 'a']
  client.setQueryData(popular, [breeder('a'), breeder('b')])
  client.setQueryData(explore, pages([breeder('a')]))
  client.setQueryData(profile, breeder('a'))
  let requests = 0
  const observer = new query.QueryObserver(client, {
    queryKey: popular,
    queryFn: async () => {
      requests++
      return [breeder('a')]
    },
  })
  const states = []
  const unsubscribe = observer.subscribe((state) => states.push(state))
  try {
    const pending = useAddFavorite().mutateAsync('a')
    await until(() => client.getQueryData(profile).isFavorited)
    assert.equal(client.getQueryData(popular)[0].isFavorited, true)
    assert.equal(client.getQueryData(explore).pages[0].items[0].isFavorited, true)
    assert.equal(client.getQueryData(popular)[0].favoriteCount, 4)
    assert.equal(client.getQueryData(popular)[1].isFavorited, false)
    request.resolve({ message: 'saved' })
    await pending
    assert.equal(requests, 0)
    assert.ok(states.length > 0)
    assert.ok(states.every((state) => state.data[0].isFavorited && !state.isFetching))
    assert.equal(client.getQueryState(popular).isInvalidated, true)
  } finally {
    unsubscribe()
    client.clear()
  }
})

test('saving a star preserves the public home role decision while refreshing my profile', async () => {
  const { client, useAddFavorite } = setup(async () => ({ message: 'saved' }))
  let publicRequests = 0,
    privateRequests = 0
  const publicObserver = new query.QueryObserver(client, {
    queryKey: ['adopter', 'public-profile', 'breeder-a'],
    queryFn: async () => {
      publicRequests++
      throw Object.assign(new Error('This account is a breeder'), { status: 400 })
    },
  })
  const states = []
  const unsubscribePublic = publicObserver.subscribe((state) => states.push(state.status))
  const privateObserver = new query.QueryObserver(client, {
    queryKey: ['adopter', 'profile'],
    initialData: { favoriteCount: 0 },
    queryFn: async () => {
      privateRequests++
      return { favoriteCount: 1 }
    },
  })
  const unsubscribePrivate = privateObserver.subscribe(() => {})
  try {
    await until(() => publicObserver.getCurrentResult().isError)
    states.length = 0
    await useAddFavorite().mutateAsync('breeder-a')
    assert.equal(publicRequests, 1, 'the public home must not repeat its role lookup')
    assert.ok(
      states.every((state) => state === 'error'),
      'the breeder home must stay mounted',
    )
    assert.equal(publicObserver.getCurrentResult().status, 'error')
    assert.equal(privateRequests, 1)
    assert.equal(client.getQueryData(['adopter', 'profile']).favoriteCount, 1)
  } finally {
    unsubscribePublic()
    unsubscribePrivate()
    client.clear()
  }
})

test('failed star restores only that breeder and preserves a concurrent successful star', async () => {
  const first = deferred(),
    second = deferred()
  const { client, useAddFavorite } = setup((id) => (id === 'a' ? first.promise : second.promise))
  const key = ['breeder', 'popular']
  client.setQueryData(key, [breeder('a'), breeder('b')])
  try {
    const pendingA = useAddFavorite()
      .mutateAsync('a')
      .catch((error) => error)
    await until(() => client.getQueryData(key)[0].isFavorited)
    const pendingB = useAddFavorite().mutateAsync('b')
    await until(() => client.getQueryData(key)[1].isFavorited)
    second.resolve({ message: 'saved' })
    await pendingB
    first.reject(new Error('network unavailable'))
    assert.equal((await pendingA).message, 'network unavailable')
    assert.deepEqual(
      client
        .getQueryData(key)
        .map(({ isFavorited, favoriteCount }) => ({ isFavorited, favoriteCount })),
      [
        { isFavorited: false, favoriteCount: 3 },
        { isFavorited: true, favoriteCount: 4 },
      ],
    )
  } finally {
    client.clear()
  }
})

test('successful star also synchronizes a profile populated while the request was pending', async () => {
  const request = deferred()
  const { client, useAddFavorite } = setup(() => request.promise)
  const popular = ['breeder', 'popular']
  const profile = ['breeder', 'public-profile', 'a']
  client.setQueryData(popular, [breeder('a')])
  try {
    const pending = useAddFavorite().mutateAsync('a')
    await until(() => client.getQueryData(popular)[0].isFavorited)
    client.setQueryData(profile, breeder('a'))
    request.resolve({ message: 'saved' })
    await pending
    assert.equal(client.getQueryData(profile).isFavorited, true)
    assert.equal(client.getQueryData(popular)[0].isFavorited, true)
  } finally {
    client.clear()
  }
})

test('a profile still loading at save completion restarts once and ignores the old response', async () => {
  const request = deferred(),
    oldProfile = deferred()
  const { client, useAddFavorite } = setup(() => request.promise)
  const popular = ['breeder', 'popular']
  const profile = ['breeder', 'public-profile', 'a']
  client.setQueryData(popular, [breeder('a')])
  let profileRequests = 0
  const observer = new query.QueryObserver(client, {
    queryKey: profile,
    queryFn: () =>
      ++profileRequests === 1 ? oldProfile.promise : Promise.resolve(breeder('a', true)),
  })
  let unsubscribe = () => {}
  try {
    const pending = useAddFavorite().mutateAsync('a')
    await until(() => client.getQueryData(popular)[0].isFavorited)
    unsubscribe = observer.subscribe(() => {})
    await until(() => profileRequests === 1)
    request.resolve({ message: 'saved' })
    await pending
    assert.equal(profileRequests, 2)
    assert.equal(client.getQueryData(profile).isFavorited, true)
    oldProfile.resolve(breeder('a'))
    await new Promise(setImmediate)
    assert.equal(client.getQueryData(profile).isFavorited, true)
  } finally {
    unsubscribe()
    client.clear()
  }
})

test('two mounted buttons for one breeder share a pending request and cannot corrupt rollback', async () => {
  const request = deferred()
  let requests = 0
  const { client, useAddFavorite, useRemoveFavorite } = setup(() =>
    ++requests === 1 ? request.promise : Promise.resolve({ message: 'saved' }),
  )
  const key = ['breeder', 'public-profile', 'a']
  client.setQueryData(key, breeder('a'))
  try {
    const pendingAdd = useAddFavorite().mutateAsync('a')
    const caughtAdd = pendingAdd.catch((error) => error)
    await until(() => client.getQueryData(key).isFavorited)
    const pendingRemove = useRemoveFavorite().mutateAsync('a')
    const caughtRemove = pendingRemove.catch((error) => error)
    assert.equal(pendingAdd, pendingRemove)
    assert.equal(requests, 1)
    request.reject(new Error('save failed'))
    await Promise.all([caughtAdd, caughtRemove])
    assert.equal(client.getQueryData(key).isFavorited, false)
    assert.equal(client.getQueryData(key).favoriteCount, 3)
    await useAddFavorite().mutateAsync('a')
    assert.equal(requests, 2)
    assert.equal(client.getQueryData(key).isFavorited, true)
  } finally {
    client.clear()
  }
})

test('failed removal keeps the favorite card mounted and restores its selection', async () => {
  const request = deferred()
  const { client, useRemoveFavorite } = setup(() => request.promise)
  const key = ['profile', 'favoriteBreeders', 20]
  client.setQueryData(key, pages([breeder('a', true), breeder('b', true)]))
  try {
    const pending = useRemoveFavorite()
      .mutateAsync('a')
      .catch((error) => error)
    await until(() => !client.getQueryData(key).pages[0].items[0].isFavorited)
    assert.deepEqual(
      client.getQueryData(key).pages[0].items.map((item) => item.breederId),
      ['a', 'b'],
    )
    request.reject(new Error('save failed'))
    await pending
    assert.equal(client.getQueryData(key).pages[0].items[0].isFavorited, true)
    assert.equal(client.getQueryData(key).pages[0].items[0].favoriteCount, 3)
  } finally {
    client.clear()
  }
})

test('successful removal drops only the saved card from every loaded page-size cache', async () => {
  const { client, useRemoveFavorite } = setup(async () => ({ message: 'removed' }))
  const keys = [10, 20].map((size) => ['profile', 'favoriteBreeders', size])
  keys.forEach((key) => client.setQueryData(key, pages([breeder('a', true), breeder('b', true)])))
  try {
    await useRemoveFavorite().mutateAsync('a')
    keys.forEach((key) => {
      assert.deepEqual(
        client.getQueryData(key).pages[0].items.map((item) => item.breederId),
        ['b'],
      )
      assert.equal(client.getQueryState(key).isInvalidated, true)
    })
  } finally {
    client.clear()
  }
})

for (const fails of [false, true])
  test(`star ignores duplicate clicks and unlocks after ${fails ? 'failure' : 'success'} without observer callbacks`, async () => {
    const calls = []
    const requests = []
    const mutation = {
      isPending: false,
      mutateAsync: (...args) => {
        calls.push(args)
        const request = deferred()
        requests.push(request)
        return request.promise
      },
    }
    const { FavoriteBreederIconButton } = load(
      'src/app/(main)/home/_ui/FavoriteBreederIconButton.tsx',
      {
        react: { ...require('react'), useRef: (current) => ({ current }) },
        '@/shared/assets': { ProfileStarIcon: () => null },
        '@/features/adopter': { useAddFavorite: () => mutation, useRemoveFavorite: () => mutation },
        '@/shared/ui': { IconButton: 'button' },
      },
    )
    const button = FavoriteBreederIconButton({ breederId: 'a', isFavorited: false })
    const event = { preventDefault() {}, stopPropagation() {} }
    button.props.onClick(event)
    button.props.onClick(event)
    assert.equal(calls.length, 1)
    if (fails) requests[0].reject(new Error('save failed'))
    else requests[0].resolve({ message: 'saved' })
    await new Promise(setImmediate)
    button.props.onClick(event)
    assert.equal(calls.length, 2)
    requests[1].resolve({ message: 'saved' })
    await new Promise(setImmediate)
  })

for (const fails of [false, true])
  test(`heart ignores duplicate clicks and unlocks after ${fails ? 'failure' : 'success'} without observer callbacks`, async () => {
    const calls = []
    const requests = []
    const { useToggleAdoptionFavorite } = load('src/features/adoption/api/adoption.mutations.ts', {
      react: { useRef: (current) => ({ current }) },
      '@tanstack/react-query': {
        useQueryClient: () => ({}),
        useMutation: () => ({
          mutateAsync: (...args) => {
            calls.push(args)
            const request = deferred()
            requests.push(request)
            return request.promise
          },
        }),
      },
      '@/entities/adoption': {
        adoptionQueries: {
          all: () => ['adoption'],
          myFavoritesAll: () => ['adoption', 'favorites'],
        },
      },
      '@/shared/lib/patchCachedItem': patch,
      './adoption.api': {},
    })
    const { toggleFavorite } = useToggleAdoptionFavorite('pet-a', false)
    toggleFavorite()
    toggleFavorite()
    assert.equal(calls.length, 1)
    if (fails) requests[0].reject(new Error('save failed'))
    else requests[0].resolve({ message: 'saved' })
    await new Promise(setImmediate)
    toggleFavorite()
    assert.equal(calls.length, 2)
    requests[1].resolve({ message: 'saved' })
    await new Promise(setImmediate)
  })
