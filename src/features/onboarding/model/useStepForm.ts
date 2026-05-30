'use client'

import { useForm, type DefaultValues, type UseFormReturn } from 'react-hook-form'
import { useOnboarding } from './OnboardingContext'

type UseStepFormReturn<T extends Record<string, unknown>> = UseFormReturn<T> & {
  onSubmit: (data: T) => void
}

const useStepForm = <T extends Record<string, unknown>>(
  stepId: string,
  defaultValues: DefaultValues<T>,
): UseStepFormReturn<T> => {
  const { goNext, formData, setFormData } = useOnboarding()

  const form = useForm<T>({
    defaultValues: (formData[stepId] as DefaultValues<T>) ?? defaultValues,
  })

  const onSubmit = (data: T) => {
    setFormData(stepId, data as Record<string, unknown>)
    goNext()
  }

  return { ...form, onSubmit }
}

export { useStepForm }
