const { aiSessionFixture, load, deferred, token } = require('./ai-session.fixture.cjs')
const { hookFixture } = require('./hook.fixture.cjs')

function archiveActionFixture(overrides = {}) {
  const h = aiSessionFixture()
  const react = hookFixture()
  const calls = { image: [], source: [], save: [], hide: [], handoff: [], push: [], invalidate: [] }
  const file = new File(['photo'], 'result.png', { type: 'image/png' })
  const track =
    (key, fallback = () => file) =>
    async (...args) => {
      calls[key].push(args)
      return (overrides[key] ?? fallback)(...args)
    }
  const { useAiArchiveAction } = load('src/features/ai-image/lib/useAiArchiveAction.ts', {
    react: react.hooks,
    'next/navigation': { useRouter: () => ({ push: (path) => calls.push.push(path) }) },
    '@tanstack/react-query': { useQueryClient: () => ({ invalidateQueries: track('invalidate') }) },
    '@/entities/ai-image': { aiImageQueries: h.queries, hideAiImageGeneration: track('hide') },
    '@/shared/lib/authReadSession': h.session,
    './aiImageFile': {
      fetchAiImageFile: track('image'),
      fetchAiSourceFile: track('source'),
      saveAiImageFile: track('save'),
    },
    './pendingCommunityPhoto': { setPendingCommunityPhoto: (...args) => calls.handoff.push(args) },
  })
  const session = h.session.getAuthReadSession()
  return {
    ...h,
    session,
    calls,
    file,
    render: (id = 'job') => react.render(() => useAiArchiveAction(session, id)),
    unmount: react.unmount,
  }
}

module.exports = { archiveActionFixture, deferred, token }
