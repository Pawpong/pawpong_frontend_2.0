import type { SVGProps } from 'react'

// Figma 픽셀 메시지 (community-icon 923:18836) — 20×19.46 글리프를 32×32 박스에 패딩 배치
const PixelMessageIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g transform="translate(6 6.27)">
        <path
          d="M20 2.59863H19.9805V5.4502H20V19.459H0V5.45117H0.0195312V2.59863H0V0H20V2.59863ZM8.57422 14.0059V16.8574H11.4258V14.0059H8.57422ZM5.72266 11.1543V14.0059H8.57422V11.1543H5.72266ZM11.4258 11.1543V14.0059H14.2773V11.1543H11.4258ZM2.87109 8.30273V11.1543H5.72266V8.30273H2.87109ZM14.2773 8.30273V11.1543H17.1289V8.30273H14.2773ZM0.0195312 5.4502V8.30273H2.87109V5.4502H0.0195312ZM17.1289 5.4502V8.30273H19.9805V5.4502H17.1289Z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}

export { PixelMessageIcon }
