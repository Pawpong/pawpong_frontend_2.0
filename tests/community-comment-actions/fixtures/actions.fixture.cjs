const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const { hooks, nodes } = require('../../fixtures/react-hooks.fixture.cjs')
const {
  notificationFixture,
  token,
  deferred,
} = require('../../notifications/fixtures/notification.fixture.cjs')
const directory = 'src/app/(main)/community/post/[postId]/_ui/'
const comment = (id = '댓글', owner = 'account-a') => ({
  commentId: id,
  postId: '글',
  authorId: owner,
  authorModel: 'Adopter',
  authorNickname: '합성 보호자',
  body: '원래 댓글',
  parentCommentId: null,
})

function fixture({ write = async () => {}, read } = {}) {
  const auth = notificationFixture(),
    runtime = hooks()
  const input = {
    postId: '글',
    enabled: true,
    writes: [],
    reads: 0,
    refreshes: 0,
    comments: [comment()],
  }
  const model = load(directory + 'commentAction.ts', {
    '@/shared/api': { ...auth, isApiError: (error) => error instanceof auth.ApiError },
  })
  const { useCommentActions } = load(directory + 'useCommentActions.ts', {
    react: { ...runtime.react, useLayoutEffect: runtime.react.useEffect },
    '@tanstack/react-query': { useQueryClient: () => ({}) },
    '@/features/community': {
      useUpdateCommunityComment: (id) => ({
        mutateAsync: async (data) => {
          input.writes.push({ mode: 'edit', id, data })
          return write(data)
        },
      }),
      useDeleteCommunityComment: () => ({
        mutateAsync: async (id) => {
          input.writes.push({ mode: 'delete', id })
          return write(id)
        },
      }),
      invalidateCommunityPostData: () => {
        input.refreshes++
        return Promise.resolve()
      },
    },
    '@/shared/lib/authReadSession': auth.session,
    './commentAction': model,
  })
  return {
    ...auth,
    input,
    model,
    render: () =>
      runtime.render(() =>
        useCommentActions(
          input.postId,
          auth.session.getAuthReadSession(),
          input.enabled,
          async () => {
            input.reads++
            return read ? read() : input.comments
          },
        ),
      ),
    close: () => runtime.unmount(),
  }
}
module.exports = { fixture, comment, token, deferred, load, hooks, nodes, directory }
