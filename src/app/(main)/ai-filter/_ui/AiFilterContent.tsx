'use client'

import { AiFilterStudio } from '@/features/ai-image'
import { useMe } from '@/features/auth'

/** 로그인 상태는 여기서 읽어 넘긴다 — 기능 슬라이스끼리 직접 참조하지 않도록 */
export const AiFilterContent = () => {
  const { isLoggedIn } = useMe()
  return <AiFilterStudio isLoggedIn={isLoggedIn} />
}
