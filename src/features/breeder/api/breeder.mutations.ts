'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import { applicationQueries } from '@/entities/application'
import { breederQueries } from '@/entities/breeder'
import { communityQueries } from '@/entities/community'
import { profileQueries } from '@/entities/profile'
import type {
  ProfileUpdateRequestDto,
  ApplicationStatusUpdateRequest,
  ParentPetAddRequest,
  ParentPetUpdateRequest,
  ReviewReplyRequest,
  SimpleApplicationFormUpdateRequest,
  SubmitVerificationDocumentsRequest,
  BreederUploadDocumentType,
  BreederAccountDeleteRequest,
} from '@/shared/types'
import {
  updateBreederProfile,
  updateBreederApplicationStatus,
  addParentPet,
  updateParentPet,
  deleteParentPet,
  createReviewReply,
  updateReviewReply,
  deleteReviewReply,
  updateSimpleApplicationForm,
  uploadVerificationDocuments,
  submitVerificationDocuments,
  deleteBreederAccount,
} from './breeder.api'

export const useUpdateBreederProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProfileUpdateRequestDto) => updateBreederProfile(data),
    onSuccess: async () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
      // 프로필 이미지는 커뮤니티 작성자 snapshot 으로 복제돼 있어, 변경 시 커뮤니티 목록도 갱신되도록 무효화한다.
      void qc.invalidateQueries({ queryKey: communityQueries.all() })
      await qc.invalidateQueries({ queryKey: profileQueries.me().queryKey })
    },
  })
}

// ==================== 인증 서류 재제출 ====================

export const useUploadVerificationDocuments = () =>
  useMutation({
    mutationFn: (files: { type: BreederUploadDocumentType; file: File }[]) =>
      uploadVerificationDocuments(files),
  })

export const useSubmitVerificationDocuments = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SubmitVerificationDocumentsRequest) => submitVerificationDocuments(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: breederQueries.all() })
    },
  })
}

/**
 * 신청 상태가 바뀌었을 때(또는 바뀐 걸 뒤늦게 알았을 때) 버려야 하는 캐시 묶음.
 * 성공·실패 양쪽에서 같은 범위를 버린다 — 실패는 대개 "서버가 이미 다른 상태"라는 신호라
 * 화면을 그대로 두면 낡은 버튼이 남는다.
 */
const useInvalidateApplicationScope = () => {
  const qc = useQueryClient()
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: breederQueries.all() }),
      qc.invalidateQueries({ queryKey: adoptionQueries.all() }),
      qc.invalidateQueries({ queryKey: applicationQueries.all() }),
    ])
}

export const useUpdateBreederApplicationStatus = () => {
  const invalidateApplicationScope = useInvalidateApplicationScope()
  return useMutation({
    mutationFn: ({
      applicationId,
      data,
    }: {
      applicationId: string
      data: Omit<ApplicationStatusUpdateRequest, 'applicationId'>
    }) => updateBreederApplicationStatus(applicationId, data),
    onSuccess: () => {
      // 입양 확정은 신청서 한 건으로 끝나지 않는다 — 서버가 펫 상태를 adopted 로 바꾸고
      // 같은 펫의 다른 대기 신청을 거절 처리하므로, 분양글·신청 캐시까지 함께 버린다.
      // (breeder 쿼리만 버리면 확정 후에도 카드가 '분양중'인 채로 남는다)
      void invalidateApplicationScope()
    },
    onError: () => {
      // 서버가 전이를 거절하는 건(409) 화면이 실제보다 낡았다는 뜻이다 — 예컨대 같은 펫의 다른
      // 신청을 확정해서 이 신청이 이미 자동 거절됐는데, 열어둔 탭은 아직 '입양 확정' 버튼을 들고
      // 있는 경우. 에러만 띄우고 두면 사라졌어야 할 버튼이 계속 남아 다시 누르게 된다.
      void invalidateApplicationScope()
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
