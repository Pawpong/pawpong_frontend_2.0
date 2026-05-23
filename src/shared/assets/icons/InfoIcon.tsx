import type { SVGProps } from 'react'

const InfoIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8 1.333A6.674 6.674 0 0 0 1.333 8 6.674 6.674 0 0 0 8 14.667 6.674 6.674 0 0 0 14.667 8 6.674 6.674 0 0 0 8 1.333Zm.667 10H7.333V7.333h1.334v4Zm0-5.333H7.333V4.667h1.334V6Z"
        fill="currentColor"
      />
    </svg>
  )
}

export { InfoIcon }
