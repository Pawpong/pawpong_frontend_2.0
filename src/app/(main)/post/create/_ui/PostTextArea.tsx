'use client'

interface PostTextAreaProps {
  ref?: React.Ref<HTMLTextAreaElement>
  value: string
  onChange: (value: string) => void
}

const PostTextArea = ({ ref, value, onChange }: PostTextAreaProps) => {
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="귀여운 동물을 자랑해보세요"
      className="h-[5.125rem] w-full resize-none rounded-[0.375rem] border border-[#a8a8a8] bg-white p-[0.625rem] text-sm font-medium leading-[1.375rem] text-text-primary placeholder:text-text-primary focus:outline-none tab:h-[11.875rem] tab:rounded-2xl tab:px-5 tab:py-[0.938rem] tab:text-base"
    />
  )
}

export { PostTextArea }
