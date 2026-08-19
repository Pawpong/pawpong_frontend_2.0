import type { SVGProps } from 'react'

/**
 * 픽셀 별 - 미등록(외곽선) 상태 (Figma icon/star 2949-296222, status default/default-header).
 *
 * 7x7 픽셀 그리드의 마름모 외곽선 12칸. 시안은 칸마다 사각형을 두지만 여기서는 한 path 로 합쳤다.
 * viewBox 를 7x7 로 두어 어떤 크기로 렌더해도 칸이 정수로 맞아떨어진다.
 * (등록 완료 상태는 내부가 노랑+갈색 투톤이라 별도 아이콘이 필요하다)
 */
const PixelStarOutlineIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 7 7"
    fill="currentColor"
    shapeRendering="crispEdges"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M3 0h1v1H3zM2 1h1v1H2zM4 1h1v1H4zM1 2h1v1H1zM5 2h1v1H5zM0 3h1v1H0zM6 3h1v1H6zM1 4h1v1H1zM5 4h1v1H5zM2 5h1v1H2zM4 5h1v1H4zM3 6h1v1H3z" />
  </svg>
)

export { PixelStarOutlineIcon }
