const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { load, held, post, model } = require('./fixtures/community-review.fixture.cjs')
const Link = ({ children, href }) => createElement('a', { href }, children)
const consent = load('src/app/(main)/community/_ui/CommunityReviewConsent.tsx')

test('심사 동의 전 자동 카테고리 분류는 호출하지 않고 직접 선택은 유지함', () => {
  const flags = []
  const Component = load('src/features/community/ui/PetCategorySuggestion.tsx', {
    '@/shared/assets': { PawPrintIcon: () => null },
    '@/shared/ui': {
      Chip: ({ children }) => createElement('button', null, children),
      Button: () => null,
    },
    '../lib/usePetCategorySuggestion': {
      usePetCategorySuggestion: (_text, _photo, automatic) => {
        flags.push(automatic)
        return { state: null }
      },
    },
  }).PetCategorySuggestion
  const html = renderToStaticMarkup(
    createElement(Component, {
      text: '산책 이야기',
      value: '',
      onChange: () => {},
      automaticAllowed: false,
    }),
  )
  assert.deepEqual(flags, [false])
  assert.match(html, /직접 고를 수/)
  assert.match(html, /강아지/)
  assert.doesNotMatch(html, /자동 분류 사용하기/)
})
function panel(config = { enabled: true, dailyLimit: 10, notice: 'OpenAI 처리 안내' }) {
  let calls = 0
  const component = load('src/app/(main)/community/_ui/CommunityPostReviewPanel.tsx', {
    '@tanstack/react-query': { useQuery: () => ({ data: config }) },
    '@/entities/community': {
      communityReviewConfigOptions: {},
      COMMUNITY_REVIEW_NEXT_STEP: model.COMMUNITY_REVIEW_NEXT_STEP,
    },
    '@/features/community': {
      useCommunityReviewRequest: () => ({ isPending: false, mutate: () => calls++ }),
    },
    '@/shared/lib/useAuthSessionGeneration': { useAuthSessionGeneration: () => 1 },
    'next/link': { default: Link },
    './CommunityReviewConsent': consent,
  }).CommunityPostReviewPanel
  return { component, calls: () => calls }
}
test('작성자 보류 화면은 사유와 수정 경로를 제공하되 조회만으로 재심사하지 않음', () => {
  const fixture = panel()
  const html = renderToStaticMarkup(
    createElement(fixture.component, { post: post(), isOwner: true }),
  )
  assert.match(html, /공개 보류/)
  assert.match(html, /내용과 사진 수정하기/)
  assert.match(html, /OpenAI 처리 안내/)
  assert.match(html, /동의하고 다시 심사하기/)
  assert.match(html, /disabled=""/)
  assert.doesNotMatch(html, /checked=""/)
  assert.equal(fixture.calls(), 0)
})
test('타인에게 심사 정보를 렌더하지 않고 설정 OFF에서는 재심사를 비활성화함', () => {
  const fixture = panel({ enabled: false, dailyLimit: 0, notice: '' })
  assert.equal(
    renderToStaticMarkup(createElement(fixture.component, { post: post(), isOwner: false })),
    '',
  )
  const html = renderToStaticMarkup(
    createElement(fixture.component, { post: post(), isOwner: true }),
  )
  assert.match(html, /글은 그대로 보관/)
  assert.doesNotMatch(html, /type="checkbox"/)
  assert.match(html, /disabled=""/)
  assert.equal(fixture.calls(), 0)
})
test('승인 화면은 전문 신뢰 인증이 아니라고 안내하고 재심사를 자동 실행하지 않음', () => {
  const fixture = panel()
  const approved = {
    ...post(),
    aiReview: { ...held(), state: 'approved', reason: 'relevant', canRequestReview: false },
  }
  const html = renderToStaticMarkup(
    createElement(fixture.component, { post: approved, isOwner: true }),
  )
  assert.match(html, /선택한 공개 범위 적용/)
  assert.match(html, /의학적 신뢰 인증이 아니/)
  assert.doesNotMatch(html, /다시 심사하기/)
  assert.equal(fixture.calls(), 0)
})
test('동의 화면은 임시저장 제외와 처리 범위 및 실패 포함 요청 한도를 표시함', () => {
  const html = renderToStaticMarkup(
    createElement(consent.CommunityReviewConsent, {
      config: { enabled: true, dailyLimit: 10, notice: '본문과 첨부 사진을 OpenAI로 확인함' },
      consent: false,
      onChange: () => {},
    }),
  )
  assert.match(html, /임시저장은 심사하지/)
  assert.match(html, /하루 최대 10회/)
  assert.match(html, /실패한 요청도 한도/)
  assert.match(html, /동의하지 않아도 저장/)
})
test('보류 카드의 공유와 반응 콜백은 열지 않고 기존 글은 유지함', () => {
  const preview = load('src/entities/community/model/communityPreview.ts')
  const raw = {
    ...post(),
    authorId: 'synthetic-owner',
    authorNickname: '합성',
    bodyExcerpt: '산책',
  }
  assert.equal(preview.toCommunityPreviewProps(raw).shareable, false)
  assert.equal(preview.toCommunityPreviewProps({ ...raw, aiReview: undefined }).shareable, true)
  const cards = load('src/features/community/ui/ConnectedPostCard.tsx', {
    '@/entities/community': { CommunityFeedCard: () => null },
    '../api/communityReaction.mutations': {
      useToggleCommunityPostLike: () => ({ toggleLike: () => {} }),
      useToggleCommunityPostBookmark: () => ({ toggleBookmark: () => {} }),
    },
    './ReportPostAction': { ReportPostAction: () => null },
  })
  const card = cards.ConnectedFeedCard({
    ...preview.toCommunityPreviewProps(raw),
    onDelete: () => {},
  })
  assert.equal(card.props.onToggleLike, undefined)
  assert.equal(card.props.onToggleSave, undefined)
})
test('보류 상세는 두 레이아웃 모두 댓글 작성과 반응 및 공유를 렌더하지 않음', () => {
  const enabled = []
  const component = load('src/app/(main)/community/_ui/PostDetailPanel.tsx', {
    '@/shared/ui': {
      ImageCarousel: () => null,
      ProfileAvatar: () => null,
      OwnerActionsMenu: () => null,
      DeleteConfirmModal: () => null,
      LoginPromptModal: () => null,
    },
    '@/entities/community': {
      COMMUNITY_LOGIN_PROMPT: { reaction: '합성 인증 안내' },
      isCommunityPostHeld: model.isCommunityPostHeld,
      CommunityPostActions: () => createElement('button', null, '반응 기능'),
    },
    '@/features/auth': { useLoginGuard: () => ({ guard: (value) => value }) },
    '@/shared/lib/cn': { cn: (...values) => values.filter(Boolean).join(' ') },
    '../post/[postId]/_ui/usePostDetail': {
      usePostDetail: () => ({
        post: { ...post(), photoUrls: ['https://example.invalid/community/synthetic.jpg'] },
        isOwner: true,
      }),
    },
    '../post/[postId]/_ui/useCommentThread': {
      useCommentThread: (_id, value) => {
        enabled.push(value)
        return {}
      },
    },
    '../post/[postId]/_ui/CommentList': {
      CommentList: () => createElement('div', null, '댓글 목록'),
    },
    '../post/[postId]/_ui/CommentComposerBar': {
      CommentComposerBar: () => createElement('button', null, '댓글 작성'),
    },
    './CommunityExperiencePanel': { CommunityExperiencePanel: () => null },
    './CommunityPostReviewPanel': {
      CommunityPostReviewPanel: () => createElement('section', null, '심사 안내'),
    },
    '@/entities/gamification': { ActivityBadgeRow: () => null },
    '@/features/gamification': { usePublicActivityBadges: () => [] },
  }).PostDetailPanel
  for (const layout of ['stacked', 'side-by-side']) {
    const html = renderToStaticMarkup(
      createElement(component, { postId: 'synthetic-post', layout }),
    )
    assert.match(html, /심사 안내/)
    assert.doesNotMatch(html, /댓글 작성|댓글 목록|반응 기능/)
  }
  assert.deepEqual(enabled, [false, false])
})
