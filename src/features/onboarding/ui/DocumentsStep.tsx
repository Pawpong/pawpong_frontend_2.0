'use client'

import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { useStepForm } from '../model/useStepForm'
import { useBreederSignup } from '../model/useBreederSignup'
import { documentsSchema } from '../model/schema'
import { PolicyModal } from '@/shared/ui'
import { POLICIES } from '../model/policyContent'
import { cn } from '@/shared/lib/cn'
import { STEP_LAYOUT } from '../model/stepLayout'
import { StepContainer } from './StepContainer'
import { DocumentUploadButton } from './DocumentUploadButton'
import { CheckboxField } from './CheckboxField'
import { FieldError } from './FieldError'
import { BREEDER_DOCUMENT_FIELDS } from '../model/breederDocuments'

const DocumentsStep = () => {
  // 브리더 플로우의 마지막 데이터 단계 — 서류 업로드 + 가입 호출은 useBreederSignup 이 담당한다
  const { submit, isPending, error } = useBreederSignup()
  const [pledgeOpen, setPledgeOpen] = useState(false)

  const { control, handleSubmit, watch, setValue, goBack } = useStepForm(
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
      title="인증 서류를 등록해주세요"
      subtitle="브리더 활동 확인에 필요한 서류예요. 준비된 서류부터 등록할 수 있어요."
      onNext={() => handleSubmit(submit)()}
      onBack={goBack}
      nextLabel={isPending ? '가입 중…' : '가입 완료하기'}
      nextDisabled={isPending}
      navError={error ?? undefined}
    >
      <p className="w-full rounded-xl bg-secondary-50 p-4 text-body-md text-neutral-700">
        서류 첨부는 선택사항이에요.
        <br />
        JPG, PNG, WEBP 또는 PDF 파일을 등록해주세요.
        <br />
        브리더 입점 서약 동의는 필수예요.
      </p>
      {/* 서류 영역 — 행 간격 spacing/16 (Figma 3134-343522) */}
      <div className={cn('flex w-full flex-col', STEP_LAYOUT.fieldGap)}>
        {BREEDER_DOCUMENT_FIELDS.map(({ field, label }) => {
          const selectedFile = field === 'idDocument' ? idDocument : registrationCert
          return (
            <DocumentUploadButton
              key={field}
              label={`${label} (선택)`}
              selectedFileName={selectedFile?.name}
              onFileSelect={(file) => setValue(field, file)}
            />
          )
        })}

        <Controller
          name="breederAgreed"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <CheckboxField
                label="(필수) 브리더 입점 서약서"
                checked={field.value}
                onCheckedChange={field.onChange}
                hasDetailLink
                onDetailClick={() => setPledgeOpen(true)}
                className="mt-4"
              />
              <FieldError message={fieldState.error?.message} />
            </div>
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
