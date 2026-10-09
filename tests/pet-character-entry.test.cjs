const { test } = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadModule } = require('./helpers/load-module.cjs')

const sourceJobId = '0123456789abcdef01234567'
const jsx = require('react/jsx-runtime')
const Link = ({ children, ...props }) => React.createElement('a', props, children)

function resultEntry({
  config = { data: { enabled: true } },
  eligibility = { data: false },
  session = { scope: 'owner' },
} = {}) {
  const queries = []
  const { PetResultLink } = loadModule('src/features/playground-pet/ui/PetResultLink.tsx', {
    '@/shared/lib/cn': { cn: (...args) => args.filter(Boolean).join(' ') },
    'react/jsx-runtime': jsx,
    'next/link': { default: Link },
    '@tanstack/react-query': {
      useQuery: (options) => {
        queries.push(options)
        return queries.length === 1 ? config : eligibility
      },
    },
    '@/entities/playground-pet': { isEligiblePetImage: async () => eligibility.data },
    '@/shared/ui/Button': { buttonVariants: () => '' },
    '../lib/usePetSession': {
      usePetSession: () => session,
      inPetSession: (_, request) => request(),
    },
    '../lib/usePetController': { petConfigOptions: { queryKey: ['config'] } },
  })
  const tree = PetResultLink({ sourceJobId })
  return { tree, markup: tree ? renderToStaticMarkup(tree) : '', queries }
}

test('검증된 캐릭터는 새 생성 없이 바로 연결하는 경로로 안내함', () => {
  const { markup } = resultEntry({ eligibility: { data: true } })
  assert.match(markup, new RegExp(`/playground/pet\\?sourceJobId=${sourceJobId}`))
  assert.match(markup, /이 캐릭터로 시작하기/)
  assert.doesNotMatch(markup, /1회|전신|purpose=/)
})

test('일반 AI 사진은 캐릭터 만들기로 안내하고 생성 전 사용 횟수를 설명함', () => {
  const { markup } = resultEntry()
  assert.match(markup, /이 사진으로 캐릭터 만들기/)
  assert.match(markup, new RegExp(`purpose=pet-sprite-v1&amp;sourceJobId=${sourceJobId}`))
  assert.match(markup, /만들기를 누르면 AI 이용 횟수 1회/)
  assert.doesNotMatch(markup, /전신|\/playground\/pet/)
})

test('공개 잠금과 비로그인 및 검증 대기나 오류 상태에서는 제작 진입을 노출하지 않음', () => {
  for (const options of [
    { config: { data: { enabled: false } } },
    { config: { data: { enabled: true }, isError: true } },
    { session: null },
    { eligibility: { data: false, isPending: true } },
    { eligibility: { data: false, isError: true } },
    { eligibility: { data: undefined } },
  ])
    assert.equal(resultEntry(options).tree, null)
  assert.equal(resultEntry({ session: null }).queries[1].enabled, false)
  assert.equal(resultEntry({ config: { data: { enabled: false } } }).queries[1].enabled, false)
})

test('제작 페이지는 캐릭터 모드의 올바른 작업 ID만 사진 선택으로 전달함', async () => {
  const { default: Page } = loadModule('src/app/(main)/ai-filter/page.tsx', {
    'react/jsx-runtime': jsx,
    '@/shared/lib/metadata': { createPageMetadata: (value) => value },
    './_ui/AiFilterContent': { AiFilterContent: () => null },
  })
  const page = (params) => Page({ searchParams: Promise.resolve(params) })
  const valid = await page({ purpose: 'pet-sprite-v1', sourceJobId })
  assert.equal(valid.props.gameCharacter, true)
  assert.equal(valid.props.sourceJobId, sourceJobId)
  for (const params of [
    { sourceJobId },
    { purpose: 'photo', sourceJobId },
    { purpose: 'pet-sprite-v1', sourceJobId: '../../another-route' },
    { purpose: 'pet-sprite-v1', sourceJobId: [sourceJobId] },
  ])
    assert.equal((await page(params)).props.sourceJobId, undefined)
})

test('제작 화면은 사진과 계정 세션별로 분리하고 공개 잠금을 유지함', () => {
  let config = { data: { enabled: true } }
  let scope = 'owner-session'
  const billing = { memberId: 'owner', generation: 3, refresh: async () => {}, account: {} }
  const { AiFilterContent } = loadModule('src/app/(main)/ai-filter/_ui/AiFilterContent.tsx', {
    react: { useEffect() {} },
    'react/jsx-runtime': jsx,
    '@tanstack/react-query': { useQuery: () => config },
    '@/features/ai-image': { AiFilterStudio: () => null },
    '@/features/playground-pet': { PetResultLink: () => null },
    '@/features/auth': { useMe: () => ({ isLoggedIn: true }) },
    '@/features/in-app-purchase': { usePurchases: () => billing },
    '@/entities/iap': { featureAllowance: () => undefined },
    '@/entities/playground-pet': { petConfigOptions: {} },
    '@/shared/lib/useAuthReadSession': { useAuthReadSession: () => ({ scope }) },
  })
  const props = { gameCharacter: true, sourceJobId }
  const first = AiFilterContent(props)
  assert.equal(first.props.sourceJobId, sourceJobId)
  assert.equal(first.props.sessionGeneration, 3)
  scope = 'new-session'
  assert.notEqual(AiFilterContent(props).key, first.key)
  scope = 'owner-session'
  billing.generation++
  assert.notEqual(AiFilterContent(props).key, first.key)
  billing.memberId = 'other-owner'
  assert.notEqual(AiFilterContent(props).key, first.key)
  config = { data: { enabled: false } }
  assert.equal(AiFilterContent(props).type, 'p')
  config = { data: { enabled: true }, isError: true }
  assert.equal(AiFilterContent(props).type, 'p')
  assert.equal(AiFilterContent({ sourceJobId }).props.sourceJobId, undefined)
})

