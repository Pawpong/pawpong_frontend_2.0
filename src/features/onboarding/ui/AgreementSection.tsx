'use client'

import { useState } from 'react'
import { Controller, useWatch, type Control, type UseFormSetValue } from 'react-hook-form'
import type { Terms, TermsCode } from '@/shared/types'
import { PolicyModal } from '@/shared/ui'
import type { ProfileFormData } from '../model/schema'
import { AGREEMENTS } from '../model/agreements'
import type { Policy } from '../model/policyContent'
import { CheckboxField } from './CheckboxField'

interface AgreementSectionProps {
  control: Control<ProfileFormData>
  setValue: UseFormSetValue<ProfileFormData>
  activeTerms?: Terms[]
}

const AgreementSection = ({ control, setValue, activeTerms }: AgreementSectionProps) => {
  const [openPolicy, setOpenPolicy] = useState<Policy | null>(null)
  const [serviceAgreed, privacyAgreed, marketingAgreed, isOver14] = useWatch({
    control,
    name: ['serviceAgreed', 'privacyAgreed', 'marketingAgreed', 'isOver14'],
  })
  const allAgreementsChecked = serviceAgreed && privacyAgreed && marketingAgreed && isOver14

  const resolvePolicy = (code: TermsCode, fallback: Policy | null): Policy | null => {
    const terms = activeTerms?.find((item) => item.code === code)
    return terms ? { title: terms.title, content: terms.body } : fallback
  }

  const handleToggleAll = () => {
    const nextValue = !allAgreementsChecked
    setValue('serviceAgreed', nextValue)
    setValue('privacyAgreed', nextValue)
    setValue('marketingAgreed', nextValue)
    setValue('isOver14', nextValue)
  }

  return (
    <>
      <div className="flex w-full flex-col gap-10">
        <div className="flex flex-col gap-4">
          <CheckboxField
            label="전체 약관동의"
            checked={allAgreementsChecked}
            onCheckedChange={handleToggleAll}
          />

          {AGREEMENTS.map((agreement) => {
            const policy = resolvePolicy(agreement.code, agreement.fallback)
            return (
              <Controller
                key={agreement.id}
                name={agreement.id}
                control={control}
                render={({ field }) => (
                  <CheckboxField
                    label={agreement.label}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    hasDetailLink={!!policy}
                    onDetailClick={() => setOpenPolicy(policy)}
                  />
                )}
              />
            )
          })}
        </div>

        <Controller
          name="isOver14"
          control={control}
          render={({ field }) => (
            <CheckboxField
              label="본인은 만 14세 이상입니다."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      {openPolicy && (
        <PolicyModal
          open
          onOpenChange={(open) => !open && setOpenPolicy(null)}
          title={openPolicy.title}
          content={openPolicy.content}
        />
      )}
    </>
  )
}

export { AgreementSection }
