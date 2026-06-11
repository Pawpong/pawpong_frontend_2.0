import type { SVGProps } from 'react'

interface GenderIconProps extends SVGProps<SVGSVGElement> {
  gender: 'male' | 'female'
}

const GenderIcon = ({ gender, ...props }: GenderIconProps) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {gender === 'female' ? (
        <path
          d="M17.5 9.5C17.5 6.46 15.04 4 12 4S6.5 6.46 6.5 9.5c0 2.7 1.94 4.93 4.5 5.4V17H9v2h2v2h2v-2h2v-2h-2v-2.1c2.56-.47 4.5-2.7 4.5-5.4zM8.5 9.5C8.5 7.57 10.07 6 12 6s3.5 1.57 3.5 3.5S13.93 13 12 13 8.5 11.43 8.5 9.5z"
          fill="currentColor"
        />
      ) : (
        <path
          d="M9.5 11c1.93 0 3.5 1.57 3.5 3.5S11.43 18 9.5 18 6 16.43 6 14.5 7.57 11 9.5 11zm0-2C6.46 9 4 11.46 4 14.5S6.46 20 9.5 20s5.5-2.46 5.5-5.5c0-1.16-.36-2.23-.97-3.12L18 7.41V10h2V4h-6v2h2.59l-3.97 3.97C13.73 9.36 12.66 9 11.5 9h-2z"
          fill="currentColor"
        />
      )}
    </svg>
  )
}

export { GenderIcon }
