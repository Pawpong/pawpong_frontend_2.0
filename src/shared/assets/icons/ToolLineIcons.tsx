import type { SVGProps } from 'react'

// 글쓰기 하단 도구 모음용 둥근 선 아이콘 — 액션 아이콘(ProfileActionIcons)과 같은 둥근 윤곽 계열.
// 그림은 24 칸 안 3~21 에 둔다 (도구 모음에서는 20px 로 쓴다).
const lineProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export const ImageLineIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...lineProps} {...props}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="M21 15.5 16.5 11 8 19.5" />
  </svg>
)

export const LocationLineIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...lineProps} {...props}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

export const InfoLineIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...lineProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5M12 7.5v.01" />
  </svg>
)

export const SparkleLineIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...lineProps} {...props}>
    <path d="M10.5 4 12.3 8.7 17 10.5 12.3 12.3 10.5 17 8.7 12.3 4 10.5 8.7 8.7Z" />
    <path d="M18 15v5M15.5 17.5h5" />
  </svg>
)
