'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inquiryQueries } from '@/entities/inquiry'
import type { CreateInquiryRequest, UpdateInquiryRequest } from '@/shared/types'
import { createInquiry, updateInquiry, deleteInquiry, createInquiryAnswer } from './inquiry.api'

export const useCreateInquiry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInquiryRequest) => createInquiry(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inquiryQueries.all() })
    },
  })
}

export const useUpdateInquiry = (inquiryId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateInquiryRequest) => updateInquiry(inquiryId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inquiryQueries.detail(inquiryId).queryKey })
      void qc.invalidateQueries({ queryKey: inquiryQueries.all() })
    },
  })
}

export const useDeleteInquiry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (inquiryId: string) => deleteInquiry(inquiryId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inquiryQueries.all() })
    },
  })
}

export const useCreateInquiryAnswer = (inquiryId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => createInquiryAnswer(inquiryId, content),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inquiryQueries.detail(inquiryId).queryKey })
      void qc.invalidateQueries({ queryKey: inquiryQueries.all() })
    },
  })
}
