'use client'

import { useMutation } from '@tanstack/react-query'
import {
  checkEmailDuplicate,
  checkNicknameDuplicate,
  checkBreederNameDuplicate,
  sendVerificationCode,
  verifyCode,
  completeAdopterRegistration,
  completeBreederRegistration,
  uploadBreederDocuments,
  uploadProfileImage,
  logout,
} from '../api'
import type { AdopterRegistrationDto, BreederRegistrationDto } from '@/shared/types'

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

export const useCompleteAdopterRegistration = () =>
  useMutation({ mutationFn: (data: AdopterRegistrationDto) => completeAdopterRegistration(data) })

export const useCompleteBreederRegistration = () =>
  useMutation({ mutationFn: (data: BreederRegistrationDto) => completeBreederRegistration(data) })

export const useUploadBreederDocuments = () =>
  useMutation({
    mutationFn: ({
      tempId,
      files,
      level,
    }: {
      tempId: string
      files: { type: string; file: File }[]
      level: 'new' | 'elite'
    }) => uploadBreederDocuments(tempId, files, level),
  })

export const useUploadProfileImage = () =>
  useMutation({
    mutationFn: ({ file, tempId }: { file: File; tempId?: string }) =>
      uploadProfileImage(file, tempId),
  })

export const useLogout = () => useMutation({ mutationFn: logout })
