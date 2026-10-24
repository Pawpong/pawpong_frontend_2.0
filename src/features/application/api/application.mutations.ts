'use client'

import { trackAction } from '@/shared/lib/analyticsEvents'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import { applicationQueries } from '@/entities/application'
import type { ApplicationCreateRequest, ApplicationUpdateRequest } from '@/shared/types'
import {
  cancelApplication,
  createApplication,
  saveApplicationDraft,
  updateApplication,
} from './application.api'

export const useSaveApplicationDraft = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: saveApplicationDraft,
    onSuccess: (_, { petId }) =>
      qc.invalidateQueries({ queryKey: applicationQueries.draft(petId).queryKey }),
  })
}

export const useCreateApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ApplicationCreateRequest) => createApplication(data),
    onSuccess: () => {
      trackAction('generate_lead', 'adoption_application')
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

export const useCancelApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: cancelApplication,
    // 실패(409)도 화면이 낡았다는 뜻이라 함께 버린다 — 브리더가 먼저 확정·거절했으면 그 상태로 다시 그린다.
    // 분양글 쪽은 예약이 풀리고 '내 신청 상태'가 바뀌어 재신청 버튼이 다시 열린다.
    onSettled: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: applicationQueries.all() }),
        qc.invalidateQueries({ queryKey: adoptionQueries.all() }),
      ]),
  })
}
