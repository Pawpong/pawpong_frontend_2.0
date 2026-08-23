import Image from 'next/image'
import { cn } from '@/shared/lib/cn'

interface CommunityAvatarProps {
  src?: string
  alt: string
  /** Figma Avatar 컴포넌트 사이즈 — medium 40px / xsmall 24px */
  size?: 'medium' | 'xsmall'
  className?: string
}

const SIZE = {
  medium: 'size-10',
  xsmall: 'size-6',
} as const

/**
 * 최은진: 신규 파일 — 커뮤니티 피드 카드용 아바타 컴포넌트.
 * 사진이 없을 때 보여줄 발바닥 아바타 — Figma "Avatar" 컴포넌트(node 3612:639545) 그대로.
 * 배경 원(#EDEDED)과 발바닥 글리프(#A6A6A6)가 하나의 SVG로 묶여 있어서, 그대로 옮겼다.
 * (shared/assets/icons의 픽셀 스타일 PawIcon과는 다른, 이 화면 전용의 둥근 발바닥 모양이다.)
 */
const AvatarFallback = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="20" fill="#EDEDED" />
    <path
      d="M17.6479 30.7437H12.9429V29.0786H17.6479V30.7437ZM27.0581 29.0786V30.7437H22.353V29.0786H27.0581ZM22.353 19.0884H23.9214V20.7534H25.4897V22.4185H27.0581V24.0835H28.6265V29.0786H27.0581V29.0776H22.353V29.0786H17.6479V29.0776H12.9429V29.0786H11.3745V24.0835H12.9429V22.4185H14.5112V20.7534H16.0796V19.0884H17.6479V17.4233H22.353V19.0884ZM11.3745 15.3364H12.812V19.897H11.3745V21.4175H8.49854V19.897H7.06104V15.3364H8.49854V13.8169H11.3745V15.3364ZM31.5015 15.3364H32.939V19.897H31.5015V21.4175H28.6265V19.897H27.189V15.3364H28.6265V13.8169H31.5015V15.3364ZM17.8433 10.7769H19.2817V15.3364H17.8442V13.7319H17.8433V16.8569H14.9683V15.3364H13.5308V10.7769H14.9683V9.25635H17.8433V10.7769ZM25.0317 10.7769H26.4702V15.3364H25.0317V16.8569H22.1567V15.3364H20.7192V10.7769H22.1567V9.25635H25.0317V10.7769Z"
      fill="#A6A6A6"
    />
  </svg>
)

/**
 * 커뮤니티 페이지 전용 아바타. shared/ui의 ProfileAvatar와 겉모습은 비슷하지만,
 * 커뮤니티 화면은 이 컴포넌트에만 의존하도록 별도로 둔다 — shared/ui가 다른 화면
 * 사정으로 바뀌어도 커뮤니티 카드는 영향받지 않는다.
 */
const CommunityAvatar = ({ src, alt, size = 'medium', className }: CommunityAvatarProps) => {
  const box = SIZE[size]

  if (src) {
    return (
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-full bg-neutral-100',
          box,
          className,
        )}
      >
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    )
  }

  return <AvatarFallback className={cn('shrink-0', box, className)} />
}

export { CommunityAvatar }
