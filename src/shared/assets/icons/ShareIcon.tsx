import type { SVGProps } from 'react'

const ShareIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.6783 24.1091V26.0173H9.32185V24.1091H22.6783ZM9.32185 24.1091H7.41364V16.4773H9.32185V24.1091ZM24.5865 24.1091H22.6783V16.4773H24.5865V24.1091ZM16.9537 7.89136H18.8619V9.79956H16.9537V19.3396H15.0455V9.79956H13.1383V11.7078H11.23V9.79956H13.1383V7.89136H15.0455V5.98315H16.9537V7.89136ZM20.7701 11.7078H18.8619V9.79956H20.7701V11.7078Z"
        fill="currentColor"
      />
    </svg>
  )
}

export { ShareIcon }
