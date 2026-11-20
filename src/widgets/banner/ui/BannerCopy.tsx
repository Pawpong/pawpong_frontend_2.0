import Image from 'next/image'
import type { BannerTextOverlay } from '@/shared/types'
import styles from './BannerCopy.module.css'
// 정적 import 라 해시 주소 + immutable 캐시. public 경로 문자열은 max-age=0 이라
// 홈으로 돌아올 때마다 서버 확인을 기다리며 로고가 깜빡였다.
// 배너 글자와 같은 프레임에 그려지도록 지연 로드·비동기 디코딩도 끈다.
import logo from '../../../../public/images/logo/logo.svg'

/** Text stays selectable, accessible and crisp at every image density. */
export function BannerCopy({ copy }: { copy: BannerTextOverlay }) {
  return (
    <div className={`${styles.copy} ${styles[copy.layout]}`} data-banner-copy={copy.layout}>
      {copy.layout === 'launch' && (
        <Image
          className={styles.topLogo}
          src={logo}
          width={288}
          height={96}
          loading="eager"
          decoding="sync"
          alt="Pawpong"
        />
      )}
      <div className={styles.headingGroup}>
        <h2 className={styles.headline}>{copy.headline}</h2>
        {copy.layout === 'welcome' ? (
          <p className={styles.welcomeLine}>
            <Image
              className={styles.inlineLogo}
              src={logo}
              width={288}
              height={96}
              loading="eager"
              decoding="sync"
              alt="Pawpong"
            />
            {copy.subtitle && <span>{copy.subtitle}</span>}
          </p>
        ) : copy.subtitle ? (
          <p className={styles.subtitle}>{copy.subtitle}</p>
        ) : null}
      </div>
      {copy.ctaLabel && (
        <span className={styles.cta}>
          {copy.ctaLabel}
          <span aria-hidden="true"> ↗</span>
        </span>
      )}
    </div>
  )
}
