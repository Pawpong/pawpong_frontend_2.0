import type { SVGProps } from 'react'

/**
 * 픽셀 사진 — 꽉 찬 액자에 해와 산을 뚫은 그림. 발바닥·카메라 아이콘과 같은 픽셀 결로
 * 16 격자에 맞춰 그려 16px(size-4)에서 칸이 또렷하다. 프로필 사진 고르기 배지가 쓴다.
 */
const PixelImageIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
    <path
      fillRule="evenodd"
      d="M2 1H14V2H15V14H14V15H2V14H1V2H2Z M10 4H12V6H10Z M6 7H8V8H9V9H10V10H11V9H13V13H3V10H4V9H5V8H6Z"
    />
  </svg>
)

export { PixelImageIcon }
