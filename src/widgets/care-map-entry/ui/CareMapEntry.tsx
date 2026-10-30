import { getImageProps } from 'next/image'
import Link from 'next/link'
import styles from './CareMapEntry.module.css'

const desktop = getImageProps({
  src: '/images/banners/places/places-b-desktop-v2.png',
  alt: '',
  width: 2048,
  height: 683,
  sizes: '(min-width: 1440px) 1120px, 90vw',
}).props
const mobile = getImageProps({
  src: '/images/banners/places/places-b-mobile-v1.png',
  alt: '',
  width: 1122,
  height: 1402,
  sizes: '(max-width: 767px) 90vw, 1120px',
}).props

// 돌봄 지도 입구 배너. 노출·배치는 호출자가 정하고, 문구는 그림과 짝이라 고정한다.
// PC는 가로 배너, 모바일은 세로 그림을 picture 로 나눠 쓴다.
export function CareMapEntry() {
  return (
    <Link
      href="/care-map"
      aria-labelledby="care-map-entry-title"
      className={`${styles.banner} focus-ring`}
    >
      <picture>
        <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
        <img {...mobile} alt="" loading="lazy" className={styles.art} />
      </picture>
      <div className={styles.copy}>
        <h2 id="care-map-entry-title" className={`font-cafe24 ${styles.title}`}>
          우리 아이와
          <br />
          함께 갈 곳
        </h2>
        <p className={styles.description}>
          병원과 보호시설부터
          <br />
          카페·여행지·숙소까지.
        </p>
        <span className={styles.action}>지도에서 찾아보기</span>
      </div>
    </Link>
  )
}
