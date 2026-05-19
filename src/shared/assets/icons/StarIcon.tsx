import type { SVGProps } from 'react'

const StarIcon = (props: SVGProps<SVGSVGElement>) => {
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
        d="M12 2L14.09 8.26L20.18 8.64L15.55 12.74L17.09 19.02L12 15.77L6.91 19.02L8.45 12.74L3.82 8.64L9.91 8.26L12 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export { StarIcon }
