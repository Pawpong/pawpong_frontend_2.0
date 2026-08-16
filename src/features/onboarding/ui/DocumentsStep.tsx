'use client'

import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { useStepForm } from '../model/useStepForm'
import { useBreederSignup } from '../model/useBreederSignup'
import { documentsSchema } from '../model/schema'
import { PolicyModal } from '@/shared/ui'
import { POLICIES } from '../model/policyContent'
import { StepContainer } from './StepContainer'
import { DocumentUploadButton } from './DocumentUploadButton'
import { CheckboxField } from './CheckboxField'
import { BREEDER_DOCUMENT_FIELDS } from '../model/breederDocuments'

const DocumentsStep = () => {
  // 브리더 플로우의 마지막 데이터 단계 — 서류 업로드 + 가입 호출은 useBreederSignup 이 담당한다
  const { submit, isPending, error } = useBreederSignup()
  const [pledgeOpen, setPledgeOpen] = useState(false)

  const { control, handleSubmit, watch, setValue, firstErrorMessage, goBack } = useStepForm(
    'documents',
    documentsSchema,
    {
      idDocument: undefined,
      registrationCert: undefined,
      breederAgreed: false,
    },
  )

  const idDocument = watch('idDocument')
  const registrationCert = watch('registrationCert')

  return (
    <StepContainer
      title="브리더 정보를 입력해주세요"
      onNext={() => handleSubmit(submit)()}
      onBack={goBack}
      nextLabel={isPending ? '가입 중...' : '다음'}
      nextDisabled={isPending}
      navError={firstErrorMessage ?? error ?? undefined}
    >
      {/* 서류 영역 — 행 간격 spacing/16 (Figma 3134-343522) */}
      <div className="flex w-full flex-col gap-4">
        {BREEDER_DOCUMENT_FIELDS.map(({ field, label }) => {
          const selectedFile = field === 'idDocument' ? idDocument : registrationCert
          return (
            <DocumentUploadButton
              key={field}
              label={label}
              selectedFileName={selectedFile?.name}
              onFileSelect={(file) => setValue(field, file)}
            />
          )
        })}

        <Controller
          name="breederAgreed"
          control={control}
          render={({ field }) => (
            <CheckboxField
              label="(필수) 브리더 입점 서약서"
              checked={field.value}
              onCheckedChange={field.onChange}
              hasDetailLink
              onDetailClick={() => setPledgeOpen(true)}
              className="mt-4"
            />
          )}
        />
      </div>

      <PolicyModal
        open={pledgeOpen}
        onOpenChange={setPledgeOpen}
        title={POLICIES.breederPledge.title}
        content={POLICIES.breederPledge.content}
      />
    </StepContainer>
  )
}

export { DocumentsStep }
