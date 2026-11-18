import type { SVGProps } from 'react'

const PixelMessageIcon = ({
  status = 'default',
  ...props
}: SVGProps<SVGSVGElement> & { status?: 'default' | 'fill' }) => {
  const filled = status === 'fill'
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" {...props}>
      <path
        d="M4.5 5.25H25.5V20.25H13.5V21.75H12V23.25H10.5V24.75H7.5V20.25H4.5Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="square"
      />
      <path
        d="M9 11.25h2.25v2.25H9zM13.875 11.25h2.25v2.25h-2.25zM18.75 11.25H21v2.25h-2.25z"
        fill={filled ? 'var(--color-base-white, #fff)' : 'currentColor'}
      />
    </svg>
  )
}
export { PixelMessageIcon }
