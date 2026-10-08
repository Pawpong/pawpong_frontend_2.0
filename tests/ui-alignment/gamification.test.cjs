const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadTypescript } = require('../helpers/load-typescript.cjs')
const { source } = require('./fixtures/alignment.fixture.cjs')

// 설정·레벨표 조회 상태를 바꿔 가며 안내 화면이 무엇을 보여주는지 확인한다.
function guide(configQuery, catalogQuery = { isPending: false, isError: false, data: undefined }) {
  const retried = []
  const { LevelGuideContent } = loadTypescript(
    'src/app/(main)/breeder-level/_ui/LevelGuideContent.tsx',
    {
      '@tanstack/react-query': {
        useQuery: (options) =>
          options.queryKey?.[1] === 'catalog'
            ? { ...catalogQuery, refetch: async () => retried.push('catalog') }
            : { ...configQuery, refetch: async () => retried.push('config') },
      },
      '@/entities/gamification': {
        activityConfigOptions: { queryKey: ['gamification', 'config'] },
        getActivityCatalog: async () => ({}),
        BreederLevelBadge: ({ level }) => createElement('span', null, `Lv.${level.value}`),
        ACTIVITY_LABELS: { post: '공개 이야기' },
        LEVEL_NOTICE: '활동 단계 안내 문구',
      },
      '@/shared/ui': {
        AsyncState: ({ status, message, action, onRetry }) =>
          createElement(
            'div',
            { 'data-state': status },
            message,
            onRetry && createElement('button', { onClick: onRetry }, '다시 시도'),
            action,
          ),
        DetailLink: ({ href, label }) => createElement('a', { href }, label),
      },
      '@/shared/ui/FeatureIntro': {
        FeatureIntro: ({ title, children }) =>
          createElement('header', null, createElement('h1', null, title), children),
      },
    },
  )
  return { html: renderToStaticMarkup(createElement(LevelGuideContent)), retried }
}

test('활동 단계 안내는 불러오는 중과 실패와 꺼짐을 빈 화면 대신 공통 상태 블록으로 알림', () => {
  assert.match(guide({ isPending: true }).html, /data-state="loading"/)
  const failed = guide({ isPending: false, isError: true })
  assert.match(
    failed.html,
    /data-state="error"[^>]*>활동 단계 안내를 불러오지 못했어요\.<button>다시 시도/,
  )
  assert.match(
    guide({ isPending: false, isError: false, data: { enabled: false } }).html,
    /data-state="empty"[\s\S]*href="\/home"/,
  )
  assert.match(
    guide({ isPending: false, data: { enabled: true } }, { isPending: true }).html,
    /data-state="loading"/,
  )
  assert.match(
    guide({ isPending: false, data: { enabled: true } }, { isPending: false, isError: true }).html,
    /data-state="error"/,
  )
})

test('활동 단계 안내 본문은 기존 문구와 레벨표를 그대로 두고 공통 소개 영역과 링크를 씀', () => {
  const { html } = guide(
    { isPending: false, data: { enabled: true } },
    {
      isPending: false,
      data: {
        levels: [{ value: 1, exp: 0, family: 'sprout' }],
        rules: { post: { exp: 5, daily: 2 } },
      },
    },
  )
  assert.match(html, /<header><h1>포퐁 활동 단계<\/h1>활동 단계 안내 문구<\/header>/)
  assert.match(html, /Lv\.1/)
  assert.match(html, /공개 이야기 · \+5 EXP/)
  assert.match(html, /href="\/faq">레벨\/EXP 문의하기/)
  assert.doesNotMatch(html, /<main/)
  assert.doesNotMatch(source('src/app/(main)/breeder-level/_ui/LevelGuideContent.tsx'), /<main/)
})

test('활동 대시보드 바로가기는 이름 있는 묶음 안의 공통 링크로 44px 높이를 가짐', () => {
  const dashboard = source('src/features/gamification/ui/ActivityDashboard.tsx')
  assert.match(dashboard, /<nav aria-label="활동 바로가기"/)
  assert.equal((dashboard.match(/<DetailLink/g) ?? []).length, 5)
  assert.equal((dashboard.match(/className="min-h-11"/g) ?? []).length, 5)
})
