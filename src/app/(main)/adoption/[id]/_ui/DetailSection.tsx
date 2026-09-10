import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { DETAIL_TYPE } from '../_lib/detailTypography'

interface DetailSectionProps {
  title: string
  /**
   * 배경으로 강조할지. 건강 정보 한 곳에만 쓴다 —
   * 카드 세 개가 나란히 같은 배경을 갖고 있으면 무엇이 중요한지 표시가 안 된다.
   */
  emphasis?: boolean
  className?: string
  children: ReactNode
}

/**
 * 상세 페이지 섹션 = 제목 + 괘선 + 내용.
 * BaseInfoCard(bg-point-50 카드)를 대신한다 — 강조는 한 곳에만 몰아준다.
 */
const DetailSection = ({ title, emphasis, className, children }: DetailSectionProps) => (
  <section
    className={cn(
      'flex w-full flex-col gap-4 tab:gap-5',
      emphasis && 'rounded-xl bg-point-50 p-4 tab:p-6',
      className,
    )}
  >
    <div className="flex flex-col gap-3">
      <h2 className={DETAIL_TYPE.section}>{title}</h2>
      {!emphasis && <hr className="border-neutral-200" />}
    </div>
    {children}
  </section>
)

export { DetailSection }
