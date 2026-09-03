'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { homeQueries } from '@/entities/home'
import { ChevronDownIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { cafe24Proup } from '@/shared/lib/fonts'
import type { FaqDto } from '@/shared/types'
import {
  badgeVariants,
  Button,
  Container,
  CtaBanner,
  ListState,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/shared/ui'
import { InquiryModal } from './InquiryModal'

type FaqAudience = 'adopter' | 'breeder'

const FAQ_TABS = [
  { value: 'adopter', label: '일반 회원' },
  { value: 'breeder', label: '브리더 회원' },
] as const

// [refactored] 삼항으로 갈리던 audience→쿼리 매핑을 룩업 테이블로
const FAQ_QUERY_BY_AUDIENCE: Record<FaqAudience, () => ReturnType<typeof homeQueries.adopterFaqs>> =
  {
    adopter: homeQueries.adopterFaqs,
    breeder: homeQueries.breederFaqs,
  }

// 질문 행 — Figma 3395:638598 'FAQ'. 카드/보더/그림자 없이 neutral-300 구분선만 있는 플러시 리스트.
// design.md 원칙대로 별도 JS 아코디언 대신 native details/summary를 그대로 쓴다.
const FaqItem = ({ faq }: { faq: FaqDto }) => (
  <details className="group border-b border-neutral-300 last:border-b-0">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500 [&::-webkit-details-marker]:hidden">
      <span className="min-w-0 text-base leading-[1.5] font-semibold text-neutral-850">
        {faq.question}
      </span>
      <ChevronDownIcon className="size-6 shrink-0 text-neutral-850 transition-transform group-open:rotate-180" />
    </summary>
    <div className="mb-4 rounded-lg bg-point-100 p-3 text-base leading-[1.5] font-medium whitespace-pre-line text-neutral-850">
      {faq.answer}
    </div>
  </details>
)

// [refactored] 히어로 + 직접 문의 CTA를 별도 섹션으로 추출 (Figma Title-layout 3393:617441 / Frame1707484537)
const FaqHero = ({ onInquiryClick }: { onInquiryClick: () => void }) => (
  <>
    {/* 독립 섹션 — 상하 패딩을 스스로 갖는다 */}
    <div className="flex flex-col items-center justify-center px-4 py-8 tab:px-12 tab:py-10 pc:px-20 pc:py-12">
      <p
        className={cn(
          cafe24Proup.className,
          'max-w-[55rem] text-center text-base leading-[1.5] text-neutral-850 tab:text-lg pc:text-xl',
        )}
      >
        서비스에 대해서 궁금한 점을 친절하게 알려드립니다.
      </p>
    </div>

    {/* 얇은 밴드, 상하 8px만. CtaBanner 가 자체 max-w-[70.875rem](1134px) 로 가운데 정렬하므로
        폭을 다시 좁히지 않는다 */}
    <Container className="py-2">
      <CtaBanner text="직접 문의 남기기" tone="point" onClick={onInquiryClick} />
    </Container>
  </>
)

// [refactored] 유형 탭 토글을 별도 컴포넌트로 추출 (Figma 3395:638598 — 배지형 필, 언더라인 탭 아님)
const FaqAudienceTabs = ({
  value,
  onChange,
}: {
  value: FaqAudience
  onChange: (value: FaqAudience) => void
}) => (
  <div className="flex flex-col items-start gap-3">
    <p className={cn(cafe24Proup.className, 'text-base leading-[1.5] text-primary-500')}>
      자주 묻는 질문
    </p>
    <Tabs value={value} onValueChange={(next) => onChange(next as FaqAudience)}>
      <TabsList aria-label="FAQ 이용자 유형" className="gap-4">
        {FAQ_TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={badgeVariants({
              variant: value === tab.value ? 'primaryFilled' : 'primaryOutline',
              size: 'lg',
            })}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  </div>
)

const FaqContent = () => {
  const [audience, setAudience] = useState<FaqAudience>('adopter')
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const query = useQuery({
    ...FAQ_QUERY_BY_AUDIENCE[audience](),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const faqs = query.data ?? []

  return (
    <div className="flex w-full flex-1 flex-col bg-white pb-16">
      <FaqHero onInquiryClick={() => setInquiryOpen(true)} />

      <Container className="py-5 tab:py-8 pc:py-10">
        {/* FAQ 프레임도 배너와 같은 1134px 열 — 태블릿·모바일은 Container 거터가 이미
            Figma 실측(672/343px)과 같아 별도 상한이 필요 없다 */}
        <div className="mx-auto w-full pc:max-w-[70.875rem]">
          <FaqAudienceTabs value={audience} onChange={setAudience} />

          <div className="mt-7">
            <ListState
              isPending={query.isPending}
              isError={query.isError}
              isEmpty={faqs.length === 0}
              loadingText="자주 묻는 질문을 불러오는 중입니다."
              errorText="자주 묻는 질문을 불러오지 못했습니다."
              emptyText="등록된 질문이 없습니다."
              errorAction={
                <Button variant="fill" size="sm" onClick={() => void query.refetch()}>
                  다시 시도
                </Button>
              }
            >
              <div>
                {faqs.map((faq) => (
                  <FaqItem key={faq.faqId} faq={faq} />
                ))}
              </div>
            </ListState>
          </div>
        </div>
      </Container>

      <InquiryModal open={inquiryOpen} onOpenChange={setInquiryOpen} />
    </div>
  )
}

export { FaqContent }
