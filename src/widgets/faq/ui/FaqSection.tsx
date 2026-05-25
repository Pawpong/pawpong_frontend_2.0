'use client'

import { cn } from '@/shared/lib/Cn'
import { cafe24Proup } from '@/shared/lib/fonts'
import { Container, SectionHeader } from '@/shared/ui'
import { useAdopterFaqs, useBreederFaqs } from '@/entities/home'
import type { HomeUserType } from '@/shared/types'

interface FaqSectionProps {
  userType?: HomeUserType
}

const FaqSection = ({ userType = 'adopter' }: FaqSectionProps) => {
  const { data: faqs } = userType === 'adopter' ? useAdopterFaqs() : useBreederFaqs()

  return (
    <Container className="mt-[3rem] pb-[3rem]">
      <div className="flex flex-col gap-[2rem] tab:flex-row tab:gap-[2.125rem]">
        {/* 서비스 소개 카드 */}
        <div className="flex flex-col gap-[0.5rem] rounded-[1.0625rem] bg-[#ebebeb] px-[1.375rem] py-[0.825rem] tab:h-[15.875rem] tab:w-[18.9375rem] tab:shrink-0 tab:justify-between tab:gap-0 tab:p-[1.375rem]">
          <div className="flex flex-col items-start">
            <p
              className={cn(
                cafe24Proup.className,
                'font-cafe24 text-[1rem] text-[#5d5d5d] tab:text-[1.25rem]',
              )}
            >
              신뢰할 수 있는 입양자
            </p>
            <p className="text-[1rem] font-bold text-[#999] tab:text-[1.25rem]">포퐁에서 만나요!</p>
          </div>
          <div className="flex h-[2.5rem] items-center justify-center rounded-full bg-[#d4d4d4] tab:h-[3rem]">
            <span className="text-[1rem] font-semibold text-[#5d5d5d]">분양 페이지</span>
          </div>
        </div>

        {/* 자주묻는 질문 */}
        <div className="flex-1">
          <SectionHeader title="자주 묻는 질문" linkText="자세히 보기" linkHref="/faq" />
          <div className="mt-[0.721rem] grid grid-cols-1 tab:mt-[1.6525rem] tab:grid-cols-2 tab:gap-x-[2.5rem]">
            {faqs?.map((faq) => (
              <div key={faq.faqId} className="border-b border-[#a8a8a8] py-[0.625rem] first:border-t tab:py-[1.44rem] tab:[&:nth-child(2)]:border-t">
                <p className="text-[0.875rem] font-semibold text-[#818181] tab:text-[1rem]">
                  {faq.question}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  )
}

export { FaqSection }
