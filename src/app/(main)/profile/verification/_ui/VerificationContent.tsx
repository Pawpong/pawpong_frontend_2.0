'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { breederQueries } from '@/entities/breeder'
import { useSubmitVerificationDocuments, useUploadVerificationDocuments } from '@/features/breeder'
import { normalizeApiError } from '@/shared/api'
import { TEXT } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { useToast } from '@/shared/lib/useToast'
import { AlertCircleIcon, CheckIcon } from '@/shared/assets'
import { AlertMessage, AsyncState, Button, Container, DocumentFilePicker } from '@/shared/ui'
import type { BreederUploadDocumentType, BreederVerificationStatus } from '@/shared/types'

const DOCUMENT_FIELDS: { type: BreederUploadDocumentType; label: string }[] = [
  { type: 'idCard', label: '신분증 사본' },
  { type: 'animalProductionLicense', label: '동물생산업 등록증' },
]

// 백엔드가 저장 시 항상 snake_case로 정규화해서 GET 응답도 snake_case로 온다
// (AuthBreederDocumentTypeService.toPersistedType / BreederManagementVerificationDocumentPolicyService
// 의 DOCUMENT_TYPE_ALIASES와 동일한 매핑) — 조회 시 이 타입으로 변환해서 찾아야 기존 서류가 보인다.
const PERSISTED_TYPE: Record<BreederUploadDocumentType, string> = {
  idCard: 'id_card',
  animalProductionLicense: 'animal_production_license',
}

const isImageFile = (name?: string) => !!name && /\.(jpe?g|png|webp|gif)$/i.test(name)

const STATUS_CONTENT: Record<
  BreederVerificationStatus,
  { label: string; title: string; description: string; step: number }
> = {
  not_submitted: {
    label: '제출 전',
    title: '브리더 인증을 시작해볼까요?',
    description: '인증에 필요한 서류를 등록해주세요. 제출한 서류를 확인한 뒤 결과를 알려드릴게요.',
    step: 0,
  },
  pending: {
    label: '심사 대기',
    title: '서류가 잘 접수됐어요',
    description: '제출한 서류의 심사를 기다리고 있어요. 심사가 시작되면 이곳에서 확인할 수 있어요.',
    step: 1,
  },
  reviewing: {
    label: '심사 중',
    title: '서류를 꼼꼼히 확인하고 있어요',
    description: '브리더 인증 심사가 진행 중이에요. 결과가 나오면 알려드릴게요.',
    step: 1,
  },
  approved: {
    label: '인증 완료',
    title: '브리더 인증이 완료됐어요',
    description: '제출한 서류 확인이 끝났어요. 아래에서 등록한 서류를 확인할 수 있어요.',
    step: 2,
  },
  rejected: {
    label: '보완 필요',
    title: '서류를 한 번 더 확인해주세요',
    description: '아래 안내를 확인하고 필요한 서류를 보완해 다시 제출해주세요.',
    step: 0,
  },
}

