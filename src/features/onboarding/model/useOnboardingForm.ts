import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { getStepsAfter } from './onboardingFlow'
import type { FormStepId, OnboardingFormData, UserType } from './types'

/**
 * 가입 중 입력값 저장소 (sessionStorage)
 *
 * 스텝은 여러 페이지에 걸쳐 있고 메모리 state 는 새로고침에 사라진다. 그대로 두면 마지막
 * 단계에서 "닉네임을 입력해주세요(회원 정보 입력 단계)" 로 막히므로 persist 로 보관한다.
 * (소셜 가입 세션 socialSignupSession 과 같은 수명 — 가입 완료 시 함께 비운다)
 *
 * drafts 와 completedSteps 를 나눠 둔다.
 * - drafts: 되돌아왔을 때 입력을 복원하는 용도. 검증 통과 여부와 무관하다
 * - completedSteps: 라우터 가드가 보는 유일한 진실. drafts 로 다시 계산하면 안 된다
 *   (persist 가 File 인 documents 와 verificationCode 를 버려서 새로고침 후 항상 미완료가 된다)
 */
interface OnboardingFormStore {
  ownerTempId?: string
  drafts: Partial<OnboardingFormData>
  completedSteps: FormStepId[]
  /** completed 는 가입 요청까지 끝난 상태 — /complete 진입 허용 조건 */
  status: 'editing' | 'completed'
  hasHydrated: boolean
  markHydrated: () => void
  /** 입력 중인 값 보관 (이전 단계로 이동할 때). 완료 표시는 하지 않는다 */
  saveDraft: <K extends FormStepId>(stepId: K, value: OnboardingFormData[K]) => void
  /** 스텝 검증 통과 — 값 저장 + 완료 표시 */
  completeStep: <K extends FormStepId>(stepId: K, value: OnboardingFormData[K]) => void
  /** 이 스텝부터 뒤쪽 완료 표시를 해제 (앞 단계를 고치면 뒤 단계 값이 낡는다) */
  invalidateFrom: (userType: UserType, stepId: FormStepId) => void
  /** 가입 성공 — 입력값은 비우되 완료 상태는 남겨 /complete 진입을 허용한다 */
  finishRegistration: () => void
  startSession: (tempId: string) => void
  clear: () => void
}

const EMPTY_PROGRESS = {
  drafts: {},
  completedSteps: [] as FormStepId[],
  status: 'editing' as const,
}

export const useOnboardingForm = create<OnboardingFormStore>()(
  persist(
    (set) => ({
      ownerTempId: undefined,
      ...EMPTY_PROGRESS,
      hasHydrated: false,
      markHydrated: () => set({ hasHydrated: true }),

      saveDraft: (stepId, value) =>
        set((state) => ({ drafts: { ...state.drafts, [stepId]: value } })),

      completeStep: (stepId, value) =>
        set((state) => ({
          drafts: { ...state.drafts, [stepId]: value },
          completedSteps: state.completedSteps.includes(stepId)
            ? state.completedSteps
            : [...state.completedSteps, stepId],
        })),

      invalidateFrom: (userType, stepId) =>
        set((state) => {
          const stale = new Set<FormStepId>([stepId, ...getStepsAfter(userType, stepId)])
          const completedSteps = state.completedSteps.filter((id) => !stale.has(id))
          // 참조가 그대로면 리렌더를 만들지 않는다 (입력 중 매 글자마다 호출될 수 있다)
          return completedSteps.length === state.completedSteps.length ? state : { completedSteps }
        }),

      finishRegistration: () => set({ ...EMPTY_PROGRESS, status: 'completed' }),

      startSession: (tempId) =>
        set((state) =>
          state.ownerTempId === tempId ? state : { ownerTempId: tempId, ...EMPTY_PROGRESS },
        ),

      clear: () => set({ ownerTempId: undefined, ...EMPTY_PROGRESS }),
    }),
    {
      name: 'pawpong:onboarding-form',
      storage: createJSONStorage(() => sessionStorage),
      version: 2,
      // 폼 구조가 달라지면 이전 탭의 값을 억지로 복원하지 않고 안전하게 새로 시작한다.
      migrate: () => ({ ownerTempId: undefined, ...EMPTY_PROGRESS }),
      // 서버 렌더 시점엔 복원하지 않는다 — 하이드레이션 직후 Provider 가 rehydrate 를 호출한다
      skipHydration: true,
      // 복원이 끝나야 라우터 가드가 판정할 수 있다 (그전에 판정하면 전원 1단계로 튕긴다)
      onRehydrateStorage: () => (state) => state?.markHydrated(),
      // documents 는 File 객체라 JSON 으로 살아남지 못한다 — 새로고침 시 파일은 다시 선택받는다
      partialize: (state) => ({
        ownerTempId: state.ownerTempId,
        completedSteps: state.completedSteps,
        status: state.status,
        drafts: {
          ...state.drafts,
          // 인증번호와 File 객체는 저장하지 않는다. 인증 완료 여부와 전화번호만 같은 세션에 유지한다.
          profile: state.drafts.profile
            ? { ...state.drafts.profile, verificationCode: '' }
            : undefined,
          documents: undefined,
        },
      }),
    },
  ),
)
