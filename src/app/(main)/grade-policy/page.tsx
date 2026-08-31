import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pawpong',
  robots: { index: false, follow: false },
}

/**
 * 2026-08-31 현행 정책에서 New/Elite 등급제가 폐지되어 공개 라우팅을 중단했다.
 * `_ui` 구현은 향후 EXP 정책이 확정될 때 디자인 자산으로 검토할 수 있도록 보존한다.
 */
const GradePolicyPage = () => notFound()

export default GradePolicyPage
