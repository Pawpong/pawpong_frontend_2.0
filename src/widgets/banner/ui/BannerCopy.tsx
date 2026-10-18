import Image from 'next/image'
import type { BannerTextOverlay } from '@/shared/types/HomeTypes'
import styles from './BannerCopy.module.css'

/** Text stays selectable, accessible and crisp at every image density. */
export function BannerCopy({ copy }: { copy: BannerTextOverlay }) {
  return (
    <div className={`${styles.copy} ${styles[copy.layout]}`} data-banner-copy={copy.layout}>
      {copy.layout === 'launch' && (
        <Image
          className={styles.topLogo}
          src="/images/logo/logo.svg"
          width={288}
          height={96}
          alt="Pawpong"
        />
      )}
      <div className={styles.headingGroup}>
        <h2 className={styles.headline}>{copy.headline}</h2>
        {copy.layout === 'welcome' ? (
          <p className={styles.welcomeLine}>
            <Image
              className={styles.inlineLogo}
              src="/images/logo/logo.svg"
              width={288}
              height={96}
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
