import type { SVGProps } from 'react'

const CameraIcon = (props: SVGProps<SVGSVGElement>) => {
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
        d="M17.3213 8.07178H19.9639V10.7144H29.2139V26.5708H2.78613V10.7144H6.75V8.07178H9.39258V5.4292H17.3213V8.07178ZM14.6777 22.6069V25.2495H22.6064V22.6069H14.6777ZM12.0352 15.9995V22.6069H14.6777V15.9995H12.0352ZM22.6064 15.9995V22.6069H25.249V15.9995H22.6064ZM6.75 14.6782V17.3208H9.39258V14.6782H6.75ZM14.6777 13.3569V15.9995H22.6064V13.3569H14.6777Z"
        fill="currentColor"
      />
    </svg>
  )
}

export { CameraIcon }
