const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { loadTypescript: load } = require('../../helpers/load-typescript.cjs')
const context = load('src/app/(main)/community/_ui/answer/communityAnswerContext.ts')
const session = { scope: '합성 세션', identity: JSON.stringify(['adopter', '합성 보호자']) }
const post = {
  postId: '합성 질문',
  authorId: '합성 보호자',
  authorModel: 'Adopter',
  status: 'published',
  visibility: 'public',
  title: '산책 질문',
  body: '함께 산책한 경험을 나눠 주세요.',
  experience: { question: true, topics: ['walk'] },
}
// 공통 버튼은 변형 속성을 빼고 실제 button으로 그려 접근성 이름과 disabled만 검사한다.
const buttonStub = ({ intent: _intent, size: _size, width: _width, ...props }) =>
  createElement('button', { type: 'button', ...props })
function answerViewFixture(overrides = {}, owner = session) {
  let mutations = 0
  const state = {
    result: { data: null, isPending: false, isError: false, isFetching: false },
    phase: 'idle',
    consent: false,
    setConsent() {},
    request: () => mutations++,
    recheck() {},
    ...overrides,
  }
  const { CommunityAnswer } = load('src/app/(main)/community/_ui/CommunityAiAnswer.tsx', {
    '@/shared/lib/useAuthReadSession': { useAuthReadSession: () => owner },
    '@/shared/ui/Button': { Button: buttonStub },
    './answer/communityAnswerContext': context,
    './answer/useCommunityAnswer': { useCommunityAnswer: () => state },
  })
  const props = { post, isOwner: true, notice: '진단과 처방을 대신하지 않습니다.' }
  const render = () => renderToStaticMarkup(createElement(CommunityAnswer, props))
  return { render, props, state, mutations: () => mutations, component: CommunityAnswer }
}
module.exports = { answerViewFixture, context, session, post }
