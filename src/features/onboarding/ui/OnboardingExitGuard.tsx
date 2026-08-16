'use client'

import { useFormGuard } from '@/shared/lib/useFormGuard'
import { ExitConfirmModal } from '@/shared/ui'
import { useOnboardingForm } from '../model/useOnboardingForm'

/**
 * 온보딩 "밖으로" 나갈 때만 확인을 받는다 (헤더 로고 → 홈).
 * 단계 간 이동은 draft 로 값이 보존되므로 막지 않는다 — 그건 OnboardingRouteGuard 의 몫.
 */
const OnboardingExitGuard = ({ children }: { children: React.ReactNode }) => {
  const drafts = useOnboardingForm((state) => state.drafts)
  const status = useOnboardingForm((state) => state.status)

  const { showNavigationDialog, handleNavigationConfirm, handleNavigationCancel } = useFormGuard({
    // 가입이 끝났으면 지킬 입력이 없다
    hasChanges: status !== 'completed' && Object.keys(drafts).length > 0,
  })

  return (
    <>
      {children}
      <ExitConfirmModal
        open={showNavigationDialog}
        onClose={handleNavigationCancel}
        onConfirm={handleNavigationConfirm}
        title="회원가입을 그만하시겠어요?"
        description="입력한 내용은 저장되지 않아요."
      />
    </>
  )
}

export { OnboardingExitGuard }
