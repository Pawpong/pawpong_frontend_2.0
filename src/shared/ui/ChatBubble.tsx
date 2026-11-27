import type { ReactNode } from 'react'
import { tv } from '@/shared/lib/tv'

// 대화 말풍선 — 채팅방과 문의하기 AI 상담이 같은 모양을 쓴다.
// mine: 내 말(노랑, 오른쪽 아래 꼬리) / other: 상대·AI 말(흰 바탕 + 테두리, 왼쪽 아래 꼬리)
// pending: 아직 보내는 중인 내 말 — 옅은 노랑
const chatBubbleVariants = tv({
  base: 'min-w-0 rounded-2xl px-3.5 py-2.5 text-sm leading-[1.5] font-medium break-words whitespace-pre-wrap text-neutral-850 pc:px-4 pc:py-3 pc:text-base',
  variants: {
    side: {
      mine: 'rounded-br-md bg-point-500',
      other: 'rounded-bl-md border border-neutral-150 bg-white',
    },
    pending: { true: '', false: '' },
  },
  compoundVariants: [{ side: 'mine', pending: true, className: 'bg-point-100' }],
  defaultVariants: { pending: false },
})

interface ChatBubbleProps {
  side: 'mine' | 'other'
  pending?: boolean
  children: ReactNode
}

const ChatBubble = ({ side, pending = false, children }: ChatBubbleProps) => (
  <p className={chatBubbleVariants({ side, pending })}>{children}</p>
)

export { ChatBubble }
