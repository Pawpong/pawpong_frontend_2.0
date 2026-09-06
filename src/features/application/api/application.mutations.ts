'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationQueries } from '@/entities/application'
import type { ApplicationCreateRequest, ApplicationUpdateRequest } from '@/shared/types'
import { createApplication, updateApplication } from './application.api'

export const useCreateApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ApplicationCreateRequest) => createApplication(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: applicationQueries.all() })
    },
  })
}

export const useUpdateApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string
      data: ApplicationUpdateRequest
    }) => updateApplication(applicationId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: applicationQueries.all() })
    },
  })
}
