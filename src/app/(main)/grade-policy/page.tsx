import type { Metadata } from 'next'
import { GradePolicyContent } from './_ui/GradePolicyContent'

export const metadata: Metadata = {
  title: '브리더 등급 정책 | Pawpong',
  description: '뉴 브리더와 엘리트 브리더의 확인 범위와 심사 원칙을 안내합니다.',
}

const GradePolicyPage = () => <GradePolicyContent />

export default GradePolicyPage
