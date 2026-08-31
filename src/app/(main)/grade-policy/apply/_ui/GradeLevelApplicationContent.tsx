'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { breederQueries } from '@/entities/breeder'
import { useRequestBreederLevelChange, useUploadVerificationDocuments } from '@/features/breeder'
import { AlertCircleIcon, CheckRoundedIcon, PixelStarFillIcon } from '@/shared/assets'
import { normalizeApiError } from '@/shared/api'
import { cn } from '@/shared/lib/cn'
import { formatDate } from '@/shared/lib/formatDate'
import {
  AlertMessage,
  AsyncState,
  Badge,
  Button,
  buttonVariants,
  Container,
  DocumentFilePicker,
  NavigationBar,
} from '@/shared/ui'

const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024
const ACCEPTED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])

type ProfessionalDocumentType = 'breederCertification' | 'recentPedigreeDocument'

const PROFESSIONAL_DOCUMENT_OPTIONS: Array<{
  type: ProfessionalDocumentType
  label: string
  description: string
}> = [
  {
    type: 'breederCertification',
    label: '자격·협회 활동 증빙',
    description: '브리더 자격증, 협회 등록증 또는 TICA·CFA 관련 자료',
  },
  {
    type: 'recentPedigreeDocument',
    label: '최근 발급 혈통서',
    description: '최근 발급된 부모 동물 또는 사육 동물의 혈통서',
  },
]

const validateDocument = (file: File): string | null => {
  if (!ACCEPTED_DOCUMENT_TYPES.has(file.type)) return 'PDF, JPG, PNG, WEBP 파일만 올릴 수 있어요.'
  if (file.size > MAX_DOCUMENT_SIZE) return '파일 하나의 크기는 20MB 이하여야 해요.'
  return null
}

const StatusCard = ({
  title,
  description,
  badge,
  children,
}: {
  title: string
  description: string
  badge: string
  children?: React.ReactNode
}) => (
  <section className="rounded-xl border border-neutral-150 bg-white p-5 shadow-[0_7px_7px_rgba(55,55,55,0.06)] tab:p-6">
    <div className="flex items-start justify-between gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-point-50 text-primary-500">
        <PixelStarFillIcon className="size-7" aria-hidden />
      </span>
      <Badge variant="pointFilled" size="lg">
        {badge}
      </Badge>
    </div>
    <h1 className="mt-5 font-cafe24 text-xl leading-[1.4] text-neutral-850 tab:text-2xl">
      {title}
    </h1>
    <p className="mt-2 text-sm leading-[1.65] font-medium text-neutral-700 tab:text-base">
      {description}
    </p>
    {children}
  </section>
)

