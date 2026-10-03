import type { SVGProps } from 'react'

type ShareModalIconKind = 'kakao' | 'facebook' | 'naver' | 'copy' | 'native' | 'close'

// 팝업 전용: 브랜드 표식과 두 보조 동작을 같은 픽셀 프레임 안에서 구분한다.
const ShareModalIcon = ({
  kind,
  ...props
}: SVGProps<SVGSVGElement> & { kind: ShareModalIconKind }) => {
  if (kind === 'close')
    return (
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        shapeRendering="crispEdges"
        aria-hidden="true"
        {...props}
      >
        <path d="M3 2h2v2h2v2h2V4h2V2h2v3h-2v2H9v2h2v2h2v3h-2v-2H9v-2H7v2H5v2H3v-3h2V9h2V7H5V5H3Z" />
      </svg>
    )

  const background = {
    kakao: '#ffe812',
    facebook: '#0866ff',
    naver: '#03c75a',
    copy: 'var(--color-point-100)',
    native: 'var(--color-secondary-100)',
  }[kind]

  return (
    <svg viewBox="0 0 32 32" fill="none" shapeRendering="crispEdges" aria-hidden="true" {...props}>
      <path
        d="M10 0h12v2h4v2h2v2h2v4h2v12h-2v4h-2v2h-2v2h-4v2H10v-2H6v-2H4v-2H2v-4H0V10h2V6h2V4h2V2h4Z"
        fill="var(--color-primary-500)"
      />
      <path
        d="M10 2h12v2h4v2h2v4h2v12h-2v4h-2v2h-4v2H10v-2H6v-2H4v-4H2V10h2V6h2V4h4Z"
        fill={background}
      />
      {kind === 'kakao' && (
        <g fill="#3c1e1e">
          <path d="M9 9h14v2h3v9h-3v2h-9v2h-2v2h-2v-5H7v-2H5v-6h2v-2h2Z" />
          <g fill="#ffe812">
            {/* TALK: 네 글자도 픽셀 격자에 맞춘다. */}
            <path
              d="M8 14h3v1h-1v4H9v-4H8Zm4 0h3v5h-1v-2h-1v2h-1Zm1 1v1h1v-1Zm3-1h1v4h2v1h-3Zm4 0h1v2h1v-2h1v2h-1v1h1v2h-1v-2h-1v2h-1Z"
              fillRule="evenodd"
            />
          </g>
        </g>
      )}
      {kind === 'facebook' && (
        <path d="M17 7h5v4h-4v4h4v2h-1v2h-3v8h-5v-8h-3v-4h3v-5h2V8h2Z" fill="white" />
      )}
      {kind === 'naver' && (
        <path d="M8 8h5v3h2v3h2v3h2V8h5v16h-5v-3h-2v-3h-2v-3h-2v9H8Z" fill="white" />
      )}
      {kind === 'copy' && (
        <g fill="var(--color-primary-700)">
          <path d="M16 7h6v2h2v2h2v6h-2v2h-3v-3h2v-5h-2V9h-5v2h-3V9h3ZM11 13v3H9v5h2v2h5v-2h3v3h-2v2h-6v-2H9v-2H7v-6h2v-3Z" />
          <path d="M17 12h3v3h-3v3h-3v3h-3v-3h3v-3h3Z" />
        </g>
      )}
      {kind === 'native' && (
        <g fill="var(--color-primary-700)">
          <path d="M14 7h4v2h2v2h2v2h-4v7h-4v-7h-4v-2h2V9h2Z" />
          <path d="M7 17h3v7h12v-7h3v10H7Z" />
        </g>
      )}
    </svg>
  )
}

export { ShareModalIcon }
