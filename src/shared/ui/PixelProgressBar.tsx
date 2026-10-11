const FILL_START = 10.4868
const FILL_END = 544.113
const FILL_WIDTH = FILL_END - FILL_START

// 채움 색 [본색, 윗면 하이라이트]. green 이 기본(회원가입 EXP 바), 나머지는 놀이터 키우기의 상태별 색
const TONE_FILL = {
  green: ['#39D264', '#74F08E'],
  olive: ['#9CAA69', '#C3CF8F'],
  pink: ['#DA9B8C', '#F0C2B6'],
  brown: ['#BA984E', '#DCC07E'],
  purple: ['#B595BD', '#D6BFDC'],
} as const

type PixelProgressTone = keyof typeof TONE_FILL

interface PixelProgressBarProps {
  percent: number
  /** 화면 낭독기용 이름 (기본: '진행률 n%') */
  label?: string
  /** 채움 색 (기본 green) */
  tone?: PixelProgressTone
}

/** 회원가입 EXP 바와 같은 도트 진행 바. 감싸는 요소의 크기를 그대로 채운다. */
const PixelProgressBar = ({ percent, label, tone = 'green' }: PixelProgressBarProps) => {
  const clampedPercent = Math.min(100, Math.max(0, percent))
  const fillEndX = FILL_START + (clampedPercent / 100) * FILL_WIDTH
  const [fill, highlight] = TONE_FILL[tone]

  return (
    <svg
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      overflow="visible"
      style={{ display: 'block' }}
      viewBox="0 0 557.533 26.3097"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label ?? `진행률 ${clampedPercent}%`}
    >
      {/* 외곽 테두리 (갈색) */}
      <path
        d="M544.111 3.95215H550.517V11.0586H557.533V26.3096H10.4873V22.3887H6.33594V19.9414H0V11.0586H6.33594V3.95215H10.457V0H544.111V3.95215Z"
        fill="#A9835A"
      />
      {/* 배경 (노란색) */}
      <path
        d="M544.112 3.94877V11.0591H550.517V19.7388H6.33601V11.0591H10.4493V3.94877H544.112Z"
        fill="#FFFA94"
      />
      {/* 배경 하단 그림자 */}
      <path d="M550.517 19.7384H10.4869V22.3889H550.517V19.7384Z" fill="#D9BD44" />
      {/* 내부 흰색 영역 */}
      <path d="M544.113 9.25621H14.5593V19.7384H544.113V9.25621Z" fill="white" />
      {/* 채움 (진행률) */}
      {clampedPercent > 0 && (
        <>
          <rect
            x={FILL_START}
            y={9.25618}
            width={fillEndX - FILL_START}
            height={10.48222}
            fill={fill}
          />
          <rect
            x={FILL_START}
            y={9.25618}
            width={fillEndX - FILL_START}
            height={4.02742}
            fill={highlight}
          />
        </>
      )}
    </svg>
  )
}

export { PixelProgressBar }
