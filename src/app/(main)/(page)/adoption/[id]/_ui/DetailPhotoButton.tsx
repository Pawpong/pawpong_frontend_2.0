import { CardImage } from '@/shared/ui'

interface DetailPhotoButtonProps {
  src?: string
  alt: string
  sizes: string
  onClick?: () => void
}

// [refactored] 부모 정보·사육 환경이 같이 쓰는 정사각 사진 버튼 — 누르면 호출부가 사진 뷰어를 연다
const DetailPhotoButton = ({ src, alt, sizes, onClick }: DetailPhotoButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className="relative aspect-square w-full overflow-hidden rounded-lg bg-point-50 focus-ring-inset"
  >
    <CardImage src={src} alt={alt} sizes={sizes} />
  </button>
)

export { DetailPhotoButton }
