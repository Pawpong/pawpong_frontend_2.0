import type { ReactNode } from 'react'
import { TextLabel } from '@/shared/ui'

interface FormSectionProps {
  title: string
  children: ReactNode
}

/**
 * 분양글 작성 그룹 카드 (Figma 3137-387944/945/946) — point-50 배경, radius 12, padding 20, gap 20.
 *
 * 제목 -> 콘텐츠 간격 20 은 세 카드가 공유하는 값이라 바깥에서 덮어쓸 수 없게 둔다.
 * 콘텐츠 내부 간격(건강 정보 40, 부모 정보 16)은 호출부가 래퍼로 지정한다.
 */
const FormSection = ({ title, children }: FormSectionProps) => (
  <div className="flex flex-col gap-5 rounded-xl bg-point-50 p-5">
    <TextLabel size="20">{title}</TextLabel>
    {children}
  </div>
)

export { FormSection }
