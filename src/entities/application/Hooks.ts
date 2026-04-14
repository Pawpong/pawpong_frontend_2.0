'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationQueries } from './Queries'
import { createApplication, updateApplicationStatus, updateApplicationForm } from './Api'
import type {
  ApplicationCreateRequest,
  ApplicationStatusUpdateRequest,
  ApplicationFormSimpleUpdateRequest,
} from '@/shared/types'

export const useMyApplications = (animalType?: 'cat' | 'dog', limit?: number) =>
  useInfiniteQuery(applicationQueries.myList(animalType, limit))

export const useApplicationDetail = (applicationId: string) =>
  useQuery(applicationQueries.detail(applicationId))

export const useApplicationForm = () => useQuery(applicationQueries.form())

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
