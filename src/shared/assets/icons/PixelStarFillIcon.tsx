import type { SVGProps } from 'react'

/**
 * 픽셀 별 - 등록 완료(채움) 상태 (Figma icon/star 2949-296222, status fill).
 *
 * 7x7 그리드 25칸 투톤: 테두리 갈색(primary-500) + 내부 노랑(point-500) + 하이라이트 흰색 1칸.
 * 색이 세 가지라 currentColor 를 쓸 수 없어 토큰 값을 그대로 박는다.
 */
const BORDER = '#ad651d' // primary-500
const INNER = '#fffe72' // point-500

const PixelStarFillIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 7 7"
    fill="none"
    shapeRendering="crispEdges"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3 0h1v1H3zM2 1h1v1H2zM4 1h1v1H4zM1 2h1v1H1zM5 2h1v1H5zM0 3h1v1H0zM6 3h1v1H6zM1 4h1v1H1zM5 4h1v1H5zM2 5h1v1H2zM4 5h1v1H4zM3 6h1v1H3z"
      fill={BORDER}
    />
    <path
      d="M2 2h1v1H2zM3 2h1v1H3zM4 2h1v1H4zM1 3h1v1H1zM2 3h1v1H2zM3 3h1v1H3zM4 3h1v1H4zM5 3h1v1H5zM2 4h1v1H2zM3 4h1v1H3zM4 4h1v1H4zM3 5h1v1H3z"
      fill={INNER}
    />
    <path d="M3 1h1v1H3z" fill="#fff" />
  </svg>
)

export { PixelStarFillIcon }
