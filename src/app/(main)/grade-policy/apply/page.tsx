import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pawpong',
  robots: { index: false, follow: false },
}

/** 폐기된 등급 신청 화면은 소스만 아카이브하고 서비스 진입은 차단한다. */
const GradeLevelApplicationPage = () => notFound()

export default GradeLevelApplicationPage
