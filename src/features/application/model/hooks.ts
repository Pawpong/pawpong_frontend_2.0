'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationQueries } from '@/entities/application/Queries'
import {
  createApplication,
  updateApplicationStatus,
  updateApplicationForm,
} from '@/entities/application/Api'
import type {
  ApplicationCreateRequest,
  ApplicationStatusUpdateRequest,
  ApplicationFormSimpleUpdateRequest,
} from '@/shared/types'

export const useCreateApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ApplicationCreateRequest) => createApplication(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: applicationQueries.all() })
    },
  })
}

export const useUpdateApplicationStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string
      data: ApplicationStatusUpdateRequest
    }) => updateApplicationStatus(applicationId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: applicationQueries.all() })
    },
  })
}

export const useUpdateApplicationForm = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ApplicationFormSimpleUpdateRequest) => updateApplicationForm(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: applicationQueries.form().queryKey })
    },
  })
}
