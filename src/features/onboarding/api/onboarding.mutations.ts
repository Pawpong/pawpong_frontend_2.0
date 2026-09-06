'use client'

import { useMutation } from '@tanstack/react-query'
import type {
  BreederUploadDocumentType,
  RegisterAdopterRequest,
  RegisterBreederRequest,
} from '@/shared/types'
import {
  checkBreederNameDuplicate,
  checkEmailDuplicate,
  checkNicknameDuplicate,
  registerAdopter,
  registerBreeder,
  sendVerificationCode,
  uploadBreederDocuments,
  uploadProfileImage,
  verifyCode,
} from './onboarding.api'

export const useCheckEmailDuplicate = () =>
  useMutation({ mutationFn: (email: string) => checkEmailDuplicate(email) })

export const useCheckNicknameDuplicate = () =>
  useMutation({ mutationFn: (nickname: string) => checkNicknameDuplicate(nickname) })

export const useCheckBreederNameDuplicate = () =>
  useMutation({ mutationFn: (name: string) => checkBreederNameDuplicate(name) })

export const useSendVerificationCode = () =>
  useMutation({ mutationFn: (phone: string) => sendVerificationCode(phone) })

export const useVerifyCode = () =>
  useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) => verifyCode(phone, code),
  })

export const useRegisterAdopter = () =>
  useMutation({ mutationFn: (data: RegisterAdopterRequest) => registerAdopter(data) })

export const useRegisterBreeder = () =>
  useMutation({ mutationFn: (data: RegisterBreederRequest) => registerBreeder(data) })

export const useUploadBreederDocuments = () =>
  useMutation({
    mutationFn: ({
      tempId,
      files,
    }: {
      tempId: string
      files: { type: BreederUploadDocumentType; file: File }[]
    }) => uploadBreederDocuments(tempId, files),
  })

export const useUploadProfileImage = () =>
  useMutation({
    mutationFn: ({ file, tempId }: { file: File; tempId?: string }) =>
      uploadProfileImage(file, tempId),
  })
