import type { ChatRoomResponseDto, ChatMessageResponseDto } from '@/shared/types'

const MOCK_CURRENT_USER_ID = 'adopter-1'

const MOCK_CHAT_ROOMS: ChatRoomResponseDto[] = [
  {
    roomId: 'room-1',
    adopterId: MOCK_CURRENT_USER_ID,
    breederId: 'breeder-1',
    applicationId: 'app-1',
    status: 'active',
    lastMessage: '안녕하세요  분양중이신가요?',
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    roomId: 'room-2',
    adopterId: MOCK_CURRENT_USER_ID,
    breederId: 'breeder-2',
    status: 'active',
    lastMessage: '안녕하세요  분양중이신가요?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    roomId: 'room-3',
    adopterId: MOCK_CURRENT_USER_ID,
    breederId: 'breeder-3',
    status: 'active',
    lastMessage: '안녕하세요  분양중이신가요?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    roomId: 'room-4',
    adopterId: MOCK_CURRENT_USER_ID,
    breederId: 'breeder-4',
    status: 'active',
    lastMessage: '안녕하세요  분양중이신가요?',
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
]

const MOCK_ROOM_NAMES: Record<string, string> = {
  'breeder-1': '도심속도마뱀',
  'breeder-2': '릉딘2',
  'breeder-3': '릉딘2',
  'breeder-4': '릉딘2',
}

const MOCK_CHAT_MESSAGES: ChatMessageResponseDto[] = [
  {
    messageId: 'msg-1',
    roomId: 'room-1',
    senderId: MOCK_CURRENT_USER_ID,
    senderRole: 'adopter',
    content: '안녕하세요  분양중이신가요?',
    messageType: 'text',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 30).toISOString(),
  },
  {
    messageId: 'msg-2',
    roomId: 'room-1',
    senderId: 'breeder-1',
    senderRole: 'breeder',
    content: '네 안녕하세요! 현재 입양 가능합니다!',
    messageType: 'text',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 25).toISOString(),
  },
  {
    messageId: 'msg-3',
    roomId: 'room-1',
    senderId: MOCK_CURRENT_USER_ID,
    senderRole: 'adopter',
    content: '만나서 한번 보고싶은데 약속시간 잡을 수 있을까요?',
    messageType: 'text',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 20).toISOString(),
  },
  {
    messageId: 'msg-4',
    roomId: 'room-1',
    senderId: 'breeder-1',
    senderRole: 'breeder',
    content: '넵 그럼 예약 걸어놓고 약속 일정 잡겠습니다! 언제 만남 괜찮으신가요 ?',
    messageType: 'text',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 15).toISOString(),
  },
  {
    messageId: 'msg-5',
    roomId: 'room-1',
    senderId: MOCK_CURRENT_USER_ID,
    senderRole: 'adopter',
    content: '이번주 다 괜찮은데, 혹시 선호하시는 장소가 있을까요?',
    messageType: 'text',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 10).toISOString(),
  },
  {
    messageId: 'msg-6',
    roomId: 'room-1',
    senderId: 'breeder-1',
    senderRole: 'breeder',
    content:
      '그럼 직접 사업장으로 와주시면 감사할것 같습니다! 만남 약속은 그럼 이번주 수요일로 걸어두도록 하겠습니다 !',
    messageType: 'text',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 5).toISOString(),
  },
  {
    messageId: 'msg-7',
    roomId: 'room-1',
    senderId: MOCK_CURRENT_USER_ID,
    senderRole: 'adopter',
    content: '확인하였습니다! 그때 뵐게요',
    messageType: 'text',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 3).toISOString(),
  },
  {
    messageId: 'msg-8',
    roomId: 'room-1',
    senderId: 'breeder-1',
    senderRole: 'breeder',
    content: '넵',
    messageType: 'text',
    isRead: true,
    createdAt: new Date().toISOString(),
  },
]

export { MOCK_CHAT_ROOMS, MOCK_CHAT_MESSAGES, MOCK_ROOM_NAMES, MOCK_CURRENT_USER_ID }
