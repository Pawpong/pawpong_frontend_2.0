import type { Metadata } from 'next'
import { requireRole } from '@/features/auth/server'
import { GradeLevelApplicationContent } from './_ui/GradeLevelApplicationContent'

export const metadata: Metadata = {
  title: '브리더 등급 관리 | Pawpong',
  description: '현재 브리더 등급과 심사 상태를 확인하고 Elite 등급 변경을 신청합니다.',
}

const GradeLevelApplicationPage = async () => {
  await requireRole('breeder', '/grade-policy/apply')

  return <GradeLevelApplicationContent />
}

export default GradeLevelApplicationPage
