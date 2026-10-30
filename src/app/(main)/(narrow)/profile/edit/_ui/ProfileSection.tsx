import type { ReactNode } from 'react'
import { TEXT } from '@/shared/config'

interface ProfileSectionProps {
  title: string
  description?: string
  children: ReactNode
}

/** 편집 섹션 = 제목(+설명) + 괘선 + 필드 — 분양 상세 DetailSection 과 같은 위계 */
const ProfileSection = ({ title, description, children }: ProfileSectionProps) => (
  <section className="flex w-full flex-col gap-5 tab:gap-6">
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className={TEXT.section}>{title}</h2>
        {description && <p className={TEXT.meta}>{description}</p>}
      </div>
      <hr className="border-neutral-200" />
    </div>
    <div className="flex flex-col gap-6">{children}</div>
  </section>
)

export { ProfileSection }
