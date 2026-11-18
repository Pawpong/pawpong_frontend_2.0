import type { SVGProps } from 'react'

const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="square"
    aria-hidden="true"
    {...props}
  >
    <path d="M15 6V24M6 15H24" />
  </svg>
)

export { PlusIcon }
