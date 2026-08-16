import type { SVGProps } from 'react'

const NaverIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="20"
      height="21"
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3 17.6702V3.0282H7.18342L12.4127 10.8721V3.0282H17.119V17.6702H12.4127L7.18342 10.3492V17.6702H3Z"
        fill="currentColor"
      />
    </svg>
  )
}

export { NaverIcon }
