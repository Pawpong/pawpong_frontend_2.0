import type { SVGProps } from 'react'

const ShareIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M6 17v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" />
    <path d="M15 18V5m-6 6 6-6 6 6" />
  </svg>
)
export { ShareIcon }
