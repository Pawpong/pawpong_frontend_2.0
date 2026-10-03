import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { PawPrintIcon } from '@/shared/assets'

// 계단식 원형 장식만 SVG 안에 넣어 버튼의 키보드 포커스가 잘리지 않게 한다.
const PIXEL_CIRCLE =
  'M24 2H48V6H56V10H62V16H66V24H70V48H66V56H62V62H56V66H48V70H24V66H16V62H10V56H6V48H2V24H6V16H10V10H16V6H24Z'

const SupportInquiryTrigger = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => (
  <button
    {...props}
    ref={ref}
    type="button"
    aria-label="AI 문의하기"
    className="group fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-sticky flex size-18 flex-col items-center justify-center gap-1 rounded-xl text-primary-700 focus-ring tab:hidden"
  >
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 76 76"
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
      shapeRendering="crispEdges"
    >
      <path d={PIXEL_CIRCLE} transform="translate(3 4)" className="fill-primary-200" />
      <path
        d={PIXEL_CIRCLE}
        className="fill-action-primary stroke-primary-700 transition-colors group-hover:fill-action-primary-hover group-active:fill-action-primary-press motion-reduce:transition-none"
        strokeWidth="2"
      />
    </svg>
    <PawPrintIcon aria-hidden className="relative size-6" />
    <span className="relative text-[0.6875rem] leading-[1.5] font-semibold">AI 문의하기</span>
  </button>
))
SupportInquiryTrigger.displayName = 'SupportInquiryTrigger'

export { SupportInquiryTrigger }
