import { forwardRef, type ButtonHTMLAttributes } from 'react'
import Image from 'next/image'

// 온보딩에서 쓰는 포퐁 강아지와 한 줄 라벨로 문의 진입점을 알아보기 쉽게 만든다.
const SupportInquiryTrigger = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => (
  <button
    {...props}
    ref={ref}
    type="button"
    aria-label="AI 문의하기"
    className="fixed right-4 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-sticky inline-flex min-h-14 items-center gap-2.5 rounded-xl border border-primary-200 bg-point-50 py-2 pr-4 pl-2.5 text-primary-700 shadow-[0_7px_7px_0_rgba(55,55,55,0.1)] focus-ring transition-colors hover:border-primary-500 hover:bg-point-100 active:bg-point-200 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none tab:right-12 pc:hidden"
  >
    <Image
      src="/images/onboarding/animal-dog-qa.svg"
      alt=""
      width={40}
      height={40}
      className="size-10 shrink-0 object-contain"
    />
    <span className="text-sm leading-[1.5] font-semibold whitespace-nowrap">AI 문의하기</span>
  </button>
))
SupportInquiryTrigger.displayName = 'SupportInquiryTrigger'

export { SupportInquiryTrigger }
