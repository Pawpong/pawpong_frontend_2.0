import type { SVGProps } from 'react'

const TrophyIcon = (props: SVGProps<SVGSVGElement>) => {
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
        d="M9.68 13.69L12 11.93L14.31 13.69L13.43 10.93L15.75 9.19H12.91L12 6.4L11.09 9.19H8.25L10.56 10.93L9.68 13.69Z"
        fill="currentColor"
      />
      <path
        d="M20 10C20 5.58 16.42 2 12 2C7.58 2 4 5.58 4 10C4 13.37 6.06 16.25 9 17.47V22H12H15V17.47C17.94 16.25 20 13.37 20 10ZM12 16C8.69 16 6 13.31 6 10C6 6.69 8.69 4 12 4C15.31 4 18 6.69 18 10C18 13.31 15.31 16 12 16Z"
        fill="currentColor"
      />
    </svg>
  )
}

export { TrophyIcon }
