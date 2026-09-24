import { AlertMessage } from '@/shared/ui'
import { CheckRoundedIcon } from '@/shared/assets'

interface ChatNoticeBannerProps {
  onClose?: () => void
  className?: string
}

// 역할(브리더/입양자)과 대화 목적(입양 문의/일반 상담) 어느 쪽도 특정하지 않는 중립 문구
const NOTICE_MESSAGE =
  '상대방과 채팅을 통해 더 자세한 이야기를 나눠보세요. 채팅 내용을 pawpong 팀이 검수 할 수 있습니다.'

const ChatNoticeBanner = ({ onClose, className }: ChatNoticeBannerProps) => {
  return (
    <AlertMessage
      status="info"
      size="responsive"
      icon={CheckRoundedIcon}
      message={NOTICE_MESSAGE}
      onClose={onClose}
      className={className}
    />
  )
}

export { ChatNoticeBanner }
