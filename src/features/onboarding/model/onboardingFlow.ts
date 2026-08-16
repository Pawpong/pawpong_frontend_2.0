import { ONBOARDING_STEPS, type FormStepId, type StepId, type UserType } from './types'

/**
 * 라우터 가드가 쓰는 순서 계산 (라벨·순서 원본은 ONBOARDING_STEPS 하나뿐이다).
 *
 * 완료 판정은 스토어의 completedSteps 만 본다 — drafts 를 스키마로 다시 검증하면
 * persist 가 버리는 값(File, 인증번호) 때문에 새로고침 후 항상 미완료가 된다.
 */
export const getFormSteps = (userType: UserType): FormStepId[] =>
  ONBOARDING_STEPS[userType].flatMap(({ id }) => (id === 'complete' ? [] : [id]))

export const getStepIndex = (userType: UserType, step: StepId): number =>
  ONBOARDING_STEPS[userType].findIndex(({ id }) => id === step)

/** stepId 이후의 스텝들 (앞 단계를 고치면 뒤 단계 완료 표시를 지우는 데 쓴다) */
export const getStepsAfter = (userType: UserType, stepId: FormStepId): FormStepId[] => {
  const steps = getFormSteps(userType)
  const index = steps.indexOf(stepId)
  return index < 0 ? [] : steps.slice(index + 1)
}

/** 아직 완료되지 않은 가장 이른 스텝. 전부 끝났으면 null */
export const getFirstIncompleteStep = (
  userType: UserType,
  completedSteps: FormStepId[],
): FormStepId | null => getFormSteps(userType).find((id) => !completedSteps.includes(id)) ?? null
