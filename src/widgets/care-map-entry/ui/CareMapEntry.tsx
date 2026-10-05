import Link from 'next/link'
import { PixelArrowRightIcon } from '@/shared/assets'
import { cafe24Proup } from '@/shared/lib/fonts'
import { Container } from '@/shared/ui'
import styles from './CareMapEntry.module.css'

interface CareMapEntryProps {
  title?: string
  description?: string
  eyebrow?: string
  actions?: readonly { label: string; href: string }[]
  /** 관리형 소개 목록이 이미 Container를 제공할 때 사용한다. */
  embedded?: boolean
}

const DEFAULT_ACTIONS = [
  { label: '동물병원 찾기', href: '/care-map' },
  { label: '보호시설 찾기', href: '/care-map?kind=shelter' },
] as const

// 노출·배치·데이터 조회는 호출자가 관리하고, 지도 카드의 표현만 담당한다.
export function CareMapEntry({
  title = '우리 동네 돌봄 지도',
  description = '가까운 동물병원과 보호시설을 한눈에 찾아보세요.',
  eyebrow,
  actions = DEFAULT_ACTIONS,
  embedded = false,
}: CareMapEntryProps = {}) {
  const card = (
    <section aria-label={title} className={styles.card}>
      <div className={styles.intro}>
        <svg
          viewBox="0 0 32 40"
          className={styles.pin}
          aria-hidden="true"
          focusable="false"
          shapeRendering="crispEdges"
        >
          <path
            d="M10 2h12v2h4v4h2v14h-2v4h-4v4h-4v4h-4v-4h-4v-4H6v-4H4V8h2V4h4Z"
            fill="currentColor"
          />
          <path d="M10 6h12v4h2v10h-2v4h-4v4h-4v-4h-4v-4H8V10h2Z" className={styles.pinFill} />
          <path d="M14 10h4v4h4v4h-4v4h-4v-4h-4v-4h4Z" fill="currentColor" />
          <path d="M8 36h16v2H8Z" className={styles.pinShadow} />
        </svg>
        <div className={styles.copy}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 className={`${cafe24Proup.className} ${styles.title}`}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>
      {actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((action, index) => (
            <Link
              key={`${action.href}-${index}`}
              href={action.href}
              className={`${cafe24Proup.className} ${styles.action}`}
              data-primary={index === 0}
            >
              <span>{action.label}</span>
              <PixelArrowRightIcon className={styles.arrow} aria-hidden="true" focusable="false" />
            </Link>
          ))}
        </div>
      )}
    </section>
  )

  return embedded ? card : <Container className="py-4 tab:py-6">{card}</Container>
}
