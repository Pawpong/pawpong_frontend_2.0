import type { SVGProps } from 'react'

// 공통 30px 캔버스와 2px 격자. +만 기존 3px 간격을 유지한다.
// #은 윤곽, +는 선택 시 채울 내부. 모든 계단과 선을 같은 픽셀로 그린다.
const pixels = {
  // 도트 간격과 전체 길이는 유지하고 +의 가로·세로 획만 2px로 얇게 한다.
  plus: ['...#...', '...#...', '...#...', '#######', '...#...', '...#...', '...#...'],
  star: [
    '.....#.....',
    '....#+#....',
    '....#+#....',
    '####+++####',
    '#+++++++++#',
    '.#+++++++#.',
    '..#+++++#..',
    '..#+++++#..',
    '.#+++#+++#.',
    '.#+##.##+#.',
    '.##.....##.',
  ],
  share: [
    '....#....',
    '...#.#...',
    '..#.#.#..',
    '.#..#..#.',
    '....#....',
    '....#....',
    '#...#...#',
    '#.......#',
    '#.......#',
    '#########',
  ],
} as const

// 신고 아이콘의 연속 윤곽선을 기준으로 획을 살짝 보강한다.
// 대각선 대신 작은 직각 계단을 사용하고, 픽셀의 꼭짓점끼리만 닿는 틈을 피한다.
const contours = {
  heart:
    'M15 9H13V7H11V6H7V7H5V13H6V15H8V17H10V19H12V21H14V23H16V21H18V19H20V17H22V15H24V13H25V7H23V6H19V7H17V9Z',
  comment: 'M6 5.5H24V7H25.5V20H24V21.5H14V23H12.5V24.5H9.5V21.5H6V20H4.5V7H6Z',
  bookmark:
    'M8 5.5H22V7H23.5V24.5H20.5V23H19V21.5H17.5V20H16V18.5H14V20H12.5V21.5H11V23H9.5V24.5H6.5V7H8Z',
} as const

type PixelGlyph = keyof typeof pixels
type ContourGlyph = keyof typeof contours
type Glyph = PixelGlyph | ContourGlyph

const paths = Object.fromEntries(
  Object.entries(pixels).map(([glyph, rows]) => {
    const pitch = glyph === 'plus' ? 3 : 2
    const gap = glyph === 'plus' ? 0.15 : 0
    const dotSize = pitch - gap
    const xOffset = (30 - rows[0].length * pitch + gap) / 2
    const yOffset = (30 - rows.length * pitch + gap) / 2
    const path = (filled: boolean) =>
      rows
        .flatMap((row, y) =>
          [...row].map((pixel, x) =>
            pixel === '#' || (filled && pixel === '+')
              ? glyph === 'plus'
                ? `M${xOffset + x * pitch + (x === 3 ? (dotSize - 2) / 2 : 0)} ${yOffset + y * pitch + (y === 3 ? (dotSize - 2) / 2 : 0)}h${x === 3 ? 2 : dotSize}v${y === 3 ? 2 : dotSize}h-${x === 3 ? 2 : dotSize}Z`
                : `M${xOffset + x * pitch} ${yOffset + y * pitch}h${dotSize}v${dotSize}h-${dotSize}Z`
              : '',
          ),
        )
        .join('')
    return [glyph, { outline: path(false), filled: path(true) }]
  }),
) as Record<PixelGlyph, { outline: string; filled: string }>

type PixelActionIconProps = SVGProps<SVGSVGElement> & {
  glyph: Glyph
  filled?: boolean
}

export const PixelActionIcon = ({ glyph, filled = false, ...props }: PixelActionIconProps) => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="currentColor" aria-hidden="true" {...props}>
    {glyph in contours ? (
      <>
        <path
          d={contours[glyph as ContourGlyph]}
          fill={filled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="miter"
        />
        {glyph === 'comment' && <path d="M9 12h2v2H9zM14 12h2v2h-2zM19 12h2v2h-2z" />}
      </>
    ) : (
      <path d={paths[glyph as PixelGlyph][filled ? 'filled' : 'outline']} />
    )}
  </svg>
)
