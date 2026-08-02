import type { SVGProps } from 'react'

type FavoriteIconSize = 'md' | 'lg'
type FavoriteIconStatus = 'default' | 'fill'

interface FavoriteIconProps extends Omit<SVGProps<SVGSVGElement>, 'size'> {
  /** Figma 아이콘 박스 크기: md 32px, lg 48px */
  size?: FavoriteIconSize
  /** default는 외곽선형 픽셀 하트, fill은 채워진 픽셀 하트 */
  status?: FavoriteIconStatus
}

const iconMetrics = {
  md: { dimension: 32, scale: 0.6, translateX: 4, translateY: 4.6 },
  lg: { dimension: 48, scale: 1, translateX: 4, translateY: 5 },
} as const

const paths: Record<FavoriteIconStatus, string> = {
  fill: 'M17.7773 33.25H13.333V28.5H8.88867V23.75H4.44434V19H0V4.75H4.44434V0H13.333V4.75H17.7773V9.5H22.2227V4.75H26.667V0H35.5557V4.75H40V19H35.5557V23.75H31.1113V28.5H26.667V33.25H22.2227V38H17.7773V33.25Z',
  default:
    'M22.2227 33.25V38H17.7773V33.25H22.2227ZM17.7773 33.25H13.333V28.5H17.7773V33.25ZM26.667 33.25H22.2227V28.5H26.667V33.25ZM13.333 28.5H8.88867V23.75H13.333V28.5ZM31.1113 28.5H26.667V23.75H31.1113V28.5ZM8.88867 23.75H4.44434V19H8.88867V23.75ZM35.5557 23.75H31.1113V19H35.5557V23.75ZM4.44434 19H0V4.75H4.44434V19ZM40 19H35.5557V4.75H40V19ZM22.2227 14.25H17.7773V9.5H22.2227V14.25ZM17.7773 9.5H13.333V4.75H17.7773V9.5ZM26.667 9.5H22.2227V4.75H26.667V9.5ZM13.333 4.75H4.44434V0H13.333V4.75ZM35.5557 4.75H26.667V0H35.5557V4.75Z',
}

/** Figma icon/heart — 크기·상태·색상을 한 SVG 컴포넌트에서 제어한다. */
const FavoriteIcon = ({ size = 'md', status = 'default', ...props }: FavoriteIconProps) => {
  const { dimension, scale, translateX, translateY } = iconMetrics[size]

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d={paths[status]}
        fill="currentColor"
        transform={`translate(${translateX} ${translateY}) scale(${scale})`}
      />
    </svg>
  )
}

export { FavoriteIcon }
export type { FavoriteIconProps, FavoriteIconSize, FavoriteIconStatus }
