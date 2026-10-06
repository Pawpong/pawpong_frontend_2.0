import { cn } from '@/shared/lib/cn'

// 배지와 같은 9×7 격자 도트 그림. 색은 글자색(currentColor)을 따른다.
const SHAPES = {
  walk: ['011000110', '111101111', '011000110', '000111000', '001111100', '011111110', '001101100'],
  clinic: [
    '000111000',
    '000111000',
    '111111111',
    '111111111',
    '111111111',
    '000111000',
    '000111000',
  ],
  life: ['000010000', '000111000', '001111100', '011111110', '111111111', '011101110', '011101110'],
  travel: [
    '000111000',
    '001000100',
    '111111111',
    '110111011',
    '111111111',
    '110111011',
    '111111111',
  ],
  question: [
    '001111100',
    '011000110',
    '000001100',
    '000011000',
    '000110000',
    '000000000',
    '000110000',
  ],
  tag: ['011111000', '110011100', '110011110', '111111111', '111111110', '111111100', '011111000'],
} as const

export type CommunityPixelIconName = keyof typeof SHAPES

export function CommunityPixelIcon({
  name,
  className,
}: {
  name: CommunityPixelIconName
  className?: string
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 9 7"
      shapeRendering="crispEdges"
      className={cn('h-[0.875rem] w-[1.125rem] shrink-0', className)}
    >
      {SHAPES[name].flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === '1' ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
          ) : null,
        ),
      )}
    </svg>
  )
}
