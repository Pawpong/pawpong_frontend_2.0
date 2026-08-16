'use client'

import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type DefaultValues, type FieldValues, type UseFormReturn } from 'react-hook-form'
import { useOnboarding } from './OnboardingContext'
import type { FormStepId, OnboardingFormData } from './types'

type UseStepFormReturn<T extends FieldValues> = UseFormReturn<T> & {
  onSubmit: (data: T) => void
  /** 입력값을 보관하고 이전 단계로 (StepContainer 의 onBack 에 그대로 넘긴다) */
  goBack: () => void
  /** 검증 실패 시 첫 번째 에러 메시지 (nav 버튼 위 표시용) */
  firstErrorMessage?: string
}

// [refactored] zodResolver 연결 — 스텝 스키마로 실제 유효성 검증
const useStepForm = <K extends FormStepId>(
  stepId: K,
  schema: z.ZodType<OnboardingFormData[K], OnboardingFormData[K]>,
  defaultValues: DefaultValues<OnboardingFormData[K]>,
): UseStepFormReturn<OnboardingFormData[K]> => {
  type T = OnboardingFormData[K]
  const { goNext, goBack, formData, setFormData, saveDraft, invalidateFrom } = useOnboarding()

  const saved = formData[stepId]
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: (saved as DefaultValues<T>) ?? defaultValues,
  })

  // sessionStorage 복원은 마운트 후에 도착한다(하이드레이션 회피). 초기값으로 못 받았으면
  // 도착 시점에 한 번 reset 으로 채운다 — 사용자가 이미 입력을 시작했으면 덮지 않는다
  const { reset, formState } = form
  const isFilled = useRef(Boolean(saved))
  useEffect(() => {
    if (isFilled.current || !saved || formState.isDirty) return
    isFilled.current = true
    reset(saved as DefaultValues<T>)
  }, [saved, reset, formState.isDirty])

  // 완료한 앞 단계를 다시 건드리면 이 스텝부터 뒤쪽 완료 표시를 지운다.
  // (안 지우면 낡은 뒤 단계 값으로 가입될 수 있다) 렌더 중 setState 를 피해 effect 에서 한 번만.
  const { isDirty } = formState
  useEffect(() => {
    if (isDirty) invalidateFrom(stepId)
  }, [isDirty, invalidateFrom, stepId])

  // 이전 단계로 이동해도 입력이 날아가지 않게 값만 보관한다 (완료 표시는 하지 않는다)
  const { getValues } = form
  const goBackWithDraft = () => {
    saveDraft(stepId, getValues())
    goBack()
  }

  const onSubmit = (data: T) => {
    setFormData(stepId, data)
    goNext()
  }

  // 검증 실패 시 조용히 막히지 않도록 첫 에러 메시지 노출 (formState.errors 구독)
  const firstError = Object.values(form.formState.errors)[0]
  const firstErrorMessage = typeof firstError?.message === 'string' ? firstError.message : undefined

  return { ...form, onSubmit, goBack: goBackWithDraft, firstErrorMessage }
}

export { useStepForm }
