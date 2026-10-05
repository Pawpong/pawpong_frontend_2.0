'use client'

import { useEffect } from 'react'
import { AiFilterStudio } from '@/features/ai-image'
import { useMe } from '@/features/auth'
import { usePurchases } from '@/features/in-app-purchase'
import { featureAllowance } from '@/entities/iap'

/** 로그인 상태는 여기서 읽어 넘긴다 — 기능 슬라이스끼리 직접 참조하지 않도록 */
export const AiFilterContent = () => {
  const { isLoggedIn } = useMe()
  const billing = usePurchases()
  const { refresh } = billing
  useEffect(() => {
    void refresh()
  }, [refresh])
  return (
    <AiFilterStudio
      isLoggedIn={isLoggedIn}
      allowance={
        billing.account.isError ? undefined : featureAllowance(billing.account.data, 'ai_image')
      }
      quotaError={billing.account.isError}
      onRefreshQuota={() => void billing.refresh()}
      onGenerationSettled={() => void billing.refresh()}
    />
  )
}
