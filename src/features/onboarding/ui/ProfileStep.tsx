'use client'

import { useState } from 'react'
import { ArrowRightIcon } from '@/shared/assets/icons'
import { Checkbox } from '@/shared/ui'
import { useOnboarding } from '../model/OnboardingContext'
import { StepIndicator } from './StepIndicator'

const EMAIL_DOMAINS = ['gmail.com', 'naver.com', 'daum.net', 'kakao.com', 'hanmail.net']

const AGREEMENTS = [
  { id: 'service', label: '(필수) 서비스 이용약관 동의', required: true, hasDetail: true },
  { id: 'privacy', label: '개인정보 수집 및 이용 동의', required: true, hasDetail: true },
  { id: 'marketing', label: '(선택) 마케팅 수신 동의', required: false, hasDetail: false },
]

const ProfileStep = () => {
  const { goNext, goBack } = useOnboarding()

  const [email, setEmail] = useState('')
  const [emailDomain, setEmailDomain] = useState(EMAIL_DOMAINS[0])
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [agreements, setAgreements] = useState<Record<string, boolean>>({})
  const [isOver14, setIsOver14] = useState(false)

  const allAgreementsChecked = AGREEMENTS.every((a) => agreements[a.id]) && isOver14

  const handleToggleAll = () => {
    const nextValue = !allAgreementsChecked
    const nextAgreements: Record<string, boolean> = {}
    AGREEMENTS.forEach((a) => {
      nextAgreements[a.id] = nextValue
    })
    setAgreements(nextAgreements)
    setIsOver14(nextValue)
  }

  const handleToggle = (id: string) => {
    setAgreements((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="flex flex-col items-center pb-[8rem] tab:pb-0">
      {/* 타이틀 */}
      <div className="mt-[4.375rem] flex w-full items-center justify-center px-[1.25rem] py-[0.625rem] tab:mt-0 tab:h-[7.8125rem] tab:px-[6.25rem]">
        <h1 className="text-center text-[1.25rem] font-bold leading-[1.5] text-[#5d5d5d] tab:text-[2rem]">
          계정 정보를 입력해주세요
        </h1>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="mt-[1.125rem] tab:mt-[2.09rem]">
        <StepIndicator />
      </div>

      {/* 폼 영역 */}
      <div className="mt-[2.625rem] flex w-full flex-col px-[1.25rem] tab:mt-[7.1875rem] tab:w-[59.4375rem] tab:px-0">
        {/* 이메일 */}
        <div className="flex gap-[0.25rem] tab:gap-[1.25rem]">
          <input
            type="text"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[2.5rem] flex-1 rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-[0.875rem] leading-[1.375rem] font-medium text-[#333] placeholder:text-[#5d5d5d] outline-none tab:h-[3.25rem] tab:flex-[731] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-[1rem]"
          />
          <div className="relative shrink-0 tab:w-[12.5rem]">
            <select
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              className="h-[2.5rem] w-full appearance-none rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] pr-[2rem] text-[0.875rem] leading-[1.375rem] font-medium text-[#5d5d5d] outline-none tab:h-[3.25rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:pr-[2.5rem] tab:text-[1rem]"
            >
              {EMAIL_DOMAINS.map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
            <ArrowRightIcon className="pointer-events-none absolute top-1/2 right-[0.5rem] size-[1rem] -translate-y-1/2 rotate-90 text-[#5d5d5d] tab:right-[1rem] tab:size-[1.25rem]" aria-hidden />
          </div>
        </div>

        {/* 휴대폰 번호 */}
        <div className="mt-[0.625rem] flex gap-[0.25rem] tab:mt-[1.6875rem] tab:gap-[1.1875rem]">
          <input
            type="tel"
            placeholder="휴대폰번호"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-[2.5rem] flex-1 rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-[0.875rem] leading-[1.375rem] font-medium text-[#333] placeholder:text-[#5d5d5d] outline-none tab:h-[3.25rem] tab:flex-[731] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-[1rem]"
          />
          <button
            type="button"
            className="h-[2.5rem] shrink-0 rounded-[0.375rem] bg-[#a8a8a8] p-[0.625rem] text-[0.875rem] font-medium text-white tab:h-[3rem] tab:rounded-full tab:bg-[#d4d4d4] tab:px-[0.625rem] tab:text-[1rem] tab:font-semibold tab:text-[#5d5d5d] tab:w-[12.5625rem]"
          >
            인증번호 받기
          </button>
        </div>

        {/* 인증번호 */}
        <div className="mt-[0.625rem] flex gap-[0.25rem] tab:mt-[1.6875rem] tab:gap-[1.1875rem]">
          <div className="relative flex-1 tab:flex-[731]">
            <input
              type="text"
              placeholder="인증번호"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="h-[2.5rem] w-full rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] pr-[3rem] text-[0.875rem] leading-[1.375rem] font-medium text-[#333] placeholder:text-[#5d5d5d] outline-none tab:h-[3.25rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem] tab:text-[1rem]"
            />
            <span className="absolute top-1/2 right-[0.625rem] -translate-y-1/2 text-[0.75rem] leading-[1.375rem] text-[#5d5d5d] tab:right-[1.25rem] tab:text-[1rem]">
              03:00
            </span>
          </div>
          <button
            type="button"
            className="h-[2.5rem] shrink-0 rounded-[0.375rem] bg-[#a8a8a8] p-[0.625rem] text-[0.875rem] font-medium text-white tab:h-[3rem] tab:rounded-full tab:bg-[#d4d4d4] tab:px-[0.625rem] tab:text-[1rem] tab:font-semibold tab:w-[12.5625rem]"
          >
            확인
          </button>
        </div>

        {/* 약관 동의 */}
        <div className="mt-[2.5625rem] flex flex-col tab:mt-[1.688rem]">
          {/* 전체 약관동의 */}
          <label className="flex cursor-pointer items-start gap-[0.75rem] rounded-[1rem] bg-white px-[1.25rem] py-[0.9375rem]">
            <Checkbox
              checked={allAgreementsChecked}
              onCheckedChange={handleToggleAll}
              className="size-[1.5rem] rounded-[0.1875rem] border-2 border-[#a8a8a8] bg-white shadow-none data-[state=checked]:border-[#5d5d5d] data-[state=checked]:bg-white data-[state=checked]:text-[#5d5d5d]"
            />
            <span className="text-[1rem] leading-[1.375rem] font-medium text-[#5d5d5d]">
              전체 약관동의
            </span>
          </label>

          {/* 개별 약관 */}
          {AGREEMENTS.map((agreement) => (
            <label
              key={agreement.id}
              className="flex cursor-pointer items-start gap-[0.75rem] rounded-[1rem] bg-white px-[1.25rem] py-[0.9375rem]"
            >
              <Checkbox
                checked={!!agreements[agreement.id]}
                onCheckedChange={() => handleToggle(agreement.id)}
                className="size-[1.5rem] rounded-[0.1875rem] border-2 border-[#a8a8a8] bg-white shadow-none data-[state=checked]:border-[#5d5d5d] data-[state=checked]:bg-white data-[state=checked]:text-[#5d5d5d]"
              />
              <span className="flex-1 text-[1rem] leading-[1.375rem] font-medium text-[#5d5d5d]">
                {agreement.label}
              </span>
              {agreement.hasDetail && (
                <button
                  type="button"
                  className="flex shrink-0 items-center gap-[0.375rem] text-[1rem] leading-[1.375rem] font-medium text-[#5d5d5d]"
                >
                  자세히 보기
                  <ArrowRightIcon className="size-[1.25rem] shrink-0 text-[#5d5d5d]" aria-hidden />
                </button>
              )}
            </label>
          ))}
        </div>

        {/* 만 14세 확인 */}
        <label className="mt-[2.4375rem] flex cursor-pointer items-start gap-[0.75rem] rounded-[1rem] bg-white px-[1.25rem] py-[0.9375rem]">
          <Checkbox
            checked={isOver14}
            onCheckedChange={() => setIsOver14((prev) => !prev)}
            className="size-[1.5rem] rounded-[0.1875rem] border-2 border-[#a8a8a8] bg-white shadow-none data-[state=checked]:border-[#5d5d5d] data-[state=checked]:bg-white data-[state=checked]:text-[#5d5d5d]"
          />
          <span className="text-[1rem] leading-[1.375rem] font-medium text-[#5d5d5d]">
            본인은 만 14세 이상입니다.
          </span>
        </label>
      </div>

      {/* 다음 / 뒤로 버튼 */}
      {/* 모바일: 하단 고정, 뒤로→다음 순서 / 태블릿+: 인라인, 다음→뒤로 순서 */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex flex-col gap-[0.625rem] p-[1.25rem] tab:static tab:bottom-auto tab:left-auto tab:right-auto tab:z-auto tab:mt-[3.375rem] tab:w-[31.4375rem] tab:gap-[0.875rem] tab:p-0 tab:pb-[2rem]">
        <button
          type="button"
          onClick={goBack}
          className="order-first h-[3rem] w-full rounded-full text-[1rem] font-semibold text-[#5d5d5d] tab:order-last"
        >
          뒤로
        </button>
        <button
          type="button"
          onClick={goNext}
          className="h-[3rem] w-full rounded-full bg-[#d4d4d4] text-[1rem] font-semibold text-[#5d5d5d] transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  )
}

export { ProfileStep }
