'use client'

import { useRef, useState } from 'react'
import { useRegisterBreeder, useUploadBreederDocuments } from '../api/onboarding.mutations'
import { updateMyProfile } from '@/entities/profile'
import { useOnboarding } from './OnboardingContext'
import { useSignupCompletion } from './useSignupCompletion' // [refactored]
import { SIGNUP_ERROR } from './signupErrors' // [refactored]
import type { DocumentsFormData } from './schema'
import {
  buildBreederRegistrationRequest,
  DEFAULT_BREEDER_LEVEL,
} from './buildBreederRegistrationRequest'
import { getBreederDocumentsSignature, getSelectedBreederDocuments } from './breederDocuments'

/**
 * 브리더 가입 완료 (서류 업로드 → POST /auth/register/breeder → bio PATCH)
 *
 * 입점 서류가 브리더 플로우의 마지막 데이터 단계라, 앞 단계들(animal-select·profile·kennel-info)
 * 에서 모은 값과 소셜 세션을 합쳐 가입 DTO 를 만든다. 성공 시에만 다음(가입완료) 단계로 넘어간다.
 */
export const useBreederSignup = () => {
  const { formData, setFormData } = useOnboarding()
  const { mutateAsync: registerBreeder, isPending: isCompleting } = useRegisterBreeder()
  const { mutateAsync: uploadDocuments, isPending: isUploading } = useUploadBreederDocuments()
  // 가입 요청이 실패해 다시 시도할 때 같은 서류를 또 올리지 않도록 업로드 결과를 들고 있는다
  const uploadedRef = useRef<{
    signature: string
    result: Awaited<ReturnType<typeof uploadDocuments>>
  } | null>(null)
  const isPending = isCompleting || isUploading
  const [error, setError] = useState<string | null>(null)
  // [refactored] 세션 확인 + 가입 마무리는 입양자 플로우와 동일 — 공통 훅으로
  const { requireSocialSession, complete } = useSignupCompletion(setError)

  const submit = async (documentsData: DocumentsFormData) => {
    if (isPending) return
    setFormData('documents', documentsData)
    setError(null)

    const social = requireSocialSession()
    if (!social) return

    // 이전 단계들에서 모은 입력값 (animal-select → profile → kennel-info 순으로 채워짐)
    const animal = formData['animal-select']
    const kennel = formData['kennel-info']
    const profile = formData.profile

    // 폼의 이메일은 소셜 세션 값을 그대로 채운 것 — 세션이 우선, 없으면 폼 값
    const email = social.email || profile?.email || ''
    const breeds = kennel?.selectedBreeds ?? []

    // 백엔드 필수값 사전 검증 (FE 스키마상 optional 이지만 register/breeder 에서 필수)
    // if 체인은 이후 DTO 빌드에서 쓰는 타입 좁히기 역할도 겸함 — 테이블화하지 않음
    if (!animal?.selected) {
      setError('브리딩 동물을 선택해주세요. (브리딩 동물 선택 단계)')
      return
    }
    if (!kennel?.breederName) {
      setError('브리더명을 입력해주세요. (브리더 정보 단계)')
      return
    }
    if (!kennel.region) {
      setError('지역을 선택해주세요. (브리더 정보 단계)')
      return
    }
    if (breeds.length === 0) {
      setError('품종을 1개 이상 선택해주세요. (브리더 정보 단계)')
      return
    }
    if (!profile?.phone || !profile.phoneVerified) {
      setError(SIGNUP_ERROR.phoneUnverified)
      return
    }
    if (!email) {
      setError(SIGNUP_ERROR.noEmail)
      return
    }

    // 업로드할 서류 (선택된 것만 — 0개면 업로드 호출을 건너뛴다)
    const documents = getSelectedBreederDocuments(documentsData)

    try {
      // 서류는 tempId(가입 대기) 기준으로 먼저 업로드하고, 받은 경로를 가입 요청에 함께 싣는다.
      // 파일이 그대로면 이전 업로드 결과를 재사용한다 — 가입 실패 후 재시도에서 중복 업로드 방지
      const signature = getBreederDocumentsSignature(documents)
      let uploaded =
        uploadedRef.current?.signature === signature ? uploadedRef.current.result : null

      if (documents.length > 0 && !uploaded) {
        uploaded = await uploadDocuments({
          tempId: social.tempId,
          files: documents,
          level: DEFAULT_BREEDER_LEVEL,
        })
        uploadedRef.current = { signature, result: uploaded }
      }

      const dto = buildBreederRegistrationRequest({ social, animal, profile, kennel, uploaded })

      const tokens = await registerBreeder(dto)

      // 가입 DTO 에 한 줄 소개(bio) 필드가 없어 가입 후 별도 PATCH 한다 (베스트에포트).
      // 토큰 쿠키가 심긴 뒤 · 화면 이동 전에 실행돼야 해서 complete 의 콜백으로 넘긴다
      const intro = kennel.introduction?.trim()
      await complete(tokens, async () => {
        if (!intro) return
        try {
          await updateMyProfile({ bio: intro })
        } catch {
          // bio 저장 실패는 무시 — 마이홈에서 다시 입력 가능
        }
      }) // [refactored]
    } catch (err) {
      setError(err instanceof Error ? err.message : SIGNUP_ERROR.registerFailed)
    }
  }

  return { submit, isPending, error }
}
