'use client'

import { useFormGuard } from '@/shared/lib/useFormGuard'
import { ExitConfirmModal } from '@/shared/ui'
import { useOnboardingForm } from '../model/useOnboardingForm'

/**
 * 온보딩 "밖으로" 나갈 때만 확인을 받는다. 단계 간 이동은 draft 로 값이 보존되므로 막지 않는다
 * (그건 OnboardingRouteGuard 의 몫).
 *
 * 확인을 누르면 입력값을 실제로 비운다 — 모달 문구("저장되지 않아요")와 동작을 맞추기 위해서다.
 *
 * 앱 내부 링크 클릭(가입 헤더 로고)만 가로챈다. popstate 를 함께 잡는 useExitGuard 는
 * 스텝 간 뒤로가기(info -> profile)에도 모달을 띄워 정상 이동을 막으므로 쓰지 않는다.
 */
const OnboardingExitGuard = ({ children }: { children: React.ReactNode }) => {
  const drafts = useOnboardingForm((state) => state.drafts)
  const status = useOnboardingForm((state) => state.status)
  const clear = useOnboardingForm((state) => state.clear)

  // 가입이 끝났으면 지킬 입력이 없다
  const hasChanges = status !== 'completed' && Object.keys(drafts).length > 0

  const { showNavigationDialog, handleNavigationConfirm, handleNavigationCancel } = useFormGuard({
    hasChanges,
  })

  const handleConfirm = () => {
    clear()
    handleNavigationConfirm()
  }

  return (
    <>
      {children}
      <ExitConfirmModal
        open={showNavigationDialog}
        onClose={handleNavigationCancel}
        onConfirm={handleConfirm}
        title="회원가입을 그만하시겠어요?"
        description="입력한 내용은 저장되지 않아요."
      />
    </>
  )
}

export { OnboardingExitGuard }
