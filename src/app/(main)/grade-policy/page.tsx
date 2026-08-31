import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pawpong',
  robots: { index: false, follow: false },
}

/**
 * 2026-08-31 현행 정책에서 New/Elite 등급제가 폐지되어 공개 라우팅을 중단했다.
 * 과거 화면의 정책 결정과 복구 지점은 `docs/archive/grade-policy.md`에 기록한다.
 */
const GradePolicyPage = () => notFound()

export default GradePolicyPage
