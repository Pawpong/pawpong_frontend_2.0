import type { SVGProps } from 'react'

type AuthMenuIconProps = SVGProps<SVGSVGElement> & {
  direction: 'login' | 'logout'
}

const AuthMenuIcon = ({ direction, ...props }: AuthMenuIconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    {direction === 'login' ? (
      <>
        <path d="M15 5H25V25H15V23H23V7H15V5Z" fill="currentColor" />
        <path
          d="M11 8H13V10H15V12H17V14H19V16H17V18H15V20H13V22H11V20H13V18H15V16H5V14H15V12H13V10H11V8Z"
          fill="currentColor"
        />
      </>
    ) : (
      <>
        <path d="M5 5H15V7H7V23H15V25H5V5Z" fill="currentColor" />
        <path
          d="M17 8H19V10H21V12H23V14H25V16H23V18H21V20H19V22H17V20H19V18H21V16H11V14H21V12H19V10H17V8Z"
          fill="currentColor"
        />
      </>
    )}
  </svg>
)

export { AuthMenuIcon }
