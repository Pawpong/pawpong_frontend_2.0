const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
function load(path, deps = {}) {
  const out = {}
  new Function(
    'exports',
    'require',
    ts.transpileModule(fs.readFileSync(path, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
  )(out, (id) => deps[id] ?? (id === 'zod' ? require('zod') : assert.fail(id)))
  return out
}
const { settlePurchase } = load('src/features/in-app-purchase/model/settlePurchase.ts')
const purchase = {
  platform: 'ios',
  productId: 'credits',
  transactionId: 'native-original',
  purchaseToken: 'private-receipt',
  state: 'purchased',
  transactionDate: 1,
}
function setup(overrides = {}) {
  const calls = []
  return {
    calls,
    isCurrent: () => true,
    verify: async (p) => {
      calls.push(['verify', p])
      return { finishable: true, consumable: true, purchase: { transactionId: 'server-renewal' } }
    },
    finish: async (...args) => {
      calls.push(['finish', ...args])
    },
    ...overrides,
  }
}
test('verification and grant precede finish; native transaction ID is preserved', async () => {
  const session = setup()
  assert.equal(await settlePurchase(purchase, session), 'finished')
  assert.deepEqual(
    session.calls.map((c) => c[0]),
    ['verify', 'finish'],
  )
  assert.deepEqual(session.calls[1], ['finish', 'native-original', true])
})
test('pending and unknown purchases never verify or finish', async () => {
  for (const state of ['pending', 'unknown']) {
    const session = setup()
    assert.equal(await settlePurchase({ ...purchase, state }, session), 'pending')
    assert.deepEqual(session.calls, [])
  }
})
test('missing receipt and switched session are rejected before sending credentials', async () => {
  const session = setup()
  await assert.rejects(settlePurchase({ ...purchase, purchaseToken: null }, session))
  await assert.rejects(settlePurchase(purchase, setup({ isCurrent: () => false })))
  assert.deepEqual(session.calls, [])
})
test('failed, incomplete verification and a session switch during verification never finish', async () => {
  for (const mode of ['failed', 'incomplete', 'switched']) {
    let current = true
    const session = setup({
      isCurrent: () => current,
      verify: async () => {
        if (mode === 'failed') throw new Error('rejected')
        if (mode === 'switched') current = false
        return { finishable: mode !== 'incomplete', consumable: false }
      },
    })
    if (mode === 'incomplete') assert.equal(await settlePurchase(purchase, session), 'verifying')
    else await assert.rejects(settlePurchase(purchase, session))
    assert.deepEqual(session.calls, [])
  }
})
test('finish failure retains granted status for later idempotent recovery', async () => {
  const session = setup({
    finish: async () => {
      throw new Error('offline')
    },
  })
  assert.equal(await settlePurchase(purchase, session), 'finish-pending')
  assert.equal(session.calls.length, 1)
})
test('malformed bridge messages are sanitized and cancellation never becomes a receipt', async () => {
  let reply = { status: 'cancelled' }
  const { nativeIap } = load('src/shared/lib/nativeIap.ts', {
    './nativeBridge': { requestNative: async () => reply },
    '../config/playground': { PLAYGROUND_BILLING_ENABLED: true },
  })
  const input = {
    productId: 'credits',
    productType: 'in-app',
    accountToken: '37e9e344-d494-4e6b-bb4c-e855dc221610',
  }
  assert.deepEqual(await nativeIap.purchase(input), { status: 'cancelled' })
  reply = { status: 'purchased', purchase: { ...purchase, state: 'pending' } }
  await assert.rejects(
    nativeIap.purchase(input),
    (error) => !error.message.includes('private-receipt'),
  )
  reply = { status: 'purchased', purchase: { ...purchase, productId: 'other-product' } }
  await assert.rejects(nativeIap.purchase(input))
})
test('Android prices keep the selected offer and show renewal terms, not the product default price', () => {
  const { purchaseOptions } = load('src/features/in-app-purchase/model/storeProducts.ts', {
    '@/shared/lib/nativeIap': {},
  })
  const options = purchaseOptions(
    {
      type: 'subs',
      displayPrice: 'misleading default',
      subscriptionOffers: [
        {
          offerToken: 'trial',
          phases: [
            { displayPrice: '₩0', period: 'P1W', cycles: 1, recurrenceMode: 2 },
            { displayPrice: '₩5,000', period: 'P1M', cycles: 0, recurrenceMode: 1 },
          ],
        },
      ],
    },
    'android',
  )
  assert.equal(options[0].offerToken, 'trial')
  assert.equal(options[0].price, '₩0 / 1주 (1회) → ₩5,000 / 1개월')
  assert.match(options[0].terms, /자동 갱신/)
  assert.deepEqual(
    purchaseOptions({ type: 'subs', offerTokens: ['legacy-no-terms'] }, 'android'),
    [],
  )
})
test('UI allowance respects authoritative balance, configured cost and disabled feature', () => {
  const { featureAllowance } = load('src/entities/iap/model/types.ts')
  const account = {
    creditBalances: [{ creditKey: 'shared', available: 7 }],
    features: [
      {
        featureKey: 'ai_image',
        creditKey: 'shared',
        creditCost: 3,
        freeRemaining: 1,
        dailyFreeLimit: 4,
        enabled: true,
      },
    ],
  }
  assert.equal(featureAllowance(account, 'ai_image').remaining, 3)
  account.features[0].enabled = false
  assert.equal(featureAllowance(account, 'ai_image').remaining, 0)
  assert.equal(featureAllowance(undefined, 'ai_image'), undefined)
})
test('verification HTTP body cannot include client grants or prices and does not replay under a new login', async () => {
  const calls = []
  const { iapApi } = load('src/entities/iap/api/iap.api.ts', {
    '@/shared/api': {
      API_VERSION: '/api/v2',
      apiClient: {
        post: async (...args) => {
          calls.push(args)
          throw new Error('stop before response')
        },
      },
    },
    '../model/types': {},
  })
  await assert.rejects(
    iapApi.verify({ ...purchase, price: 10, quantity: 999, userId: 'attacker' }, 'original-access'),
  )
  const [path, body, config] = calls[0]
  assert.equal(path, '/api/v2/iap/purchases/verify')
  assert.deepEqual(Object.keys(body).sort(), [
    'platform',
    'productId',
    'purchaseToken',
    'transactionId',
  ])
  assert.equal(config.headers.Authorization, 'Bearer original-access')
  assert.equal(config.skipAuthRefresh, true)
})

test('release lock blocks both credit and subscription purchases before any native message', async () => {
  const calls = []
  const { nativeIap } = load('src/shared/lib/nativeIap.ts', {
    '../config/playground': load('src/shared/config/playground.ts'),
    './nativeBridge': { requestNative: async (...args) => calls.push(args) },
  })
  for (const productType of ['in-app', 'subs']) {
    await assert.rejects(
      nativeIap.purchase({
        productId: 'credits',
        productType,
        accountToken: '37e9e344-d494-4e6b-bb4c-e855dc221610',
      }),
      /지금은 결제를 이용할 수 없어요/,
    )
  }
  assert.deepEqual(calls, [])
})

test('release lock keeps existing purchase recovery and transaction finalization available', async () => {
  const calls = []
  const { nativeIap } = load('src/shared/lib/nativeIap.ts', {
    '../config/playground': load('src/shared/config/playground.ts'),
    './nativeBridge': {
      requestNative: async (_capability, type) => {
        calls.push(type)
        return type === 'IAP_FINISH'
          ? { status: 'finished' }
          : { status: 'ok', purchases: [purchase] }
      },
    },
  })
  assert.equal((await nativeIap.purchases(true)).length, 1)
  await nativeIap.finish('native-original', true)
  assert.deepEqual(calls, ['IAP_RESTORE', 'IAP_FINISH'])
})

test('direct billing component renders no purchase UI and starts no billing hooks before launch', () => {
  const React = require('react')
  const { renderToStaticMarkup } = require('react-dom/server')
  const forbidden = () => assert.fail('billing hooks must not run while locked')
  const { PlaygroundBilling } = load('src/features/in-app-purchase/ui/PlaygroundBilling.tsx', {
    react: { useState: forbidden, useEffect: forbidden },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': {},
    '@tanstack/react-query': { useQuery: forbidden },
    '@/entities/iap': {},
    '@/shared/lib/nativeIap': {},
    '@/shared/ui': {},
    '@/shared/config/playground': load('src/shared/config/playground.ts'),
    './PurchaseProvider': { usePurchases: forbidden },
    '../model/storeProducts': {},
  })
  assert.equal(renderToStaticMarkup(React.createElement(PlaygroundBilling)), '')
})
