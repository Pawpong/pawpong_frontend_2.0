'use client'

import { useState } from 'react'
import { SectionHeader } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

interface CollapsibleSectionProps {
  /** 섹션 제목 (개수 등은 호출부에서 포함) */
  title: string
  /** 제목 텍스트 스타일 오버라이드 */
  titleClassName?: string
  /** 섹션 래퍼 추가 클래스 (상단 여백·좌우 패딩 등) */
  className?: string
  children: React.ReactNode
}

// [refactored] SectionHeader(collapsible) + collapse 상태 + 섹션 래퍼 반복 패턴을 공통화
const CollapsibleSection = ({
  title,
  titleClassName,
  className,
  children,
}: CollapsibleSectionProps) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <section className={cn('flex flex-col gap-[0.75rem]', className)}>
      <SectionHeader
        title={title}
        titleClassName={titleClassName}
        collapsible
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
      />
      {!collapsed && children}
    </section>
  )
}

export { CollapsibleSection }
