import type { SVGProps } from 'react'

const KakaoIcon = (props: SVGProps<SVGSVGElement>) => {
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
        d="M10 3.00476C14.4183 3.00476 18 5.8194 18 9.29089C17.9997 12.7622 14.4181 15.576 10 15.576C9.382 15.576 8.78088 15.5182 8.20312 15.4139L4.28613 17.8622L5.42383 14.4452C3.3545 13.3091 2.00018 11.4249 2 9.29089C2 5.81939 5.58173 3.00476 10 3.00476Z"
        fill="#12111B"
      />
    </svg>
  )
}

export { KakaoIcon }
