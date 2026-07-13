'use client'

import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { useOnboarding } from '../model/OnboardingContext'
import { useStepForm } from '../model/useStepForm'
import {
  useCompleteBreederRegistration,
  useUploadBreederDocuments,
  loadSocialSignupSession,
  clearSocialSignupSession,
} from '@/features/auth'
import { useUpdateMyProfile } from '@/features/profile'
import {
  documentsSchema,
  type DocumentsFormData,
  type AnimalSelectFormData,
  type KennelInfoFormData,
  type ProfileFormData,
} from '../model/schema'
import type { BreederRegistrationDto } from '@/shared/types'
import { StepContainer } from './StepContainer'
import { DocumentUploadButton } from './DocumentUploadButton'
import { CheckboxField } from './CheckboxField'

// FE 동물 enum(lizard) → 백엔드 petType enum(reptile) 매핑
const PET_TYPE_MAP: Record<string, string> = { cat: 'cat', dog: 'dog', lizard: 'reptile' }

// 브리더 가입 시 UI 입력이 없는 필드 기본값 (백엔드 필수)
const DEFAULT_PLAN = 'basic'
const DEFAULT_LEVEL = 'new' as const

const DocumentsStep = () => {
  // 브리더 플로우의 마지막 데이터 단계 — 여기서 서류 업로드 + 실제 가입(social/complete)을 호출한다.
  const { goBack, goNext, formData, setFormData } = useOnboarding()

  const { control, handleSubmit, watch, setValue, firstErrorMessage } =
    useStepForm<DocumentsFormData>('documents', documentsSchema, {
      idDocument: undefined,
      registrationCert: undefined,
      breederAgreed: false as unknown as true,
    })

  const idDocument = watch('idDocument')
  const registrationCert = watch('registrationCert')

  const { mutateAsync: completeBreeder, isPending: isCompleting } = useCompleteBreederRegistration()
  const { mutateAsync: uploadDocuments, isPending: isUploading } = useUploadBreederDocuments()
  const { mutateAsync: updateMyBio } = useUpdateMyProfile()
  const isPending = isCompleting || isUploading
  const [submitError, setSubmitError] = useState<string | null>(null)

  // "다음" → 서류 업로드(있으면) + 브리더 가입 완료 (성공 시에만 complete 단계로 이동)
  const handleComplete = async (documentsData: DocumentsFormData) => {
    if (isPending) return
    setFormData('documents', documentsData)
    setSubmitError(null)

    if (!documentsData.breederAgreed) {
      setSubmitError('브리더 입점 서약서에 동의해주세요.')
      return
    }

    const social = loadSocialSignupSession()
    if (!social?.tempId) {
      setSubmitError(
        '소셜 가입 정보가 없습니다. 로그인 화면에서 소셜 로그인으로 다시 시작해주세요.',
      )
      return
    }

    // 이전 단계들에서 모은 입력값 (animal-select → profile → kennel-info 순으로 채워짐)
    const animal = (formData['animal-select'] ?? {}) as Partial<AnimalSelectFormData>
    const kennel = (formData['kennel-info'] ?? {}) as Partial<KennelInfoFormData>
    const profile = (formData['profile'] ?? {}) as Partial<ProfileFormData>

    const petType = animal.selected ? PET_TYPE_MAP[animal.selected] : ''
    const email =
      social.email ||
      (profile.email && profile.emailDomain ? `${profile.email}@${profile.emailDomain}` : '')
    const breeds = kennel.selectedBreeds ?? []

    // 백엔드 필수값 사전 검증 (FE 스키마상 optional 이지만 social/complete 에서 필수)
    // if 체인은 이후 DTO 빌드에서 쓰는 타입 좁히기 역할도 겸함 — 테이블화하지 않음
    if (!petType) {
      setSubmitError('브리딩 동물을 선택해주세요. (브리딩 동물 선택 단계)')
      return
    }
    if (!kennel.breederName) {
      setSubmitError('브리더명을 입력해주세요. (브리더 정보 단계)')
      return
    }
    if (!kennel.region) {
      setSubmitError('지역을 선택해주세요. (브리더 정보 단계)')
      return
    }
    if (breeds.length === 0) {
      setSubmitError('품종을 1개 이상 선택해주세요. (브리더 정보 단계)')
      return
    }
    if (!profile.phone) {
      setSubmitError('휴대폰 인증을 완료해주세요. (계정 정보 단계)')
      return
    }

    const dto: BreederRegistrationDto = {
      tempId: social.tempId,
      provider: social.provider,
      email,
      // 백엔드 DTO 는 name 을 필수로 요구 — 소셜 이름이 없으면 브리더명으로 대체
      name: social.name || kennel.breederName,
      phone: profile.phone,
      petType,
      plan: DEFAULT_PLAN,
      breederName: kennel.breederName,
      city: kennel.region,
      district: '',
      breeds,
      level: DEFAULT_LEVEL,
      marketingAgreed: profile.marketingAgreed ?? false,
      profileImage: kennel.profileImage || undefined,
    }

    // 업로드할 서류 (선택된 것만 — 0개면 업로드 호출을 건너뛴다)
    const documents: { type: string; file: File }[] = []
    if (documentsData.idDocument) documents.push({ type: 'idCard', file: documentsData.idDocument })
    if (documentsData.registrationCert) {
      documents.push({ type: 'animalProductionLicense', file: documentsData.registrationCert })
    }

    try {
      // 서류는 tempId(가입 대기) 기준으로 먼저 업로드 → 이후 complete 가 브리더를 생성한다
      if (documents.length > 0) {
        await uploadDocuments({ tempId: social.tempId, files: documents, level: DEFAULT_LEVEL })
      }

      const auth = await completeBreeder(dto)

      // 발급 토큰을 쿠키로 저장해 로그인 상태로 전환
      try {
        await fetch('/api/auth/set-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
          }),
          credentials: 'include',
        })
      } catch {
        // 쿠키 저장에 실패해도 가입 자체는 완료된 상태 — 완료 화면으로 진행
      }
      // 가입 때 적은 브리더 소개를 프로필 소개(bio)로 저장 (베스트에포트)
      const intro = kennel.introduction?.trim()
      if (intro) {
        try {
          await updateMyBio({ bio: intro })
        } catch {
          // bio 저장 실패는 무시 — 마이홈 편집에서 다시 입력 가능
        }
      }
      clearSocialSignupSession()
      goNext()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '회원가입 완료에 실패했습니다.')
    }
  }

  return (
    <StepContainer
      title="브리더 정보를 입력해주세요"
      onNext={() => handleSubmit(handleComplete)()}
      onBack={goBack}
      nextLabel={isPending ? '가입 중...' : '다음'}
      nextDisabled={isPending}
      navError={firstErrorMessage ?? submitError ?? undefined}
      navClassName="tab:mt-[9.9375rem]"
    >
      {/* 서류 영역 */}
      <div className="mt-[4rem] flex w-full flex-col px-[1.25rem] tab:mt-[6rem] tab:w-[53.8125rem] tab:px-0">
        <DocumentUploadButton
          label="신분증 사본"
          variant="primary"
          selectedFileName={idDocument?.name}
          onFileSelect={(file) => setValue('idDocument', file)}
        />

        <p className="mt-[0.375rem] text-[0.875rem] leading-[1.375rem] font-semibold text-[#a8a8a8] tab:mt-[0.75rem] tab:px-[2.875rem]">
          이름과 생년월일 이외에 개인정보는 가려서 제출해주시 바랍니다.
        </p>

        <DocumentUploadButton
          label="동물생산업 등록증"
          variant="secondary"
          selectedFileName={registrationCert?.name}
          onFileSelect={(file) => setValue('registrationCert', file)}
          className="mt-[1rem] tab:mt-[2rem]"
        />

        <Controller
          name="breederAgreed"
          control={control}
          render={({ field }) => (
            <CheckboxField
              label="(필수) 브리더 입점 서약서"
              checked={!!field.value}
              onCheckedChange={(checked) => field.onChange(checked)}
              hasDetailLink
              className="mt-[1rem] rounded-[1rem] bg-white px-[1.25rem] py-[0.9375rem] tab:mt-[4rem]"
            />
          )}
        />
      </div>
    </StepContainer>
  )
}

export { DocumentsStep }
