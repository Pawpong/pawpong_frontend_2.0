interface FormFieldLabelProps {
  label: string
  required?: boolean
  hint?: string
}

const FormFieldLabel = ({ label, required = false, hint }: FormFieldLabelProps) => {
  return (
    <div className="flex gap-1.5 text-text-primary tab:gap-2">
      <span className="text-sm leading-[1.5] font-bold tab:text-base">{label}</span>
      {hint && (
        <span className="text-xs leading-[1.375rem] font-medium tab:text-base tab:leading-[1.5]">
          {hint}
        </span>
      )}
      {!hint && (
        <span className="text-xs leading-[1.375rem] font-medium tab:text-base tab:leading-[1.5] tab:font-medium">
          {required ? '필수' : '선택'}
        </span>
      )}
    </div>
  )
}

export { FormFieldLabel }
