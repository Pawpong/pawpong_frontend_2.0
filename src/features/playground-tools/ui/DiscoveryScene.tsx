import { PawPrintIcon, ProfileStarIcon } from '@/shared/assets'
import styles from './Discovery.module.css'

// 아직 카드를 열기 전 보여주는 도트 장면. 정보가 없으므로 스크린리더에서는 숨긴다.
export function DiscoveryScene({ variant }: { variant: 'outing' | 'taste' }) {
  return (
    <div className={`${styles.scene} ${variant === 'taste' ? styles.taste : ''}`} aria-hidden>
      <span className={styles.sun} />
      <span className={styles.cloud} />
      <span className={styles.hill} />
      {variant === 'outing' && <span className={styles.trail} />}
      <span className={styles.pixelCard}>
        {variant === 'taste' ? <ProfileStarIcon filled /> : <PawPrintIcon />}
      </span>
      <span className={styles.sceneTag}>
        {variant === 'outing' ? '오늘의 작은 모험' : '우리 아이는 어떤 모습?'}
      </span>
    </div>
  )
}
