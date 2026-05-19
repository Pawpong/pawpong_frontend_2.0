'use client'

interface PostTextAreaProps {
  value: string
  onChange: (value: string) => void
}

const PostTextArea = ({ value, onChange }: PostTextAreaProps) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="입력하세요"
      className="h-[11.875rem] w-full resize-none rounded-2xl border border-[#a8a8a8] bg-white px-5 py-[0.938rem] text-base font-medium leading-[1.375rem] text-text-primary placeholder:text-text-primary focus:outline-none"
    />
  )
}

export { PostTextArea }