function studio(remaining = 1, isLoggedIn = true) {
  const calls = { start: [], source: [] }
  const file = new File(['selected-ai-photo'], 'selected.png', { type: 'image/png' })
  const Button = () => null
  const { AiFilterStudio } = loadModule('src/features/ai-image/ui/AiFilterStudio.tsx', {
    react: {
      useState: (value) => [value, () => {}],
      useRef: () => ({ current: null }),
      useEffect() {},
    },
    'react/jsx-runtime': jsx,
    'next/image': { default: () => null },
    'next/link': { default: Link },
    'next/navigation': { useRouter: () => ({ push() {} }) },
    '@tanstack/react-query': { useQueryClient: () => ({ invalidateQueries() {} }) },
    '@/entities/ai-image': { aiImageQueries: { myGenerations: () => ({ queryKey: [] }) } },
    '@/features/playground-pet/ui/PetResultLink': { PetResultLink: () => null },
    '@/shared/assets': { PawPrintIcon: () => null },
    '@/shared/config/playground': { PLAYGROUND_BILLING_ENABLED: false },
    '@/shared/lib/fonts': { cafe24Proup: { className: '' } },
    '@/shared/lib/cn': { cn: (...args) => args.join(' ') },
    '@/shared/lib/authReadSession': { isAuthReadSessionCurrent: () => true },
    '@/shared/lib/useViewportPosition': { useViewportPosition: () => [() => {}, 'inside'] },
    '@/shared/ui/Skeleton': { SkeletonBlock: () => null },
    '@/shared/ui': { Button, ComposerSectionHeading: () => null, buttonVariants: () => '' },
    '@/shared/ui/PhotoUploadField': { PhotoUploadField: () => null },
    '../lib/aiImageFile': {},
    '../lib/useAiSourcePhoto': {
      useAiSourcePhoto: (props) => {
        calls.source.push(props)
        return {
          photo: { file, url: 'blob:fixture', fromArchive: true },
          preparing: false,
          clearPhoto() {},
        }
      },
    },
    '../lib/pendingCommunityPhoto': {},
    './AiPostShareChoice': {},
    '../lib/useAiPixelFilter': {
      useAiPixelFilter: () => ({
        filters: [{ filterId: 'filter', name: '도트' }],
        selectedFilterId: 'filter',
        phase: 'idle',
        start: async (file) => {
          calls.start.push(file)
          return null
        },
      }),
    },
    './AiPhotoArchive': { AiPhotoArchive: () => null },
    './BeforeAfterCompare': {},
  })
  const tree = AiFilterStudio({
    gameCharacter: true,
    sourceJobId,
    sessionGeneration: 3,
    isLoggedIn,
    allowance: { remaining, enabled: true, freeRemaining: remaining, dailyFreeLimit: 3 },
  })
  const nodes = []
  function visit(node) {
    if (Array.isArray(node)) return node.forEach(visit)
    if (!node?.props) return
    nodes.push(node)
    visit(node.props.children)
  }
  visit(tree)
  return { calls, file, nodes, Button }
}

test('보관함 사진을 가져오는 것만으로 생성하지 않고 만들기 클릭 후에만 해당 사진을 사용함', async () => {
  const view = studio()
  assert.deepEqual(view.calls.start, [])
  assert.deepEqual(view.calls.source, [{ sourceJobId, enabled: true, generation: 3 }])
  const button = view.nodes.find(
    (node) => node.type === view.Button && node.props.children === '캐릭터 만들기 · 1회 사용',
  )
  assert.equal(button.props.disabled, false)
  button.props.onClick()
  await Promise.resolve()
  assert.deepEqual(view.calls.start, [view.file])
})

test('횟수가 없으면 제작 버튼을 잠그고 비로그인 후 복귀할 사진 선택을 보존함', () => {
  const empty = studio(0)
  const button = empty.nodes.find(
    (node) => node.type === empty.Button && node.props.width === 'full',
  )
  assert.equal(button.props.disabled, true)
  button.props.onClick()
  assert.deepEqual(empty.calls.start, [])
  const loggedOut = studio(1, false)
  const link = loggedOut.nodes.find((node) => node.props.href?.startsWith('/login?'))
  assert.equal(
    new URL(link.props.href, 'https://example.test').searchParams.get('returnUrl'),
    `/ai-filter?purpose=pet-sprite-v1&sourceJobId=${sourceJobId}`,
  )
})
