const SHAPES: Record<string, string[]> = {
  first_step: [
    '001101100',
    '011111110',
    '001111100',
    '000111000',
    '001111100',
    '011111110',
    '001111100',
  ],
  first_story: [
    '111101111',
    '100111001',
    '101101101',
    '101101101',
    '100111001',
    '111101111',
    '000010000',
  ],
  story_connector: [
    '011000110',
    '111101111',
    '010111010',
    '000111000',
    '010111010',
    '111101111',
    '011000110',
  ],
  first_introduction: [
    '000111000',
    '001111100',
    '011111110',
    '111111111',
    '011111110',
    '011010110',
    '011111110',
  ],
  on_stage: [
    '001111100',
    '011111110',
    '110111011',
    '110111011',
    '011111110',
    '000111000',
    '001111100',
  ],
  hall_of_fame: [
    '100010001',
    '110111011',
    '111111111',
    '011111110',
    '011111110',
    '001111100',
    '011111110',
  ],
}
export function PixelActivityBadge({
  badgeKey,
  title,
  locked = false,
  size = 52,
}: {
  badgeKey: string
  title: string
  locked?: boolean
  size?: number
}) {
  const rows = SHAPES[badgeKey] ?? SHAPES.first_step
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 15 15"
      role="img"
      aria-label={title}
      shapeRendering="crispEdges"
      className={locked ? 'opacity-40 grayscale' : undefined}
    >
      <path fill="#184c38" d="M3 0h9v1h2v2h1v9h-1v2h-2v1H3v-1H1v-2H0V3h1V1h2z" />
      <path fill="#f9edb5" d="M3 1h9v1h1v1h1v9h-1v1h-1v1H3v-1H2v-1H1V3h1V2h1z" />
      {rows.flatMap((row, y) =>
        [...row].flatMap((cell, x) =>
          cell === '1'
            ? [
                <rect
                  key={`${x}:${y}`}
                  x={x + 3}
                  y={y + 4}
                  width="1"
                  height="1"
                  fill={y < 2 ? '#70c29d' : '#27815c'}
                />,
              ]
            : [],
        ),
      )}
    </svg>
  )
}
