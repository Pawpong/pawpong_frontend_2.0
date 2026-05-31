import { AttachmentIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

interface DocumentUploadButtonProps {
  label: string
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  className?: string
}

const DocumentUploadButton = ({
  label,
  variant = 'primary',
  onClick,
  className,
}: DocumentUploadButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex w-full items-center gap-[0.75rem] rounded-[1rem] px-[1.25rem] py-[0.9375rem]',
      variant === 'primary'
        ? 'h-[3.5625rem] bg-[#a8a8a8] tab:h-[4.375rem]'
        : 'h-[3.625rem] bg-[#d5d5d5] tab:h-[4.375rem]',
      className,
    )}
  >
    <AttachmentIcon className="size-[1.5rem] shrink-0 text-white" />
    <span className="text-[1rem] leading-[1.375rem] font-semibold text-white">{label}</span>
  </button>
)

export { DocumentUploadButton }
