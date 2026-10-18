const { QueryClient, QueryObserver } = require('@tanstack/react-query')
const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const { hooks } = require('../../fixtures/react-hooks.fixture.cjs')
const { answerApiFixture } = require('./api.fixture.cjs')
const flush = () => new Promise((resolve) => setImmediate(resolve))
const answer = (status = 'completed') => ({
  status,
  answer: status === 'completed' ? '합성 참고 답변' : null,
  needsVet: true,
  createdAt: new Date().toISOString(),
  aiGenerated: true,
})

function answerHookFixture({ read = async () => null, write = async () => answer() } = {}) {
  const h = answerApiFixture()
  const runtime = hooks()
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  let observer, unsubscribe
  const calls = { reads: 0, writes: 0, writeSignal: null }
  const input = {
    postId: '질문',
    context: '질문 원문',
    session: h.session.getAuthReadSession(),
    canRequest: true,
  }
  const { useCommunityAnswer } = load('src/app/(main)/community/_ui/answer/useCommunityAnswer.ts', {
    react: runtime.react,
    '@tanstack/react-query': {
      useQueryClient: () => client,
      useQuery: (options) => {
        if (!observer) {
          observer = new QueryObserver(client, options)
          unsubscribe = observer.subscribe(() => {})
        } else observer.setOptions(options)
        return observer.getCurrentResult()
      },
    },
    '@/entities/community': {
      readCommunityAiAnswer: (...args) => {
        calls.reads++
        return read(...args)
      },
      requestCommunityAiAnswer: (...args) => {
        calls.writes++
        calls.writeSignal = args[1]
        return write(...args)
      },
    },
    '@/shared/api': h.sharedApi,
    '@/shared/lib/authReadSession': h.session,
  })
  const render = () => runtime.render(() => useCommunityAnswer(input))
  async function ready() {
    render()
    await flush()
    render().setConsent(true)
    return render()
  }
  function close() {
    runtime.unmount()
    unsubscribe?.()
    observer?.destroy()
    client.clear()
  }
  return {
    ...h,
    input,
    client,
    calls,
    render,
    ready,
    close,
    unmount: runtime.unmount,
    interval: () => observer.options.refetchInterval(observer.getCurrentQuery()),
  }
}

module.exports = { answerHookFixture, answer, flush }
