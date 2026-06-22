import type { SVGProps } from 'react'

/** 픽셀 스타일 위치 핀 아이콘 (가운데 구멍은 mask로 처리) */
const LocationPinIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <mask
        id="locationPinMask"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x="5"
        y="2"
        width="22"
        height="28"
      >
        <path d="M26.7125 2.60934H5.28748V29.3907H26.7125V2.60934Z" fill="white" />
        <path d="M18.0086 9.97421H13.9914V11.3133H18.0086V9.97421Z" fill="black" />
        <path d="M19.3477 11.3133H12.6523V12.6523H19.3477V11.3133Z" fill="black" />
        <path d="M20.0172 12.6523H11.9828V15.3305H20.0172V12.6523Z" fill="black" />
        <path d="M19.3477 15.3305H12.6523V16.6695H19.3477V15.3305Z" fill="black" />
        <path d="M18.0086 16.6695H13.9914V18.0086H18.0086V16.6695Z" fill="black" />
      </mask>
      <g mask="url(#locationPinMask)" fill="currentColor">
        <path d="M18.6781 2.60934H13.3219V3.9484H18.6781V2.60934Z" />
        <path d="M21.3563 3.9484H10.6438V5.28747H21.3563V3.9484Z" />
        <path d="M22.6954 5.28748H9.30469V6.62654H22.6954V5.28748Z" />
        <path d="M24.0344 6.62654H7.96564V7.96561H24.0344V6.62654Z" />
        <path d="M25.3735 7.9656H6.62653V10.6437H25.3735V7.9656Z" />
        <path d="M26.7125 10.6437H5.28748V17.3391H26.7125V10.6437Z" />
        <path d="M25.3735 17.3391H6.62653V20.0172H25.3735V17.3391Z" />
        <path d="M24.0344 20.0172H7.96564V21.3563H24.0344V20.0172Z" />
        <path d="M22.6954 21.3563H9.30469V22.6953H22.6954V21.3563Z" />
        <path d="M21.3563 22.6953H10.6438V24.0344H21.3563V22.6953Z" />
        <path d="M20.0172 24.0344H11.9828V25.3735H20.0172V24.0344Z" />
        <path d="M18.6781 25.3735H13.3219V26.7125H18.6781V25.3735Z" />
        <path d="M17.3391 26.7125H14.6609V28.0516H17.3391V26.7125Z" />
        <path d="M16.6695 28.0516H15.3305V29.3906H16.6695V28.0516Z" />
      </g>
    </svg>
  )
}

export { LocationPinIcon }
