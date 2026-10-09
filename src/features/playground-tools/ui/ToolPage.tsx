import Link from 'next/link'
import { ArrowBackIcon } from '@/shared/assets'
import { FeatureIntro } from '@/shared/ui/FeatureIntro'
import styles from './Tools.module.css'

export function ToolPage({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className={styles.page}>
      <Link href="/playground" className={styles.back}>
        <ArrowBackIcon aria-hidden className="size-4" />
        놀이터로
      </Link>
      {/* 놀이터 첫 화면·AI 필터·돌봄 지도와 같은 소개 영역을 쓴다. */}
      <div className={styles.header}>
        <FeatureIntro eyebrow="함께하는 하루의 작은 도구" title={title}>
          {description}
        </FeatureIntro>
      </div>
      {children}
    </div>
  )
}
