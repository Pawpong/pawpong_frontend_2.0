'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCreateOrGetChatRoom } from '@/features/send-message'
import { AlertMessage, Button } from '@/shared/ui'
import { normalizeApiError } from '@/shared/api'
import { cn } from '@/shared/lib/cn'

interface ApplicationChatButtonProps {
  /** 대화 상대의 userId — 브리더 화면이면 입양자, 입양자 화면이면 브리더 */
  counterpartUserId: string
  /** 만들어질 채팅방에 연결할 상담 신청 id (채팅방 상단 펫 카드가 이 값을 쓴다) */
  applicationId: string
  className?: string
}

/**
 * 상담 신청 상세에서 바로 채팅으로 진입하는 버튼.
 *
 * 신청과 채팅을 잇는 동선이 없어 "상담 신청은 했는데 대화할 방법이 없는" 상태였다.
 * 방 생성은 멱등이라(서버가 기존 방을 그대로 돌려준다) 여러 번 눌러도 방이 늘지 않는다.
 */
const ApplicationChatButton = ({
  counterpartUserId,
  applicationId,
  className,
}: ApplicationChatButtonProps) => {
  const router = useRouter()
  const { mutate: startChat, isPending, isError, error } = useCreateOrGetChatRoom()

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() =>
          startChat(
            { counterpartUserId, applicationId },
            { onSuccess: (room) => router.push(`/chat?roomId=${room.roomId}`) },
          )
        }
        className={cn('gap-1.5 px-4', className)}
      >
        <Image src="/chat.svg" alt="" width={24} height={24} className="size-5" />
        채팅하기
      </Button>

      {isError && (
        <AlertMessage
          status="error"
          size="responsive"
          message={normalizeApiError(error, '채팅방을 열지 못했습니다.').message}
        />
      )}
    </div>
  )
}

export { ApplicationChatButton }
