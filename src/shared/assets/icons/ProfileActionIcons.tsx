import type { SVGProps } from 'react'

// 둥근 2px 윤곽. 선택 시 의미 색상 토큰으로 내부만 채운다.
export const ProfileStarIcon = ({
  filled = false,
  ...props
}: SVGProps<SVGSVGElement> & { filled?: boolean }) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill={filled ? 'var(--color-accent-sun)' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M14.38 6.08 Q15.00 5.00 15.62 6.08 L18.14 10.46 Q18.47 11.03 19.10 11.16 L24.05 12.20 Q25.27 12.46 24.43 13.39 L21.05 17.14 Q20.61 17.62 20.68 18.27 L21.22 23.29 Q21.35 24.54 20.21 24.03 L15.59 21.97 Q15.00 21.70 14.41 21.97 L9.79 24.03 Q8.65 24.54 8.78 23.29 L9.32 18.27 Q9.39 17.62 8.95 17.14 L5.57 13.39 Q4.73 12.46 5.95 12.20 L10.90 11.16 Q11.53 11.03 11.86 10.46 Z" />
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
