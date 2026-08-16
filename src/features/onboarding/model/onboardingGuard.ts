import { getFirstIncompleteStep, getFormSteps, getStepIndex } from './onboardingFlow'
import type { FormStepId, StepId, UserType } from './types'

interface GuardParams {
  userType: UserType
  requestedStep: StepId
  completedSteps: FormStepId[]
  status: 'editing' | 'completed'
  /** 이 탭의 소셜 가입 세션이 이 온보딩의 주인인지 */
  hasValidSession: boolean
}

/**
 * 단계 건너뛰기·직접 URL 접근 판정 (순수 함수).
 *
 * 반환값이 있으면 그 경로로 replace 한다. 세션이 없으면 /login 이 아니라 /signup 으로 보낸다 —
 * 유형 선택 겸 소셜 파라미터 캡처 지점이라, 정상 진입이 거기서 다시 시작되기 때문이다.
 */
export const getGuardRedirect = ({
  userType,
  requestedStep,
  completedSteps,
  status,
  hasValidSession,
}: GuardParams): string | null => {
  const firstIncomplete = getFirstIncompleteStep(userType, completedSteps)

  // 가입이 끝난 뒤에는 소셜 세션을 이미 비웠으므로 세션 검사보다 먼저 판정한다
  if (requestedStep === 'complete') {
    if (status === 'completed') return null
    return `/signup/${userType}/${firstIncomplete ?? getFormSteps(userType)[0]}`
  }
  // 가입이 끝난 뒤 입력 단계로 되돌아오는 것도 막는다 (이미 계정이 생성됐다)
  if (status === 'completed') return `/signup/${userType}/complete`

  if (!hasValidSession) return '/signup'

  // 앞 단계가 비어 있으면 그 단계로. 뒤로 돌아가 고치는 것은 허용한다
  if (!firstIncomplete) return null
  return getStepIndex(userType, requestedStep) > getStepIndex(userType, firstIncomplete)
    ? `/signup/${userType}/${firstIncomplete}`
    : null
}
