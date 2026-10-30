import type { ReactNode } from 'react'
import { TEXT } from '@/shared/config'
import { DetailLink } from '@/shared/ui'

/**
 * 홈 섹션 머리 — 제목(TEXT.title) · 설명(text-body-s) · 더보기(DetailLink 반응형).
 * 다른 화면의 페이지 안 섹션 제목(놀이터 카드 줄·서비스 소개)과 같은 단계를 쓴다.
 * 내용과의 간격은 section-head-gap 한 곳에서 정한다.
 */
export function HomeSectionHeader({
  id,
  title,
  description,
  href,
  linkLabel,
}: {
  id: string
  title: string
  description?: ReactNode
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="section-head-gap">
      {/* 더보기는 제목 줄 오른쪽에 두고, 설명은 아래 줄 전체 폭을 쓴다 (좁은 폰에서 설명이 끊기지 않게) */}
      <div className="flex items-center justify-between gap-4">
        <h2 id={id} className={`min-w-0 ${TEXT.title}`}>
          {title}
        </h2>
        {href && <DetailLink href={href} label={linkLabel} size="responsive" />}
      </div>
      {description && <p className="mt-1 text-body-s break-keep text-neutral-700">{description}</p>}
    </div>
  )
}
