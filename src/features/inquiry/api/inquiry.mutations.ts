'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inquiryQueries } from '@/entities/inquiry'
import type { CreateInquiryRequest } from '@/shared/types'
import { createInquiry, createInquiryAnswer } from './inquiry.api'

export const useCreateInquiry = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInquiryRequest) => createInquiry(data),
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
