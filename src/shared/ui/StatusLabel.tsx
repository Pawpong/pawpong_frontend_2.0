import type { CSSProperties } from 'react'
import { PawPrintIcon, PixelCheckIcon, PixelHourglassIcon, PixelMessageIcon } from '@/shared/assets'
import styles from './StatusLabel.module.css'

// 상태는 작은 픽셀 기호와 옅은 띠로 표시한다. 필터 버튼과는 별도의 읽기 전용 UI다.
type StatusTone = 'available' | 'waiting' | 'talk' | 'done' | 'neutral' | 'writing'

interface StatusLabelProps {
  tone: StatusTone
  children: string
}

function StatusSymbol({ tone }: { tone: StatusTone }) {
  if (tone === 'available') return <PawPrintIcon />
  if (tone === 'waiting') return <PixelHourglassIcon />
  if (tone === 'talk') {
    return (
      <span className={styles.message}>
        <PixelMessageIcon />
        <PixelCheckIcon className={styles.messageCheck} />
      </span>
    )
  }
  if (tone === 'done')
    return (
      <span className={styles.seal}>
        <PixelCheckIcon />
      </span>
    )
  if (tone === 'writing') {
    return (
      <svg viewBox="0 0 16 16" fill="none">
        <path d="M10 1h3v2h2v3h-2v2h-2v2H9v2H7v2H2v-5h2V7h2V5h2V3h2V1Z" fill="currentColor" />
        <path d="m10 5 2 2M4 10l2 2" stroke="white" strokeWidth="2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" fill="none">
      <path d="M3 7h10v2H3z" fill="currentColor" />
    </svg>
  )
}

// 승인된 원본 에셋을 재디자인하지 않고 CSS 스프라이트로 그대로 표시한다.
// 원본에 없는 상태 문구는 아래 텍스트 라벨로 유지해 상태 의미를 바꾸지 않는다.
const ORIGINAL_BADGES: Record<string, { x: number; width: number }> = {
  분양중: { x: 68, width: 314 },
  예약중: { x: 452, width: 304 },
  분양완료: { x: 815, width: 346 },
  상담중: { x: 1210, width: 314 },
  상담완료: { x: 1584, width: 344 },
}

const StatusLabel = ({ tone, children }: StatusLabelProps) => {
  const original = ORIGINAL_BADGES[children.replace(/\s/g, '')]
  if (original) {
    const spriteStyle = {
      '--sprite-x': `${original.x}px`,
      '--sprite-width': `${original.width}px`,
    } as CSSProperties
    return <span className={styles.original} style={spriteStyle} role="img" aria-label={children} />
  }
  return (
    <span className={styles.label} data-tone={tone}>
      <span className={styles.icon} aria-hidden="true">
        <StatusSymbol tone={tone} />
      </span>
      <span className={styles.rule} aria-hidden="true" />
      <span className={styles.text}>{children}</span>
    </span>
  )
}

export { StatusLabel, type StatusTone }
