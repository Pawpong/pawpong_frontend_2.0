'use client'

import { usePathname, useRouter } from 'next/navigation'
import { CtaModal } from './CtaModal'

interface LoginPromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 무엇을 하려다 막혔는지 — "로그인하고 ~해보세요" 문장 */
  description: string
}

/**
 * 로그인이 필요한 동작을 눌렀을 때 띄우는 안내 모달.
 * returnUrl은 /login → OAuth → /login/success 까지 전달돼 원래 보던 화면으로 되돌아온다.
 */
const LoginPromptModal = ({ open, onOpenChange, description }: LoginPromptModalProps) => {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <CtaModal
      open={open}
      onOpenChange={onOpenChange}
      title="로그인이 필요해요"
      description={description}
      actions={[
        {
          label: '로그인하러 가기',
          variant: 'fill',
          onClick: () => router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`),
        },
        { label: '닫기', variant: 'ghost', onClick: () => onOpenChange(false) },
      ]}
    />
  )
}

export { LoginPromptModal }
