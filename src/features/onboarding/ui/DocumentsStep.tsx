'use client'

import { useOnboarding } from '../model/OnboardingContext'

const DocumentsStep = () => {
  const { goNext, goBack } = useOnboarding()

  return (
    <div className="flex flex-col items-center gap-[2rem] p-[1.25rem]">
      <h2 className="text-[1.5rem] font-bold text-[#333]">서류 제출</h2>
      <p className="text-[#5d5d5d]">필요한 서류를 업로드해 주세요.</p>

      <div className="mt-[2rem] flex gap-[1rem]">
        <button
          type="button"
          onClick={goBack}
          className="h-[3rem] rounded-full border border-[#d4d4d4] px-[2rem] font-semibold text-[#5d5d5d]"
        >
          이전
        </button>
        <button
          type="button"
          onClick={goNext}
          className="h-[3rem] rounded-full bg-[#FFD84D] px-[2rem] font-semibold text-black"
        >
          다음
        </button>
      </div>
    </div>
  )
}

export { DocumentsStep }