const VerificationContent = () => {
  const toast = useToast()
  const profileQuery = useQuery({
    ...breederQueries.myProfile(),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const uploadDocs = useUploadVerificationDocuments()
  const submitDocs = useSubmitVerificationDocuments()

  const [files, setFiles] = useState<Partial<Record<BreederUploadDocumentType, File>>>({})
  // 새로 고른 이미지 파일의 로컬 미리보기(blob:) — 언마운트 시 한 번에 해제한다
  const [localPreviews, setLocalPreviews] = useState<
    Partial<Record<BreederUploadDocumentType, string>>
  >({})
  const localPreviewsRef = useRef(localPreviews)
  useEffect(() => {
    localPreviewsRef.current = localPreviews
  }, [localPreviews])
  useEffect(
    () => () => {
      Object.values(localPreviewsRef.current).forEach((url) => url && URL.revokeObjectURL(url))
    },
    [],
  )

  const verification = profileQuery.data?.verificationInfo
  const existingByType = new Map((verification?.documents ?? []).map((doc) => [doc.type, doc]))
  const getExisting = (type: BreederUploadDocumentType) => existingByType.get(PERSISTED_TYPE[type])
  const isSubmitting = uploadDocs.isPending || submitDocs.isPending
  const hasAnyDocument = DOCUMENT_FIELDS.some(({ type }) => files[type] || getExisting(type))

  const handleFileSelect = (type: BreederUploadDocumentType) => (file: File) => {
    setFiles((prev) => ({ ...prev, [type]: file }))
    setLocalPreviews((prev) => {
      if (prev[type]) URL.revokeObjectURL(prev[type]!)
      return {
        ...prev,
        [type]: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }
    })
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    if (!hasAnyDocument) {
      toast.error('서류를 한 개 이상 선택해주세요.')
      return
    }

    try {
      const newEntries = Object.entries(files) as [BreederUploadDocumentType, File][]
      const uploaded = newEntries.length
        ? (await uploadDocs.mutateAsync(newEntries.map(([type, file]) => ({ type, file }))))
            .documents
        : []

      // 방금 새로 올린 서류 우선, 없으면 기존에 제출했던 서류(변경 없음)를 그대로 다시 보낸다
      const documents = DOCUMENT_FIELDS.flatMap(({ type }) => {
        const justUploaded = uploaded.find((doc) => doc.type === type)
        if (justUploaded) {
          return [
            {
              type,
              fileName: justUploaded.fileName,
              originalFileName: justUploaded.originalFileName,
            },
          ]
        }
        const existing = getExisting(type)
        if (existing?.fileName) {
          return [
            { type, fileName: existing.fileName, originalFileName: existing.originalFileName },
          ]
        }
        return []
      })

      await submitDocs.mutateAsync({ documents })
      setFiles({})
      toast.success('서류를 제출했어요. 심사 결과를 알려드릴게요.')
    } catch (error) {
      toast.error(normalizeApiError(error, '서류 제출에 실패했습니다.').message)
    }
  }

  if (profileQuery.isPending) {
    return (
      <AsyncState status="loading" message="인증 정보를 불러오는 중입니다." className="min-h-dvh" />
    )
  }

  if (profileQuery.isError || !verification) {
    return (
      <AsyncState
        status="error"
        message="인증 정보를 불러오지 못했습니다."
        action={
          <Button variant="fill" size="sm" onClick={() => void profileQuery.refetch()}>
            다시 시도
          </Button>
        }
        className="min-h-dvh"
      />
    )
  }

  const displayStatus = verification.status
  const statusContent = STATUS_CONTENT[displayStatus]
  const isComplete = displayStatus === 'approved'
  const needsRevision = displayStatus === 'rejected'
  // 심사 대기/심사 중/인증 완료 상태에서는 서류를 바꿀 수 없다 — 반려됐을 때만 재제출 가능
  const canEdit = displayStatus === 'not_submitted' || needsRevision
  const displayRejectionReason = needsRevision ? verification.rejectionReason : undefined

  return (
    <div className="flex w-full flex-col">
      <div
        className={cn(
          'mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 pt-8 tab:gap-10 tab:px-8 tab:pt-12',
          canEdit ? 'pb-36' : 'pb-12',
        )}
      >
        <header className="flex flex-col items-start gap-4">
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-body-md font-medium',
              needsRevision ? 'bg-error-50 text-error-600' : 'bg-primary-50 text-primary-700',
            )}
          >
            {isComplete ? (
              <CheckIcon className="size-4" />
            ) : (
              <span className="size-1.5 rounded-full bg-current" />
            )}
            {statusContent.label}
          </span>
          <h1 className={TEXT.display}>{statusContent.title}</h1>
          <p className={TEXT.prose}>{statusContent.description}</p>
        </header>

        <ol aria-label="인증 진행 단계" className="grid grid-cols-3 gap-3">
          {['서류 제출', '서류 심사', '인증 완료'].map((label, index) => (
            <li
              key={label}
              aria-current={index === statusContent.step ? 'step' : undefined}
              className="flex flex-col gap-3"
            >
              <div
                className={cn(
                  'h-1 rounded-full',
                  index <= statusContent.step ? 'bg-primary-500' : 'bg-neutral-150',
                )}
              />
              <p
                className={cn(
                  'text-body-sm tab:text-body-md',
                  index === statusContent.step
                    ? 'font-semibold text-primary-700'
                    : 'font-medium text-neutral-500',
                )}
              >
                <span className="mr-2">{index + 1}</span>
                {label}
              </p>
            </li>
          ))}
        </ol>

        {displayRejectionReason && (
          <section className="rounded-xl bg-error-50 p-5" aria-label="서류 보완 안내">
            <h2 className="mb-2 flex items-center gap-2 text-body-md font-semibold text-error-600">
              <AlertCircleIcon className="size-5 shrink-0" />이 부분을 보완해주세요
            </h2>
            <p className="text-body-md leading-relaxed whitespace-pre-wrap text-neutral-700">
              {displayRejectionReason}
            </p>
          </section>
        )}

        <section aria-labelledby="verification-documents">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id="verification-documents" className={TEXT.section}>
              인증 서류
            </h2>
            <span className={TEXT.meta}>이미지 또는 PDF</span>
          </div>
          <div className="flex flex-col gap-4">
            {DOCUMENT_FIELDS.map(({ type, label }) => {
              const existing = getExisting(type)
              const selectedFileName =
                files[type]?.name ?? existing?.originalFileName ?? existing?.fileName
              const existingImageUrl =
                existing && isImageFile(existing.originalFileName ?? existing.fileName)
                  ? existing.url
                  : undefined
              const previewUrl = localPreviews[type] ?? existingImageUrl
              return (
                <DocumentFilePicker
                  key={type}
                  label={label}
                  selectedFileName={selectedFileName}
                  previewUrl={previewUrl}
                  disabled={isSubmitting || !canEdit}
                  onFileSelect={handleFileSelect(type)}
                />
              )
            })}
          </div>
          <p className={cn(TEXT.meta, 'mt-4')}>
            서류의 글자와 사진이 선명하게 보이도록 등록해주세요.
          </p>
        </section>
      </div>

      {canEdit && (
        <div className="fixed inset-x-0 bottom-0 z-sticky border-t border-neutral-100 bg-white pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-4 tab:px-8">
            <p className="hidden text-body-md text-neutral-500 tab:block">
              {isSubmitting ? '서류를 제출하고 있어요.' : '등록한 서류를 확인하고 제출해주세요.'}
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full tab:w-48"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || !hasAnyDocument}
            >
              {isSubmitting ? '제출 중…' : needsRevision ? '보완 서류 제출하기' : '서류 제출하기'}
            </Button>
          </div>
          {toast.current && (
            <Container className="absolute inset-x-0 bottom-[5rem]">
              <AlertMessage
                status={toast.current.status}
                size="responsive"
                icon={toast.current.status === 'error' ? AlertCircleIcon : CheckIcon}
                message={toast.current.message}
                onClose={toast.hide}
              />
            </Container>
          )}
        </div>
      )}
    </div>
  )
}

export { VerificationContent }
