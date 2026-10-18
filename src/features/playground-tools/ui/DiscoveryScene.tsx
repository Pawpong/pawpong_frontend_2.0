import { PawPrintIcon, ProfileStarIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import styles from './Discovery.module.css'

// 아직 카드를 열기 전 보여주는 도트 장면. 정보가 없으므로 스크린리더에서는 숨긴다.
// beat 가 바뀔 때마다 앞장이 한 번 통 튀고, busy 동안에는 카드를 섞는다.
export function DiscoveryScene({
  variant,
  beat = 0,
  busy = false,
}: {
  variant: 'outing' | 'taste'
  beat?: number
  busy?: boolean
}) {
  return (
    <div
      className={cn(styles.scene, variant === 'taste' && styles.taste)}
      data-busy={busy || undefined}
      aria-hidden
    >
      <span className={styles.sun} />
      <span className={styles.cloud} />
      <span className={styles.hill} />
      {variant === 'outing' && (
        <>
          <span className={styles.trail} />
          <span className={cn(styles.pixelCard, styles.deckBack, styles.deckLeft)} />
          <span className={cn(styles.pixelCard, styles.deckBack, styles.deckRight)} />
        </>
      )}
      <span key={beat} className={styles.pixelCard}>
        {variant === 'taste' ? <ProfileStarIcon filled /> : <PawPrintIcon />}
      </span>
      <span className={styles.sceneTag}>
        {variant === 'outing' ? '오늘의 작은 모험' : '우리 아이는 어떤 모습?'}
      </span>
    </div>
  )
}
