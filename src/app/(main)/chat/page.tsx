import { Suspense } from 'react'
import { ChatPageContent } from './_ui/ChatPageContent'

// ChatPageContent 내부에서 useSearchParams(?roomId) 를 사용하므로 Next.js prerender 단계에서
// Suspense 경계를 요구한다. 없으면 빌드가 CSR bailout 에러로 실패한다. (explore 페이지와 동일 패턴)
const ChatPage = () => {
  return (
    <Suspense fallback={null}>
      <ChatPageContent />
    </Suspense>
  )
}

export default ChatPage