const GradeLevelApplicationContent = () => {
  const verificationQuery = useQuery({
    ...breederQueries.verification(),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const uploadDocuments = useUploadVerificationDocuments()
  const requestLevelChange = useRequestBreederLevelChange()

  const [contractFile, setContractFile] = useState<File>()
  const [professionalFile, setProfessionalFile] = useState<File>()
  const [professionalType, setProfessionalType] =
    useState<ProfessionalDocumentType>('breederCertification')
  const [fieldErrors, setFieldErrors] = useState<Record<'contract' | 'professional', string>>({
    contract: '',
    professional: '',
  })
  const [submitError, setSubmitError] = useState('')

  const verification = verificationQuery.data
  const isSubmitting = uploadDocuments.isPending || requestLevelChange.isPending

  const selectFile = (field: 'contract' | 'professional', file: File) => {
    const error = validateDocument(file)
    setFieldErrors((current) => ({ ...current, [field]: error || '' }))
    if (error) {
      if (field === 'contract') setContractFile(undefined)
      else setProfessionalFile(undefined)
      return
    }

    if (field === 'contract') setContractFile(file)
    else setProfessionalFile(file)
    setSubmitError('')
  }

  const submit = async () => {
    const nextErrors = {
      contract: contractFile ? '' : '표준 입양계약서 샘플을 선택해주세요.',
      professional: professionalFile ? '' : '전문성 증빙 서류를 선택해주세요.',
    }
    setFieldErrors(nextErrors)
    if (!contractFile || !professionalFile) return

    setSubmitError('')
    try {
      const uploaded = await uploadDocuments.mutateAsync({
        level: 'elite',
        files: [
          { type: 'adoptionContractSample', file: contractFile },
          { type: professionalType, file: professionalFile },
        ],
      })

      await requestLevelChange.mutateAsync({
        requestedLevel: 'elite',
        documents: uploaded.documents.map(({ type, fileName, originalFileName }) => ({
          type,
          fileName,
          originalFileName,
        })),
      })
    } catch (error) {
      setSubmitError(normalizeApiError(error, '등급 변경 신청을 완료하지 못했습니다.').message)
    }
  }

  if (verificationQuery.isPending) {
    return (
      <div className="flex w-full flex-1 flex-col bg-primary-50/20">
        <NavigationBar title="브리더 등급 관리" backHref="/grade-policy" />
        <AsyncState
          status="loading"
          message="현재 등급을 확인하고 있어요."
          className="min-h-[calc(100dvh-8rem)]"
        />
      </div>
    )
  }

  if (verificationQuery.isError || !verification) {
    return (
      <div className="flex w-full flex-1 flex-col bg-primary-50/20">
        <NavigationBar title="브리더 등급 관리" backHref="/grade-policy" />
        <AsyncState
          status="error"
          message="등급 정보를 불러오지 못했습니다."
          action={
            <Button variant="fill" size="sm" onClick={() => void verificationQuery.refetch()}>
              다시 시도
            </Button>
          }
          className="min-h-[calc(100dvh-8rem)]"
        />
      </div>
    )
  }

  const isApproved = verification.status === 'approved'
  const isElite = verification.level === 'elite'

  return (
    <div className="flex w-full flex-1 flex-col bg-primary-50/20 pb-16">
      <NavigationBar title="브리더 등급 관리" backHref="/grade-policy" />

      <Container className="py-5 tab:py-8 pc:py-10">
        <div className="mx-auto flex w-full max-w-168 flex-col gap-5 tab:gap-6 pc:max-w-[59.25rem]">
          {!isApproved && (
            <StatusCard
              badge="New 심사"
              title="기본 브리더 심사가 먼저 필요해요"
              description={
                verification.status === 'rejected'
                  ? '기본 서류 심사가 반려된 상태입니다. 반려 사유를 확인하고 서류를 다시 제출해주세요.'
                  : 'Elite 신청은 New 브리더 승인이 끝난 뒤 열립니다. 현재 기본 서류를 검토하고 있어요.'
              }
            >
              {verification.rejectionReason && (
                <AlertMessage
                  status="error"
                  size="responsive"
                  icon={AlertCircleIcon}
                  message={verification.rejectionReason}
                  className="mt-5"
                />
              )}
              <Link
                href="/settings"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'mt-5 inline-flex px-5',
                )}
              >
                설정으로 돌아가기
              </Link>
            </StatusCard>
          )}

          {isApproved && isElite && (
            <StatusCard
              badge="Elite"
              title="Elite 브리더로 승인되었어요"
              description="추가 전문성 자료까지 확인된 상태입니다. 공개 프로필과 분양글에 Elite 등급이 표시됩니다."
            >
              {verification.reviewedAt && (
                <p className="mt-4 text-xs font-medium text-neutral-500 tab:text-sm">
                  최근 심사일 {formatDate(verification.reviewedAt)}
                </p>
              )}
            </StatusCard>
          )}

          {isApproved && !isElite && verification.isLevelChangeRequested && (
            <StatusCard
              badge="심사 중"
              title="Elite 등급 자료를 확인하고 있어요"
              description="추가 자료가 접수되었습니다. 심사가 끝나면 알림으로 결과를 알려드릴게요. 심사 중에는 같은 신청을 다시 보낼 수 없습니다."
            >
              {verification.levelChangeRequest?.requestedAt && (
                <p className="mt-4 text-xs font-medium text-neutral-500 tab:text-sm">
                  접수일 {formatDate(verification.levelChangeRequest.requestedAt)} · 제출 서류{' '}
                  {verification.levelChangeRequest.documents.length}개
                </p>
              )}
            </StatusCard>
          )}

          {isApproved && !isElite && !verification.isLevelChangeRequested && (
            <>
              <StatusCard
                badge="New"
                title="Elite 등급 심사를 신청할 수 있어요"
                description="기본 승인 서류는 다시 올리지 않아도 됩니다. 실제 사용하는 입양계약서와 전문성을 확인할 자료만 추가해주세요."
              >
                {verification.levelChangeRejectionReason && (
                  <AlertMessage
                    status="error"
                    size="responsive"
                    icon={AlertCircleIcon}
                    message={`최근 신청 반려 사유: ${verification.levelChangeRejectionReason}`}
                    className="mt-5"
                  />
                )}
              </StatusCard>

              <section className="rounded-xl border border-neutral-150 bg-white p-5 shadow-[0_7px_7px_rgba(55,55,55,0.06)] tab:p-6">
                <div className="flex flex-col gap-1">
                  <h2 className="font-cafe24 text-xl text-neutral-850">추가 확인 자료</h2>
                  <p className="text-sm leading-[1.6] font-medium text-neutral-500 tab:text-base">
                    PDF·JPG·PNG·WEBP 형식, 파일당 최대 20MB
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-4">
                  <DocumentFilePicker
                    label="표준 입양계약서 샘플"
                    description="실제 상담·입양에 사용하는 계약서"
                    selectedFileName={contractFile?.name}
                    error={fieldErrors.contract}
                    disabled={isSubmitting}
                    onFileSelect={(file) => selectFile('contract', file)}
                  />

                  <fieldset className="flex flex-col gap-3">
                    <legend className="text-sm font-semibold text-neutral-850 tab:text-base">
                      전문성 증빙 종류
                    </legend>
                    <div className="grid grid-cols-1 gap-2 tab:grid-cols-2">
                      {PROFESSIONAL_DOCUMENT_OPTIONS.map((option) => {
                        const selected = professionalType === option.type
                        return (
                          <button
                            key={option.type}
                            type="button"
                            disabled={isSubmitting}
                            aria-pressed={selected}
                            onClick={() => {
                              if (professionalType !== option.type) {
                                setProfessionalType(option.type)
                                setProfessionalFile(undefined)
                                setFieldErrors((current) => ({ ...current, professional: '' }))
                              }
                            }}
                            className={`flex min-h-20 items-start gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-60 ${
                              selected
                                ? 'border-primary-500 bg-primary-50/50'
                                : 'border-neutral-200 bg-white hover:border-primary-200'
                            }`}
                          >
                            <span
                              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? 'border-primary-500 bg-primary-500 text-white'
                                  : 'border-neutral-300 text-transparent'
                              }`}
                            >
                              <CheckRoundedIcon className="size-3.5" aria-hidden />
                            </span>
                            <span className="flex flex-col gap-0.5">
                              <span className="text-sm font-semibold text-neutral-850">
                                {option.label}
                              </span>
                              <span className="text-xs leading-[1.5] font-medium text-neutral-500">
                                {option.description}
                              </span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>

                  <DocumentFilePicker
                    label={
                      PROFESSIONAL_DOCUMENT_OPTIONS.find(({ type }) => type === professionalType)
                        ?.label || '전문성 증빙'
                    }
                    description="선택한 종류에 맞는 증빙 파일"
                    selectedFileName={professionalFile?.name}
                    error={fieldErrors.professional}
                    disabled={isSubmitting}
                    onFileSelect={(file) => selectFile('professional', file)}
                  />
                </div>

                {submitError && (
                  <AlertMessage
                    status="error"
                    size="responsive"
                    icon={AlertCircleIcon}
                    message={submitError}
                    className="mt-5"
                  />
                )}

                <div className="mt-6 flex flex-col-reverse gap-2.5 tab:flex-row tab:justify-end tab:gap-4">
                  <Link
                    href="/grade-policy"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'lg' }),
                      'w-full tab:w-40',
                    )}
                  >
                    정책 다시 보기
                  </Link>
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    onClick={() => void submit()}
                    className="tab:w-48"
                  >
                    {isSubmitting ? '신청하는 중' : 'Elite 심사 신청'}
                  </Button>
                </div>
              </section>
            </>
          )}
        </div>
      </Container>
    </div>
  )
}

export { GradeLevelApplicationContent }
