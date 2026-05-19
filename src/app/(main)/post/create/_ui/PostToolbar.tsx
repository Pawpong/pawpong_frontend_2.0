import { EmojiIcon, LocationIcon } from '@/shared/assets/icons'

const PostToolbar = () => {
  return (
    <div className="inline-flex items-center gap-5 rounded-full border border-[#d3d3d3] px-5 py-[0.625rem]">
      <button type="button" aria-label="이모지 추가">
        <EmojiIcon className="size-6 text-text-primary" />
      </button>
      <button type="button" aria-label="위치 추가">
        <LocationIcon className="size-6 text-text-primary" />
      </button>
    </div>
  )
}

export { PostToolbar }
