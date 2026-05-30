import { ImageIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/Cn'

interface ProfileImageUploadProps {
  className?: string
}

const ProfileImageUpload = ({ className }: ProfileImageUploadProps) => (
  <div className={cn('mt-[2.09rem] tab:mt-[6.343rem]', className)}>
    <button
      type="button"
      className="flex h-[8.9375rem] w-[9.1875rem] items-center justify-center rounded-full bg-[#d4d4d4]"
    >
      <ImageIcon className="size-[3.5rem] text-white" />
    </button>
  </div>
)

export { ProfileImageUpload }
