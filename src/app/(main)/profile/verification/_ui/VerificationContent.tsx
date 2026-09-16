'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { breederQueries } from '@/entities/breeder'
import { useSubmitVerificationDocuments, useUploadVerificationDocuments } from '@/features/breeder'
import { normalizeApiError } from '@/shared/api'
import { useToast } from '@/shared/lib/useToast'
import { AlertCircleIcon, CheckIcon } from '@/shared/assets'
import {
  AlertMessage,
  AsyncState,
  Badge,
  Button,
  Container,
  DocumentFilePicker,
  FooterCtaBar,
} from '@/shared/ui'
import type { BreederUploadDocumentType } from '@/shared/types'

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

const STATUS_LABEL: Record<string, string> = {
  not_submitted: '아직 제출하지 않았어요',
  pending: '제출 완료 · 심사 대기 중',
  reviewing: '심사 중이에요',
  approved: '인증 완료',
  rejected: '반려됨',
}

const VerificationContent = () => {
  const toast = useToast()
  const profileQuery = useQuery({ ...breederQueries.myProfile(), refetchOnMount: 'always' })
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

  return (
    <div className="flex w-full flex-col">
      <Container className="flex flex-col gap-6 px-4 pt-8 pb-[7.5rem] tab:px-20">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-neutral-850 tab:text-base">브리더 인증 서류</p>
          <Badge
            variant={verification.status === 'approved' ? 'primaryFilled' : 'default'}
            size="md"
            className="w-fit"
          >
            {STATUS_LABEL[verification.status]}
          </Badge>
          {verification.status === 'rejected' && verification.rejectionReason && (
            <p className="text-sm leading-[1.5] font-medium text-error-600">
              반려 사유: {verification.rejectionReason}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
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
                disabled={isSubmitting}
                onFileSelect={handleFileSelect(type)}
              />
            )
          })}
        </div>
      </Container>

      <FooterCtaBar
        primary={{
          label: isSubmitting ? '제출 중...' : '제출하기',
          onClick: () => void handleSubmit(),
          disabled: isSubmitting || !hasAnyDocument,
        }}
      >
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
      </FooterCtaBar>
    </div>
  )
}

export { VerificationContent }
