import type { CSSProperties } from 'react'

const paths = {
  star: 'M7 1h2v4h4v2h2v2h-4v2h2v4H9v-2H7v2H3v-4h2V9H1V7h2V5h4z',
  heart: 'M2 2h4v2h4V2h4v2h2v6h-2v2h-2v2h-2v2H6v-2H4v-2H2v-2H0V4h2z',
  paw: 'M2 2h3v4H2zm9 0h3v4h-3zM0 7h3v4H0zm13 0h3v4h-3zM5 7h6v3h2v4h-2v1H5v-1H3v-4h2z',
  bone: 'M1 3h3v2h2v2h4V5h2V3h3v2h1v2h-2v2h2v2h-1v2h-3v-2h-2V9H6v2H4v2H1v-2H0V9h2V7H0V5h1z',
  rest: 'M1 3h6v2H5v2H3v2h4v2H1V9h2V7h2V5H1zm9 4h5v2h-2v2h-1v2h3v2h-5v-2h1v-2h2V9h-3z',
  play: 'M4 2h8v2h2v2h2v6h-2v2H2v-2H0V6h2V4h2zm0 4v2H2v2h2v2h2v-2h2V8H6V6zm7 1v2h2V7zm2 3v2h2v-2z',
} as const

export function PetGlyph({
  kind,
  className,
  style,
}: {
  kind: keyof typeof paths
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="20"
      height="20"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d={paths[kind]} />
    </svg>
  )
}
