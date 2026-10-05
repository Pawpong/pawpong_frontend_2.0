'use client'

import { useEffect } from 'react'
import { AiFilterStudio } from '@/features/ai-image'
import { useMe } from '@/features/auth'
import { usePurchases } from '@/features/in-app-purchase'
import { featureAllowance } from '@/entities/iap'
import { useQuery } from '@tanstack/react-query'
import { petConfigOptions } from '@/entities/playground-pet'

/** 로그인 상태는 여기서 읽어 넘긴다 — 기능 슬라이스끼리 직접 참조하지 않도록 */
export const AiFilterContent = ({ gameCharacter = false }: { gameCharacter?: boolean }) => {
  const { isLoggedIn } = useMe()
  const billing = usePurchases()
  const { refresh } = billing
  const petConfig = useQuery({
    ...petConfigOptions,
    enabled: gameCharacter,
  })
  useEffect(() => {
    void refresh()
  }, [refresh])
  if (gameCharacter && (petConfig.isError || !petConfig.data?.enabled))
    return (
      <p role="status" className="mx-auto max-w-xl px-5 py-12 text-center">
        {petConfig.isPending
          ? '캐릭터 만들기를 준비하고 있어요…'
          : '지금은 게임 캐릭터 만들기를 이용할 수 없어요.'}
      </p>
    )
  return (
    <AiFilterStudio
      key={gameCharacter ? 'pet-character' : 'photo'}
      gameCharacter={gameCharacter}
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
