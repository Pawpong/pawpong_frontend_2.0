import type { SVGProps } from 'react'

// 2px 그리드의 픽셀 별. 미등록은 빈 별, 등록은 채운 별로 색 없이도 구분한다.
const STAR_OUTLINE =
  'M10 2H14V6H16V8H22V12H20V14H18V16H20V22H16V20H14V18H10V20H8V22H4V16H6V14H4V12H2V8H8V6H10Z'
const STAR_CUTOUT =
  'M10 8H14V10H20V12H18V14H16V16H18V20H16V18H14V16H10V18H8V20H6V16H8V14H6V12H4V10H10Z'

export const ProfileStarIcon = ({
  filled = false,
  ...props
}: SVGProps<SVGSVGElement> & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path
      d={filled ? STAR_OUTLINE : `${STAR_OUTLINE} ${STAR_CUTOUT}`}
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
)

// 가져온 사이렌 경로는 유지하고, 실제 도형의 중심에 맞춰 여백을 정규화한다.
export const ReportFlagIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="3 6.25 22 22" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M10.9199 18.5562H12.1756V21.2081H10.9199V18.5562Z" />
    <path d="M15.8247 18.5562H17.0803V21.2081H15.8247V18.5562Z" />
    <path d="M15.8247 17.3569L15.8247 18.6126L12.1756 18.6126L12.1756 17.3569L15.8247 17.3569Z" />
    <path d="M22.1289 22.2495H23.3763V24.7526H22.1289V22.2495Z" />
    <path d="M18.3784 9.78516H19.6258V11.0408H18.3784V9.78516Z" />
    <path d="M9.62207 8.53809H18.3786V9.78551H9.62207V8.53809Z" />
    <path d="M5.87109 24.7524H22.1287V25.9999H5.87109V24.7524Z" />
    <path d="M8.37451 9.78516H9.62193V11.0408H8.37451V9.78516Z" />
    <path d="M22.1291 22.2493V21.0019H20.8735V11.0122H19.6261V21.0019H8.37463V11.0122H7.119V21.0019H5.87158V22.2493H22.1291Z" />
    <path d="M4.62402 22.2495H5.87145V24.7526H4.62402V22.2495Z" />
  </svg>
)
