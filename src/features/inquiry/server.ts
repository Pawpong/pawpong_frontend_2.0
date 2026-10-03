// BFF 전용 공개 진입점. 브라우저용 index.ts와 분리해 서버의 생성 제한 상태를 격리한다.
export { supportConversationSchema } from './model/supportConversation'
export { takeSupportCreationSlot } from './api/supportCreationLimit.server'
