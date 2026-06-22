import { AlertMessage } from '@/shared/ui'
import { CheckRoundedIcon } from '@/shared/assets/icons'

interface ChatNoticeBannerProps {
  onClose?: () => void
  className?: string
}

const NOTICE_MESSAGE =
  '담당 브리더와 채팅을 통해 더 상세한 입양 계획을 세워보세요. 채팅 내용을 pawpong 팀이 검수 할 수 있습니다.'

const ChatNoticeBanner = ({ onClose, className }: ChatNoticeBannerProps) => {
  return (
    <AlertMessage
      status="info"
      size="responsive"
      icon={CheckRoundedIcon}
      message={NOTICE_MESSAGE}
      actionLabel="자세히"
      onClose={onClose}
      className={className}
    />
  )
}

export { ChatNoticeBanner }
