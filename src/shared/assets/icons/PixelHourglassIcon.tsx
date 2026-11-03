import type { SVGProps } from 'react'

// 픽셀 모래시계 (10x12) — 예약중·상담 대기 상태 표시
const PixelHourglassIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="10"
      height="12"
      viewBox="0 0 10 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M0 0H10V2H9V4H8V5H7V7H8V8H9V10H10V12H0V10H1V8H2V7H3V5H2V4H1V2H0V0ZM3 2V3H4V4H6V3H7V2H3ZM4 9V10H6V9H4Z"
        fill="currentColor"
      />
    </svg>
  )
}

export { PixelHourglassIcon }
