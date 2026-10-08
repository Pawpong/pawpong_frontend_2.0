const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const { hooks } = require('../../fixtures/react-hooks.fixture.cjs')
const {
  notificationFixture,
  token,
  deferred,
} = require('../../notifications/fixtures/notification.fixture.cjs')
const comment = (id) => ({
  commentId: id,
  postId: '질문',
  authorNickname: id,
  createdAt: '2026-10-08T00:00:00Z',
})

function threadFixture(write = async () => {}) {
  const h = notificationFixture()
  const runtime = hooks()
  const state = {
    postId: '질문',
    enabled: true,
    comments: [comment('첫 댓글'), comment('두 번째 댓글')],
    writes: [],
    query: { isPending: false, isError: false, isFetching: false },
  }
  const { useCommentThread } = load(
    'src/app/(main)/community/post/[postId]/_ui/useCommentThread.ts',
    {
      react: { ...runtime.react, useLayoutEffect: runtime.react.useEffect },
      '@tanstack/react-query': {
        useInfiniteQuery: () => ({ data: { pages: [{ items: state.comments }] }, ...state.query }),
      },
      '@/entities/community': { communityQueries: { comments: () => ({}) } },
      '@/features/community': {
        ...load('src/features/community/lib/communityCreateAttempt.ts'),
        useCreateCommunityComment: () => ({
          mutateAsync: async (data) => {
            state.writes.push(data)
            return write(data)
          },
          isPending: false,
        }),
      },
      '@/features/auth': {
        useMe: () => ({ isLoggedIn: true, me: { userId: 'account-a', role: 'adopter' } }),
        useLoginGuard: () => ({ openPrompt() {} }),
      },
      '@/shared/lib/useAuthReadSession': { useAuthReadSession: h.session.getAuthReadSession },
      '@/shared/lib/authReadSession': h.session,
      '@/shared/api': { ApiError: h.ApiError },
      '@/shared/lib/infiniteList': {
        flattenPages: (data) => data.pages.flatMap((page) => page.items),
      },
      './commentThread': load('src/app/(main)/community/post/[postId]/_ui/commentThread.ts'),
      './useCommentActions': { useCommentActions: () => ({ active: null, notice: null }) },
    },
  )
  return {
    ...h,
    input: state,
    render: () => runtime.render(() => useCommentThread(state.postId, state.enabled)),
    close: () => runtime.unmount(),
  }
}
module.exports = { threadFixture, comment, token, deferred }
