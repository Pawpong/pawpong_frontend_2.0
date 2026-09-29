import { CameraIcon } from '@/shared/assets'
import { buttonVariants } from './Button'

/** Content inside a photo-picker button; the parent owns the interaction. */
export function PhotoSelectPrompt({ title, description }: { title: string; description: string }) {
  return (
    <>
      <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-white text-primary-500">
        <CameraIcon aria-hidden="true" className="size-8" />
      </span>
      <span className="text-base font-semibold text-primary-700">{title}</span>
      <span className="text-sm font-normal text-neutral-700">{description}</span>
      <span className={buttonVariants()}>사진 선택하기</span>
    </>
  )
}
