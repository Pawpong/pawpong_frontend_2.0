import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pawpong',
  robots: { index: false, follow: false },
}

/** 폐기된 등급 신청 화면의 기록은 docs/archive/grade-policy.md에 남기고 서비스 진입은 차단한다. */
const GradeLevelApplicationPage = () => notFound()

export default GradeLevelApplicationPage
