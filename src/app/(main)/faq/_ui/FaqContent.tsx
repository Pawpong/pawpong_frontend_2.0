'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { homeQueries } from '@/entities/home'
import { ChevronDownIcon } from '@/shared/assets'
import type { FaqDto } from '@/shared/types'
import { Button, Container, ListState, NavigationBar, TabBar } from '@/shared/ui'

type FaqAudience = 'adopter' | 'breeder'

const FAQ_TABS = [
  { value: 'adopter', label: '입양자' },
  { value: 'breeder', label: '브리더' },
]

const FaqItem = ({ faq }: { faq: FaqDto }) => (
  <details className="group border-b border-neutral-150 last:border-b-0">
    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500 [&::-webkit-details-marker]:hidden tab:min-h-18 tab:px-5">
      <span className="min-w-0 text-sm leading-[1.5] font-semibold text-neutral-850 tab:text-base">
        {faq.question}
      </span>
      <ChevronDownIcon className="size-5 shrink-0 text-neutral-500 transition-transform group-open:rotate-180 group-open:text-primary-500" />
    </summary>
    <div className="bg-primary-50/50 px-4 py-4 text-sm leading-[1.6] font-medium whitespace-pre-line text-neutral-700 tab:px-5 tab:text-base">
      {faq.answer}
    </div>
  </details>
)

const FaqContent = () => {
  const [audience, setAudience] = useState<FaqAudience>('adopter')
  const query = useQuery({
    ...(audience === 'adopter' ? homeQueries.adopterFaqs() : homeQueries.breederFaqs()),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const faqs = query.data ?? []

  return (
    <div className="flex w-full flex-1 flex-col bg-primary-50/20 pb-16">
      <NavigationBar title="자주 묻는 질문" backHref="/" />
      <TabBar
        items={FAQ_TABS}
        value={audience}
        onValueChange={(value) => setAudience(value as FaqAudience)}
        ariaLabel="FAQ 이용자 유형"
      />

      <Container className="py-5 tab:py-8 pc:py-10">
        <div className="mx-auto w-full max-w-168 pc:max-w-[59.25rem]">
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
            <div className="overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_7px_7px_rgba(55,55,55,0.06)]">
              {faqs.map((faq) => (
                <FaqItem key={faq.faqId} faq={faq} />
              ))}
            </div>
          </ListState>
        </div>
      </Container>
    </div>
  )
}

export { FaqContent }
