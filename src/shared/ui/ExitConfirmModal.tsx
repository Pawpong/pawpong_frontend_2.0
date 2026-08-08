'use client'

import type { ReactNode } from 'react'
import { CtaModal } from './CtaModal'

interface ExitConfirmModalProps {
  open: boolean
  /** 배경/X/'닫기'로 닫힘 — 그만두지 않고 폼 유지 */
  onClose: () => void
  /** '그만두기' 확정 — 실제로 이탈 */
  onConfirm: () => void
  title: ReactNode
  description?: ReactNode
  closeLabel?: string
  confirmLabel?: string
}

// 폼 이탈 확인 모달 — CtaModal 기반 '닫기 / 그만두기' 2버튼 공통 패턴
const ExitConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  closeLabel = '닫기',
  confirmLabel = '그만두기',
}: ExitConfirmModalProps) => (
  <CtaModal
    open={open}
    onOpenChange={(isOpen) => !isOpen && onClose()}
    icon={null}
    title={title}
    description={description}
    direction="responsive-reverse"
    actions={[
      { label: closeLabel, variant: 'outline', onClick: onClose },
      { label: confirmLabel, variant: 'fill', onClick: onConfirm },
    ]}
  />
)

export { ExitConfirmModal }
