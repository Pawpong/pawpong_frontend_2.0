'use client'

interface PostFormTextAreaProps {
  ref?: React.Ref<HTMLTextAreaElement>
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const PostFormTextArea = ({
  ref,
  value,
  onChange,
  placeholder = '입력하세요',
}: PostFormTextAreaProps) => {
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-[5.125rem] w-full resize-none rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-sm leading-[1.375rem] font-medium text-text-primary placeholder:text-text-primary focus:outline-none tab:h-[11.875rem] tab:rounded-2xl tab:px-5 tab:py-[0.938rem] tab:text-base"
    />
  )
}

export { PostFormTextArea }
