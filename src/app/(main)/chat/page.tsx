import { Suspense } from 'react'
import { requireAuth } from '@/features/auth/server'
import { ChatPageContent } from './_ui/ChatPageContent'

interface ChatPageProps {
  searchParams: Promise<{ roomId?: string | string[] }>
}

const ChatPage = async ({ searchParams }: ChatPageProps) => {
  const { roomId } = await searchParams
  const selectedRoomId = Array.isArray(roomId) ? roomId[0] : roomId
  const returnUrl = selectedRoomId ? `/chat?roomId=${encodeURIComponent(selectedRoomId)}` : '/chat'

  // 채팅 쿼리를 실행하는 클라이언트 화면을 렌더하기 전에 로그인 쿠키를 확인한다.
  await requireAuth(returnUrl)

  return (
    <Suspense fallback={null}>
      <ChatPageContent />
    </Suspense>
  )
}

export default ChatPage
