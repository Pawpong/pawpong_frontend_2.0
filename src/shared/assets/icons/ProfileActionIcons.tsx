import type { SVGProps } from 'react'

// 2px 도트 별. 채움 상태에서는 안쪽만 포인트 색으로 칠하고 윤곽은 currentColor 를 유지한다.
export const ProfileStarIcon = ({
  filled = false,
  ...props
}: SVGProps<SVGSVGElement> & { filled?: boolean }) => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="currentColor" aria-hidden="true" {...props}>
    {filled && (
      <path
        fill="var(--color-point-500)"
        d="M14 6h2v2h-2ZM14 8h2v2h-2ZM12 10h6v2h-6ZM6 12h18v2h-18ZM8 14h14v2h-14ZM10 16h10v2h-10ZM10 18h10v2h-10ZM8 20h6v2h-6ZM16 20h6v2h-6ZM8 22h2v2h-2ZM20 22h2v2h-2Z"
      />
    )}
    <path d="M14 4h2v2h-2ZM12 6h2v2h-2ZM16 6h2v2h-2ZM12 8h2v2h-2ZM16 8h2v2h-2ZM4 10h8v2h-8ZM18 10h8v2h-8ZM4 12h2v2h-2ZM24 12h2v2h-2ZM6 14h2v2h-2ZM22 14h2v2h-2ZM8 16h2v2h-2ZM20 16h2v2h-2ZM8 18h2v2h-2ZM20 18h2v2h-2ZM6 20h2v2h-2ZM14 20h2v2h-2ZM22 20h2v2h-2ZM6 22h2v2h-2ZM10 22h4v2h-4ZM16 22h4v2h-4ZM22 22h2v2h-2ZM6 24h4v2h-4ZM20 24h4v2h-4Z" />
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
