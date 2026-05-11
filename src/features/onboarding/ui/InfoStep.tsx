'use client'

import { useOnboarding } from '../model/OnboardingContext'
import { StepIndicator } from './StepIndicator'

const InfoStep = () => {
  const { goNext, goBack } = useOnboarding()

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full items-center justify-center px-[1.25rem] py-[0.625rem] tab:h-[7.8125rem] tab:px-[6.25rem]">
        <h1 className="text-center text-[1.25rem] font-bold leading-snug text-[#5d5d5d] tab:text-[2rem]">
          회원 정보를 입력해주세요
        </h1>
      </div>

      <div className="mt-[1.25rem] hidden tab:flex">
        <StepIndicator />
      </div>

      <div className="mt-[1.5rem] flex w-full flex-col items-center px-[1.25rem] tab:mt-[6.25rem] tab:w-[59.4375rem] tab:px-0">
        <p className="text-[#5d5d5d]">회원 정보를 입력해 주세요.</p>
      </div>

      <div className="mt-[2rem] flex w-full flex-col items-center gap-[0.875rem] px-[1.25rem] pb-[2rem] tab:mt-[4rem] tab:w-[31.4375rem] tab:px-0">
        <button
          type="button"
          onClick={goNext}
          className="h-[3rem] w-full rounded-full bg-[#FFD84D] text-[1rem] font-semibold text-black"
        >
          다음
        </button>
        <button
          type="button"
          onClick={goBack}
          className="h-[3rem] w-full rounded-full text-[1rem] font-semibold text-[#5d5d5d]"
        >
          뒤로
        </button>
      </div>
    </div>
  )
}

export { InfoStep }
