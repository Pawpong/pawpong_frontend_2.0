import type { SVGProps } from 'react'

// Figma 픽셀 하트 (public/images/heart.svg) — viewBox 32×32 박스에 글리프가 여백을 두고 들어감.
// ShareIcon과 동일한 박스 컨벤션이라 size-[2rem] 등 동일 크기로 사용 가능.
const FavoriteIcon = (props: SVGProps<SVGSVGElement>) => {
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
        d="M14.917 23.833H13.4521V22.5596H12.1777V21.2861H10.9043V20.0117H9.63086V18.7383H8.35645V17.4639H7.08301V16.1904H5.80859V14.917H4.53516V11.0957H27.4639V14.917H26.1904V16.1904H24.916V17.4639H23.6426V18.7383H22.3691V20.0117H21.0947V21.2861H19.8213V22.5596H18.5469V23.833H17.083V26H14.917V23.833ZM15.3857 9.82129H16.6133V8.54785H26.1904V9.82129H27.4639V11.0947H4.53516V9.82129H5.80859V8.54785H15.3857V9.82129ZM13.4521 7.27344H14.7256V8.54688H7.08301V7.27344H8.35645V6H13.4521V7.27344ZM23.6426 7.27344H24.916V8.54688H17.2734V7.27344H18.5469V6H23.6426V7.27344Z"
        fill="currentColor"
      />
    </svg>
  )
}

export { FavoriteIcon }
