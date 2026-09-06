'use client'

import { AlertCircleIcon } from '@/shared/assets'
import { AlertMessage, Container, ExitConfirmModal, NavigationBar } from '@/shared/ui'
import type { ApplicationDetailDto } from '@/shared/types'
import {
  LabeledField,
  CountedTextareaField,
  CheckboxField,
  FooterCtaBar,
} from '@/app/(main)/adoption/[id]/apply/_ui/FormFields'
import {
  ADOPTION_PLAN_FIELD,
  ALL_FAMILY_CONSENT_LABEL,
  CONSENT_CHECKS,
  CONSENT_CHECKS_TITLE,
  FAMILY_MEMBERS_FIELD,
} from '@/app/(main)/adoption/[id]/apply/_lib/constants'
import { useEditApplicationForm } from '../_lib/useEditApplicationForm'

interface EditApplicationFormFieldsProps {
  applicationId: string
  detail: ApplicationDetailDto
}

const EditApplicationFormFields = ({ applicationId, detail }: EditApplicationFormFieldsProps) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    isValid,
    isPending,
    showGuard,
    confirmExit,
    cancelExit,
    handleCloseClick,
    onSubmit,
    toast,
  } = useEditApplicationForm(applicationId, detail)

  return (
    <div>
      <div className="sticky top-12 z-sticky tab:top-14">
        <NavigationBar title="신청서 수정" icon="close" onBack={handleCloseClick} />
        <Container className="border-b border-neutral-150 bg-white px-4 py-3">
          <p className="text-sm font-medium text-neutral-700">
            {detail.breederName} · {detail.petName || '입양 상담 신청'}
          </p>
        </Container>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Container className="px-4 pt-8 pb-32 tab:pb-28">
          <div className="mx-auto max-w-[55rem]">
            <div className="flex flex-col gap-10 tab:rounded-xl tab:bg-point-50 tab:p-10">
              <CountedTextareaField {...ADOPTION_PLAN_FIELD} register={register} watch={watch} />

              <LabeledField title={CONSENT_CHECKS_TITLE} size="lg" gap="gap-5">
                <div className="flex flex-col gap-3">
                  {CONSENT_CHECKS.map(({ name, label }) => (
                    <CheckboxField key={name} control={control} name={name} label={label} />
                  ))}
                </div>
              </LabeledField>

              <CountedTextareaField {...FAMILY_MEMBERS_FIELD} register={register} watch={watch} />

              <CheckboxField
                control={control}
                name="allFamilyConsent"
                label={ALL_FAMILY_CONSENT_LABEL}
              />
            </div>
          </div>
        </Container>

        <FooterCtaBar
          onCancel={handleCloseClick}
          isValid={isValid}
          isPending={isPending}
          cancelLabel="취소"
          cancelLabelPc="취소"
          submitLabel="수정 완료"
          submitLabelTab="수정 완료"
          submitLabelPc="수정 완료"
          pendingLabel="저장 중..."
        >
          {toast.current && (
            <AlertMessage
              status="error"
              size="responsive"
              icon={AlertCircleIcon}
              message={toast.current.message}
              onClose={toast.hide}
            />
          )}
        </FooterCtaBar>
      </form>

      <ExitConfirmModal
        open={showGuard}
        onClose={cancelExit}
        onConfirm={confirmExit}
        title="신청서 수정을 그만두시나요?"
      />
    </div>
  )
}

export { EditApplicationFormFields }
