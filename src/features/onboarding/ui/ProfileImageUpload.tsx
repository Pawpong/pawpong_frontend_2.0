import { ImageIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

interface ProfileImageUploadProps {
  className?: string
}

const ProfileImageUpload = ({ className }: ProfileImageUploadProps) => (
  <div className={cn(className)}>
    <button
      type="button"
      className="flex size-[5rem] items-center justify-center rounded-full bg-[#6b6b6b] tab:size-[6.25rem]"
    >
      <ImageIcon className="size-[2.5rem] text-white tab:size-[3.5rem]" />
    </button>
  </div>
)

export { ProfileImageUpload }
