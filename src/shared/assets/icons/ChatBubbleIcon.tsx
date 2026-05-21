import type { SVGProps } from 'react'

const ChatBubbleIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 3C7.03 3 3 6.58 3 11C3 13.13 4.02 15.04 5.67 16.41L4.5 20.5L9.12 18.76C10.04 18.92 11 19 12 19C16.97 19 21 15.42 21 11C21 6.58 16.97 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export { ChatBubbleIcon }
