import Link from 'next/link'
import {
  CameraIcon,
  PixelCheckIcon,
  PixelPencilIcon,
  PixelArrowRightIcon,
  PawPrintIcon,
} from '@/shared/assets'
import styles from './Tools.module.css'

export function PlaygroundToolShelf() {
  return (
    <section aria-labelledby="playground-tools" className={styles.shelf}>
      <div className={styles.shelfHeading}>
        <div>
          <span className={styles.eyebrow}>매일 들르고 싶은 놀이터</span>
          <h2 id="playground-tools">오늘은 무엇을 해볼까요?</h2>
        </div>
        <PawPrintIcon aria-hidden className="size-8 text-secondary-300" />
      </div>
      <div className={styles.toolCards}>
        <Link href="/playground/outing" className={styles.toolCard}>
          <span className={styles.toolIcon}>
            <PixelCheckIcon aria-hidden />
          </span>
          <span className={styles.toolCardCopy}>
            <small>산책 · 카페 · 여행 · 병원</small>
            <strong>외출 준비함</strong>
            <span>빠뜨린 건 없는지 톡톡 체크해요.</span>
            <span className={styles.cardCta}>
              준비물 챙기기 <PixelArrowRightIcon aria-hidden className="size-3" />
            </span>
          </span>
        </Link>
        <Link href="/playground/memory-card" className={`${styles.toolCard} ${styles.mintCard}`}>
          <span className={styles.toolIcon}>
            <CameraIcon aria-hidden />
          </span>
          <span className={styles.toolCardCopy}>
            <small>사진 한 장의 작은 기념품</small>
            <strong>오늘의 추억 카드</strong>
            <span>우리 아이의 순간을 예쁘게 간직해요.</span>
            <span className={styles.cardCta}>
              카드 꾸미기 <PixelArrowRightIcon aria-hidden className="size-3" />
            </span>
          </span>
        </Link>
      </div>
      <div className={styles.recordShelf}>
        <div>
          <PixelPencilIcon aria-hidden className="size-5" />
          <span>함께한 오늘, 기록할까요?</span>
        </div>
        <nav aria-label="반려생활 기록 바로 쓰기">
          <Link href="/community/write?experience=walk">산책 기록 ↗</Link>
          <Link href="/community/write?experience=clinic">병원 방문 ↗</Link>
          <Link href="/community/write?experience=daily">반려생활 ↗</Link>
        </nav>
      </div>
    </section>
  )
}
