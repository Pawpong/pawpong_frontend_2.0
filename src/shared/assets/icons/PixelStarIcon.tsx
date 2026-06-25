import type { SVGProps } from 'react'

// Figma 픽셀 별 (IconStar 814:99420) — 34.5×34.8 글리프를 48×48 박스 중앙 배치
const PixelStarIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g transform="translate(6.747 6.6)">
        <path
          d="M25.8799 31.9248H20.1279V29.0498H14.3779V31.9248H8.62695V34.8008H2.87598V29.0488H5.75098V23.2979H8.62695V20.4229H5.75098V17.5469H2.87598V14.6719H0V11.7959H10.6426V9.20801H12.7881V4.39258H15.2969V0H19.208V4.39258H21.7178V9.20801H23.8643V11.7959H34.5059V14.6719H31.6309V17.5469H28.7549V20.4229H25.8799V23.2979H28.7549V29.0488H31.6299V31.9248H31.6309V34.8008H25.8799V31.9248Z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}

export { PixelStarIcon }
