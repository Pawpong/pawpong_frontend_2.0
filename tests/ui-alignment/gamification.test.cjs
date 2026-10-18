const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadTypescript } = require('../helpers/load-typescript.cjs')
const { source } = require('./fixtures/alignment.fixture.cjs')

// 설정·레벨표 조회 상태를 바꿔 가며 안내 화면이 무엇을 보여주는지 확인한다.
function guide(configQuery, catalogQuery = { isPending: false, isError: false, data: undefined }) {
  const retried = []
  const { LevelGuideContent } = loadTypescript('src/app/(main)/level/_ui/LevelGuideContent.tsx', {
    '@tanstack/react-query': {
      useQuery: (options) =>
        options.queryKey?.[1] === 'catalog'
          ? { ...catalogQuery, refetch: async () => retried.push('catalog') }
          : { ...configQuery, refetch: async () => retried.push('config') },
    },
    '@/entities/gamification': {
      activityConfigOptions: { queryKey: ['gamification', 'config'] },
      getActivityCatalog: async () => ({}),
      LevelIcon: () => createElement('i'),
      ACTIVITY_LABELS: { post: '공개 이야기' },
      LEVEL_NOTICE: '활동 단계 안내 문구',
    },
    '@/features/auth': { useAuthStatus: () => ({ userRole: 'adopter' }) },
    '@/features/inquiry': { SupportInquiryModal: () => null },
    '@/shared/ui': {
      AsyncState: ({ status, message, action, onRetry }) =>
        createElement(
          'div',
          { 'data-state': status },
          message,
          onRetry && createElement('button', { onClick: onRetry }, '다시 시도'),
          action,
        ),
      Badge: ({ children }) => createElement('b', null, children),
      Button: ({ children }) => createElement('button', null, children),
      Container: ({ children }) => createElement('div', null, children),
      DetailLink: ({ href, label }) => createElement('a', { href }, label),
      NavigationBar: ({ title }) => createElement('nav', null, title),
    },
    '@/shared/ui/FeatureIntro': {
      FeatureIntro: ({ title, children }) =>
        createElement('header', null, createElement('h1', null, title), children),
    },
  })
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

test('활동 단계 안내 본문은 공통 소개 영역 아래 레벨표·적립 기준·문의 버튼을 보여줌', () => {
  const { html } = guide(
    { isPending: false, data: { enabled: true } },
    {
      isPending: false,
      isSuccess: true,
      data: {
        families: [{ key: 'sprout', name: '새싹' }],
        levels: [{ value: 1, exp: 0, family: 'sprout' }],
        rules: { post: { exp: 5, daily: 2 } },
      },
    },
  )
  assert.match(
    html,
    /<header><h1>함께한 활동이 단계가 돼요<\/h1>[\s\S]*활동 단계 안내 문구<\/header>/,
  )
  assert.match(html, /Lv\.1/)
  assert.match(html, /공개 이야기[\s\S]*하루 2번[\s\S]*\+5 EXP/)
  assert.match(html, /id="inquiry"[\s\S]*<button>레벨\/EXP 문의하기<\/button>/)
  assert.doesNotMatch(html, /<main/)
  assert.doesNotMatch(source('src/app/(main)/level/_ui/LevelGuideContent.tsx'), /<main/)
})

test('활동 대시보드 바로가기는 이름 있는 묶음 안의 공통 링크로 44px 높이를 가짐', () => {
  const dashboard = source('src/features/gamification/ui/ActivityDashboard.tsx')
  assert.match(dashboard, /<nav aria-label="활동 바로가기"/)
  assert.equal((dashboard.match(/<DetailLink/g) ?? []).length, 5)
  assert.equal((dashboard.match(/className="min-h-11"/g) ?? []).length, 5)
})
