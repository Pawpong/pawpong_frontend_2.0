import type { ReactNode } from 'react'
import { useId } from 'react'
import { ComposerSectionHeading } from '@/shared/ui/ComposerLayout'

interface FormSectionProps {
  title: string
  children: ReactNode
  description?: string
  step?: number
  required?: boolean
}

/** 작성·수정 화면에서 공유하는 정보 그룹. */
const FormSection = ({ title, description, step = 1, required, children }: FormSectionProps) => {
  const id = useId()
  return (
    <section aria-labelledby={id} className="min-w-0 rounded-2xl bg-white p-5 tab:p-8">
      <ComposerSectionHeading id={id} step={step} required={required}>
        {title}
      </ComposerSectionHeading>
      {description && (
        <p className="mb-6 text-sm leading-relaxed text-neutral-700">{description}</p>
      )}
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  )
}

export { FormSection }
