import type { SVGProps } from 'react'

const PixelArrowRightIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M21.5 4H11.5V14H21.5V4Z" fill="currentColor" />
      <path d="M29 11.5H19V21.5H29V11.5Z" fill="currentColor" />
      <path d="M36.5 19H26.5V29H36.5V19Z" fill="currentColor" />
      <path d="M29 26.5H19V36.5H29V26.5Z" fill="currentColor" />
      <path d="M21.5 34H11.5V44H21.5V34Z" fill="currentColor" />
    </svg>
  )
}

export { PixelArrowRightIcon }
