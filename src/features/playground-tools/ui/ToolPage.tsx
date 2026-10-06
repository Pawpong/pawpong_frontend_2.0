import Link from 'next/link'
import { ArrowBackIcon, PawPrintIcon } from '@/shared/assets'
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
      <header className={styles.header}>
        <span className={styles.eyebrow}>
          <PawPrintIcon aria-hidden className="size-4" />
          함께하는 하루의 작은 도구
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </div>
  )
}
