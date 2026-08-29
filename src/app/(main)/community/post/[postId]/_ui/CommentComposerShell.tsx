import type { ReactNode } from 'react'
import { ProfileAvatar } from '@/shared/ui'

interface CommentComposerShellProps {
  /** 작성자(나) 아바타 — 비로그인이면 폴백 글리프 */
  profileImageUrl?: string
  /** 입력 박스 위 배너 (답글 대상 등) */
  banner?: ReactNode
  /** 아바타 오른쪽 본체 — 입력 박스 또는 로그인 유도 버튼 */
  children: ReactNode
  /** 본체 아래 보조 문구 (오류 안내 등) */
  footer?: ReactNode
}

/**
 * [refactored] 댓글 입력 영역의 공통 골격 (py-3 + 아바타 + 본체).
 * 이전에는 CommentComposer와 CommentComposerBar의 비로그인 대체 UI가 같은 마크업을
 * 각자 들고 있어 한쪽만 고치면 어긋났다 — 껍데기를 여기로 모으고 본체만 갈아 끼운다.
 */
const CommentComposerShell = ({
  profileImageUrl,
  banner,
  children,
  footer,
}: CommentComposerShellProps) => (
  <div className="flex flex-col gap-2 py-3">
    {banner}
    <div className="flex items-center gap-3">
      <ProfileAvatar size="medium" src={profileImageUrl} alt="내 프로필" className="shrink-0" />
      {children}
    </div>
    {footer}
  </div>
)

export { CommentComposerShell }
