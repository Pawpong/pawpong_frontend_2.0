import { Controller, type Control, type FieldPath } from 'react-hook-form'
import { CheckboxIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/Cn'
import type { ApplicationFormValues } from '../_lib/schema'

const FormSection = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-[0.375rem] tab:gap-[1.125rem]">
    <p className="text-[0.875rem] font-bold leading-[1.5] text-[#5d5d5d] tab:text-[1rem]">
      {title}
    </p>
    {children}
  </div>
)

const ReadonlyInput = ({ value }: { value: string }) => (
  <div className="rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem]">
    <p className="text-[0.875rem] font-medium leading-[1.375rem] text-[#5d5d5d] tab:text-[1rem]">
      {value}
    </p>
  </div>
)

const CheckboxField = ({
  control,
  name,
  label,
}: {
  control: Control<ApplicationFormValues>
  name: FieldPath<ApplicationFormValues>
  label: string
}) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <button
        type="button"
        onClick={() => field.onChange(!field.value)}
        className="flex items-start gap-[0.75rem] rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-left tab:rounded-[1rem] tab:px-[1.25rem] tab:py-[0.9375rem]"
      >
        <CheckboxIcon
          checked={!!field.value}
          className={cn(
            'size-[1.5rem] shrink-0',
            field.value ? 'text-[#5d5d5d]' : 'text-[#a8a8a8]',
          )}
        />
        <span className="text-[0.875rem] font-medium leading-[1.375rem] text-[#5d5d5d] tab:text-[1rem]">
          {label}
        </span>
      </button>
    )}
  />
)

export { FormSection, ReadonlyInput, CheckboxField }
