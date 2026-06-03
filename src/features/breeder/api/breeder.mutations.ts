'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { breederQueries } from '@/entities/breeder'
import type {
  ProfileUpdateRequestDto,
  ApplicationStatusUpdateRequest,
  SendChatMessageRequest,
  AvailablePetAddRequest,
  ParentPetAddRequest,
  ParentPetUpdateRequest,
  PetStatusUpdateRequest,
  ReviewReplyRequest,
  VerificationSubmitRequest,
  SubmitDocumentsRequest,
  SimpleApplicationFormUpdateRequest,
  BreederAccountDeleteRequest,
} from '@/shared/types'
import {
  updateBreederProfile,
  updateBreederApplicationStatus,
  sendApplicationChatMessage,
  addAvailablePet,
  updateAvailablePet,
  deleteAvailablePet,
  updateAvailablePetStatus,
  addParentPet,
  updateParentPet,
  deleteParentPet,
  createReviewReply,
  updateReviewReply,
  deleteReviewReply,
  submitVerification,
  submitVerificationDocuments,
  uploadVerificationDocuments,
  updateSimpleApplicationForm,
  deleteBreederAccount,
} from './breeder.api'

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

// ==================== 분양 개체 ====================

export const useAddAvailablePet = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AvailablePetAddRequest) => addAvailablePet(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

export const useUpdateAvailablePet = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ petId, data }: { petId: string; data: AvailablePetAddRequest }) =>
      updateAvailablePet(petId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

export const useDeleteAvailablePet = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (petId: string) => deleteAvailablePet(petId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

export const useUpdateAvailablePetStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ petId, data }: { petId: string; data: PetStatusUpdateRequest }) =>
      updateAvailablePetStatus(petId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

// ==================== 부모견/묘 ====================

export const useAddParentPet = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ParentPetAddRequest) => addParentPet(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

export const useUpdateParentPet = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ petId, data }: { petId: string; data: ParentPetUpdateRequest }) =>
      updateParentPet(petId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

export const useDeleteParentPet = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (petId: string) => deleteParentPet(petId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

// ==================== 후기 답글 ====================

export const useCreateReviewReply = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: ReviewReplyRequest }) =>
      createReviewReply(reviewId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

export const useUpdateReviewReply = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: ReviewReplyRequest }) =>
      updateReviewReply(reviewId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

export const useDeleteReviewReply = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reviewId: string) => deleteReviewReply(reviewId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

// ==================== 인증 ====================

export const useSubmitVerification = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: VerificationSubmitRequest) => submitVerification(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.verification().queryKey })
    },
  })
}

export const useSubmitVerificationDocuments = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SubmitDocumentsRequest) => submitVerificationDocuments(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.verification().queryKey })
    },
  })
}

export const useUploadVerificationDocuments = () => {
  return useMutation({
    mutationFn: ({
      files,
      level,
    }: {
      files: { type: string; file: File }[]
      level: 'new' | 'elite'
    }) => uploadVerificationDocuments(files, level),
  })
}

// ==================== 입양 신청 폼 ====================

export const useUpdateSimpleApplicationForm = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SimpleApplicationFormUpdateRequest) => updateSimpleApplicationForm(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

// ==================== 회원 탈퇴 ====================

export const useDeleteBreederAccount = () => {
  return useMutation({
    mutationFn: (data: BreederAccountDeleteRequest) => deleteBreederAccount(data),
  })
}
