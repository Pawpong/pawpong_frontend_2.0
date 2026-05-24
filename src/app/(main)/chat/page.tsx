'use client'

import { useAdopterProfile } from '@/entities/adopter'
import { ChatPageContent } from './_ui/ChatPageContent'

const ChatPage = () => {
  const { data: profile } = useAdopterProfile()

  if (!profile) return null

  return <ChatPageContent currentUserId={profile.adopterId} />
}

export default ChatPage
