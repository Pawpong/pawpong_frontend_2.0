'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from 'react-hook-form'
import { useOnboarding } from './OnboardingContext'

type UseStepFormReturn<T extends FieldValues> = UseFormReturn<T> & {
  onSubmit: (data: T) => void
  /** 검증 실패 시 첫 번째 에러 메시지 (nav 버튼 위 표시용) */
  firstErrorMessage?: string
}

// [refactored] zodResolver 연결 — 스텝 스키마로 실제 유효성 검증
const useStepForm = <T extends FieldValues>(
  stepId: string,
  schema: z.ZodType<T, FieldValues>,
  defaultValues: DefaultValues<T>,
): UseStepFormReturn<T> => {
  const { goNext, formData, setFormData } = useOnboarding()

  const form = useForm<T>({
    resolver: zodResolver(schema) as Resolver<T>,
    defaultValues: (formData[stepId] as DefaultValues<T>) ?? defaultValues,
  })

  const onSubmit = (data: T) => {
    setFormData(stepId, data as Record<string, unknown>)
    goNext()
  }

  // 검증 실패 시 조용히 막히지 않도록 첫 에러 메시지 노출 (formState.errors 구독)
  const firstError = Object.values(form.formState.errors)[0]
  const firstErrorMessage = typeof firstError?.message === 'string' ? firstError.message : undefined

  return { ...form, onSubmit, firstErrorMessage }
}

export { useStepForm }
