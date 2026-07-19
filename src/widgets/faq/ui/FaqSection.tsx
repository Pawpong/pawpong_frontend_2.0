'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import { cafe24Proup } from '@/shared/lib/fonts'
import { Container, SectionHeader } from '@/shared/ui'
import { homeQueries } from '@/entities/home'
import type { HomeUserType } from '@/shared/types'

interface FaqSectionProps {
  userType?: HomeUserType
}

// Figma card-3 (1555-88222) — 신뢰 CTA. adopter는 브리더 찾기, breeder는 입양자 찾기
const TRUST_CTA: Record<HomeUserType, { subject: string; action: string; href: string }> = {
  adopter: { subject: '브리더', action: '브리더 탐색하기', href: '/explore?type=breeder' },
  breeder: { subject: '입양자', action: '분양 페이지', href: '/adoption' },
}

const FaqSection = ({ userType = 'adopter' }: FaqSectionProps) => {
  const { data: faqs } = useQuery(
    userType === 'adopter' ? homeQueries.adopterFaqs() : homeQueries.breederFaqs(),
  )
  const cta = TRUST_CTA[userType]

  return (
    // Figma 1555-88220: 좌(신뢰 카드, py-40) + 우(FAQ, py-48). 외곽 margin/pc·중앙정렬은 Container가 담당
    <Container className="flex flex-col pc:flex-row pc:items-stretch">
      {/* 신뢰 CTA 카드 블록 (Figma 1555-88222) — pc 좌측, 카드가 FAQ 높이만큼 stretch */}
      <div className="pt-6 tab:pt-8 pc:w-[24.125rem] pc:shrink-0 pc:py-10">
        <div className="flex h-full flex-col justify-between gap-[1.5rem] rounded-[0.5rem] bg-[#8ed4ff] p-[1.5rem]">
          <div className="flex flex-col items-start leading-[1.5]">
            {/* 제목·부제: mo/tab 16px → pc 20px */}
            <p
              className={cn(
                cafe24Proup.className,
                'font-cafe24 text-[1rem] text-[#3e3e3e] pc:text-[1.25rem]',
              )}
            >
              신뢰할 수 있는 {cta.subject}
            </p>
            <p className="text-[1rem] font-semibold text-[#f6f6f6] pc:text-[1.25rem]">
              포퐁에서 만나요 !
            </p>
          </div>
          <Link
            href={cta.href}
            className="flex h-[3rem] w-full items-center justify-center rounded-full bg-[#fffa94] px-[2rem] pc:w-[12.3125rem] pc:self-end"
          >
            <span className="text-[1rem] font-semibold whitespace-nowrap text-[#3e3e3e]">
              {cta.action}
            </span>
          </Link>
        </div>
      </div>

      {/* 자주묻는 질문 블록 — pc 우측 (pl-20 = 카드와의 80px 간격) */}
      <div className="flex-1 py-6 tab:py-8 pc:py-12 pc:pl-20">
        <SectionHeader title="자주 묻는 질문" linkText="자세히" linkHref="/faq" />
        {/* 항목: mo·tab 5개 1열, pc 10개 2열(컬럼 우선 채움, 간격 12px — Figma FaqLayout) */}
        <div className="mt-[0.75rem] grid grid-cols-1 border-b border-[#a6a6a6] pc:grid-flow-col pc:grid-cols-2 pc:grid-rows-5 pc:gap-x-[0.75rem]">
          {faqs?.slice(0, 10).map((faq, index) => (
            <div
              key={faq.faqId}
              className={cn(
                'border-t border-[#a6a6a6] px-[0.25rem] py-[0.75rem]',
                index >= 5 && 'hidden pc:block', // mo·tab는 5개만 노출
              )}
            >
              <p className="truncate text-[0.875rem] font-semibold text-[#3e3e3e] tab:text-[1rem]">
                {faq.question}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}

export { FaqSection }
