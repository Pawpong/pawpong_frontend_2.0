'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { breederQueries } from '@/entities/breeder/Queries'
import {
  updateBreederProfile,
  updateBreederApplicationStatus,
  sendApplicationChatMessage,
} from '@/entities/breeder/Api'
import type {
  ProfileUpdateRequestDto,
  ApplicationStatusUpdateRequest,
  SendChatMessageRequest,
} from '@/shared/types'

export const useUpdateBreederProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProfileUpdateRequestDto) => updateBreederProfile(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

export const useUpdateBreederApplicationStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string
      data: ApplicationStatusUpdateRequest
    }) => updateBreederApplicationStatus(applicationId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

export const useSendChatMessage = (applicationId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SendChatMessageRequest) => sendApplicationChatMessage(applicationId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.chatMessages(applicationId).queryKey })
    },
  })
}
