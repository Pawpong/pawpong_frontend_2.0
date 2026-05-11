'use client'

import { useState } from 'react'
import { ImageIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/Cn'
import { useOnboarding } from '../model/OnboardingContext'
import { StepIndicator } from './StepIndicator'

const SAMPLE_KEYWORDS = [
  '비숑',
  '도베르만',
  '골든리트리버',
  '푸들',
  '시바이누',
  '말티즈',
  '포메라니안',
  '코기',
  '허스키',
  '사모예드',
  '래브라도',
  '치와와',
  '닥스훈트',
  '보더콜리',
  '슈나우저',
  '비글',
  '요크셔테리어',
  '웰시코기',
  '진돗개',
  '삽살개',
  '풍산개',
]

const InfoStep = () => {
  const { goNext, goBack } = useOnboarding()

  const [nickname, setNickname] = useState('')
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword],
    )
  }

  const canProceed = nickname.length > 0

  return (
    <div className="flex flex-col items-center pb-[8rem] tab:pb-0">
      {/* 타이틀 */}
      <div className="mt-[4.375rem] flex w-full items-center justify-center px-[1.25rem] py-[0.625rem] tab:mt-0 tab:h-[7.8125rem] tab:px-[6.25rem]">
        <h1 className="text-center text-[1.25rem] font-bold leading-[1.5] text-[#5d5d5d] tab:text-[2rem]">
          회원 정보를 입력해주세요
        </h1>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="mt-[1.125rem] tab:mt-[2.09rem]">
        <StepIndicator />
      </div>

      {/* 프로필 이미지 */}
      <div className="mt-[2.09rem] tab:mt-[6.343rem]">
        <button
          type="button"
          className="flex h-[8.9375rem] w-[9.1875rem] items-center justify-center rounded-full bg-[#d4d4d4]"
        >
          <ImageIcon className="size-[3.5rem] text-white" />
        </button>
      </div>

      {/* 폼 영역 */}
      <div className="mt-[2.04rem] flex w-full flex-col px-[1.25rem] tab:mt-[3.0625rem] tab:w-[59.4375rem] tab:px-0">
        {/* 닉네임 + 중복검사 */}
        <div className="flex gap-[0.25rem] tab:gap-[1.1875rem]">
          <input
            type="text"
            placeholder="닉넴"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="h-[2.5rem] flex-1 rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-[0.875rem] leading-[1.375rem] font-medium text-[#333] placeholder:text-[#5d5d5d] outline-none tab:h-[3.25rem] tab:flex-[731] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-[1rem]"
          />
          <button
            type="button"
            className="h-[2.5rem] shrink-0 rounded-[0.375rem] bg-[#a8a8a8] p-[0.625rem] text-[0.875rem] font-medium text-white tab:h-[3rem] tab:w-[12.5625rem] tab:rounded-full tab:bg-[#d4d4d4] tab:px-[0.625rem] tab:text-[1rem] tab:font-semibold tab:text-[#5d5d5d]"
          >
            중복 검사
          </button>
        </div>

        {/* 관심있는 키워드 */}
        <div className="mt-[0.625rem] tab:mt-[2.09rem]">
          <div className="flex min-h-[2.5rem] flex-wrap items-center gap-[0.75rem] rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] tab:min-h-[3.25rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem]">
            <span className="text-[0.875rem] leading-[1.375rem] font-medium text-[#5d5d5d] tab:text-[1rem]">
              관심있는 키워드
            </span>
            {selectedKeywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-[#a8a8a8] px-[0.625rem] py-[0.25rem] text-[0.875rem] font-semibold text-[#a8a8a8]"
              >
                #{keyword}
              </span>
            ))}
          </div>
        </div>

        {/* 키워드 칩 목록 */}
        <div className="mt-[0.75rem] flex flex-wrap gap-[1rem] px-[0.0175rem] tab:mt-[1.05rem] tab:px-[1.9375rem]">
          {SAMPLE_KEYWORDS.map((keyword) => {
            const isSelected = selectedKeywords.includes(keyword)
            return (
              <button
                key={keyword}
                type="button"
                onClick={() => handleKeywordToggle(keyword)}
                className={cn(
                  'rounded-full px-[0.625rem] py-[0.25rem] text-[0.875rem] font-semibold leading-[1.375rem]',
                  isSelected
                    ? 'bg-[#a8a8a8] text-white'
                    : 'border border-[#a8a8a8] text-[#a8a8a8]',
                )}
              >
                {keyword}
              </button>
            )
          })}
        </div>
      </div>

      {/* 다음 / 뒤로 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex flex-col gap-[0.625rem] p-[1.25rem] tab:static tab:bottom-auto tab:left-auto tab:right-auto tab:z-auto tab:mt-[9.9375rem] tab:w-[31.4375rem] tab:gap-[0.875rem] tab:p-0 tab:pb-[2rem]">
        <button
          type="button"
          onClick={goBack}
          className="order-first h-[3rem] w-full rounded-full text-[1rem] font-semibold text-[#5d5d5d] tab:order-last"
        >
          뒤로
        </button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={goNext}
          className={cn(
            'h-[3rem] w-full rounded-full text-[1rem] font-semibold transition-colors',
            canProceed ? 'bg-[#FFD84D] text-black' : 'bg-[#d4d4d4] text-[#5d5d5d]',
          )}
        >
          다음
        </button>
      </div>
    </div>
  )
}

export { InfoStep }
