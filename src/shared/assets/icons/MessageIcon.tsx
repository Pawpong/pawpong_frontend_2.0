import type { SVGProps } from 'react'

/** 공유·하트와 같은 30px 캔버스의 둥근 댓글 말풍선. */
const MessageIcon = ({
  status = 'default',
  ...props
}: SVGProps<SVGSVGElement> & { status?: 'default' | 'fill' }) => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 30 30"
    fill={status === 'fill' ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M9 5.5h12a4.5 4.5 0 0 1 4.5 4.5v6a4.5 4.5 0 0 1-4.5 4.5h-8L7 25v-5a4.5 4.5 0 0 1-2.5-4v-6A4.5 4.5 0 0 1 9 5.5Z" />
  </svg>
)

export { MessageIcon }
