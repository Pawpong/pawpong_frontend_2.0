const { test } = require('node:test')
const assert = require('node:assert/strict')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { load } = require('./fixtures/navigation.fixture.cjs')

function editor(isReady) {
  const empty = Object.fromEntries(
    [
      '@/entities/community',
      '@/shared/lib/authSessionLifecycle',
      './CommunityReviewConsent',
      './CommunityEditorExitDialog',
      './CommunityPhotoRecovery',
      './CommunityExperienceEditor',
      '@/shared/ui/Ticket',
      '@/shared/assets',
      '@/features/ai-image',
      '@/features/community',
      '@/widgets/post-form',
    ].map((name) => [name, {}]),
  )
  const { CommunityPostEditor } = load('src/app/(main)/community/_ui/CommunityPostEditor.tsx', {
    ...empty,
    react: { ...React, useEffect: () => {} },
    'next/navigation': { useRouter: () => ({ replace: () => {} }) },
    '@tanstack/react-query': { useQuery: () => ({ isPending: true }) },
    '@/features/auth': { useAuthStatus: () => ({ isReady }) },
    '@/shared/lib/useAuthSessionGeneration': { useAuthSessionGeneration: () => 0 },
    '@/entities/community': { communityQueries: { detail: () => ({}) } },
    '@/entities/profile': { profileQueries: { me: () => ({}) } },
    '@/shared/ui': {
      Container: ({ children }) => React.createElement('main', null, children),
    },
  })
  return CommunityPostEditor({ photoSource: 'memory-card' })
}

test('작성 이벤트가 연결되기 전에는 입력창 대신 준비 상태를 표시함', () => {
  const html = renderToStaticMarkup(editor(false))
  assert.match(html, /작성 화면을 준비하고 있어요/)
  assert.doesNotMatch(html, /textarea|input|사진 없이 계속/)
})

test('준비된 작성 화면은 사진 출처를 유지한 폼을 제공함', () => {
  const form = editor(true)
  assert.equal(form.type.name, 'PostForm')
  assert.equal(form.props.photoSource, 'memory-card')
  assert.equal(form.key, '0')
})
