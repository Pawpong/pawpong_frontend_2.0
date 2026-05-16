'use client'

import { useRouter } from 'next/navigation'
import { useOnboarding } from '../model/OnboardingContext'
import { StepTitle } from './StepTitle'

const CONTACT_EMAIL = 'coldingcontact@gmail.com'

const CompleteStep = () => {
  const router = useRouter()
  const { goBack, userType } = useOnboarding()

  const isBreeder = userType === 'breeder'

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col items-center tab:min-h-0 tab:pb-0">
      <StepTitle>가입완료</StepTitle>

      {/* 로고 (mo only) */}
      <div className="mt-[2.5rem] flex items-center justify-center tab:hidden">
        <span className="text-[2rem] font-bold text-[#5d5d5d]">Pawpong</span>
      </div>

      {/* 환영 + 심사 안내 메시지 */}
      {isBreeder ? (
        <div className="mt-[2rem] flex flex-col items-center gap-[0.95rem] tab:mt-[9.72rem]">
          <p className="text-center text-[1.05rem] font-medium leading-[1.5] text-[rgba(79,59,46,0.8)] tab:text-[1.69rem]">
            포퐁에 오신 걸 환영해요!
            <br />
            브리더 심사는
            <span className="text-[#4e9cf1]"> 최대 3영업일</span> 정도 소요될 수 있어요.
            <br />
            제출한 서류를 변경하고 싶거나,
            <br />
            궁금한 점이 있으면 고객센터로 문의해 주세요.
          </p>
          <div className="flex items-center gap-[0.625rem]">
            <span className="text-[1.1rem] font-medium text-[rgba(79,59,46,0.8)] tab:text-[1.31rem]">
              이메일 문의
            </span>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-[1.1rem] font-normal tracking-[-0.022rem] text-[#4e9cf1] underline tab:text-[1.31rem]"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      ) : (
        <p className="hidden tab:mt-[9.72rem] tab:block tab:text-center tab:text-[1.69rem] tab:font-medium tab:leading-[1.5] tab:text-[rgba(79,59,46,0.8)]">
          포퐁에 오신 걸 환영해요!
        </p>
      )}

      {/* 스페이서 (mo only) */}
      <div className="flex-1 tab:hidden" />

      {/* 버튼 영역 */}
      <div className="flex w-full flex-col gap-[0.625rem] p-[1.25rem] tab:static tab:mt-[12.1875rem] tab:w-[31.4375rem] tab:gap-[0.875rem] tab:p-0 tab:pb-[2rem]">
        <button
          type="button"
          onClick={goBack}
          className="hidden tab:order-last tab:block tab:h-[3rem] tab:w-full tab:rounded-full tab:text-[1rem] tab:font-semibold tab:text-[#5d5d5d]"
        >
          뒤로
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="h-[3rem] w-full rounded-full border border-[#d4d4d4] text-[1rem] font-semibold text-[#5d5d5d] transition-colors tab:order-first tab:border-0 tab:bg-[#d4d4d4]"
        >
          홈으로
        </button>
        <button
          type="button"
          className="h-[3rem] w-full rounded-full bg-[#d4d4d4] text-[1rem] font-semibold text-[#5d5d5d] transition-colors"
        >
          문의하기
        </button>
      </div>
    </div>
  )
}

export { CompleteStep }
