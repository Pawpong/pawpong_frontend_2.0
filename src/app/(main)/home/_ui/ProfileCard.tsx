'use client'

import type { ComponentType } from 'react'
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, Badge } from '@/shared/ui'
import type { AvatarItem } from '@/shared/ui'
import Image from 'next/image'
import { cn } from '@/shared/lib/Cn'
import { LocationIcon } from '@/shared/assets/icons'
import type { MyHomeProfile, BreederProfile } from '@/shared/mocks/myHome'

type ProfileMode = 'mine' | 'mine-breeder' | 'other' | 'breeder'

interface ProfileCardBaseProps {
  profile: MyHomeProfile
  mode?: 'mine' | 'other'
}

interface ProfileCardBreederProps {
  profile: BreederProfile
  mode: 'breeder' | 'mine-breeder'
}

type ProfileCardProps = ProfileCardBaseProps | ProfileCardBreederProps

const FOLLOWER_AVATARS: AvatarItem[] = [
  { id: 1, imageUrl: '' },
  { id: 2, imageUrl: '' },
  { id: 3, imageUrl: '' },
]

const FollowerSection = ({
  followerCount,
  className,
  textClassName,
}: {
  followerCount: number
  className?: string
  textClassName?: string
}) => (
  <div className={cn('flex items-center gap-2.5 py-2.5 tab:p-2.5', className)}>
    <AvatarGroup
      avatars={FOLLOWER_AVATARS}
      ringClassName="ring-[3px] ring-white tab:ring-surface-primary"
    />
    <span className={cn('font-medium text-text-primary', textClassName)}>
      팔로워 {followerCount}
    </span>
  </div>
)

const Bio = ({ text, className }: { text: string; className?: string }) => (
  <p className={cn('text-sm leading-[1.375rem] font-medium text-text-primary', className)}>
    {text}
  </p>
)

const LocationInfo = ({ location, className }: { location: string; className?: string }) => (
  <div className={cn('flex items-center gap-1.5', className)}>
    <LocationIcon className="size-5 text-text-secondary" />
    <span className="text-sm font-medium text-text-secondary">{location}</span>
  </div>
)

/* ── 공통 버튼 ── */

const FollowButton = ({ className }: { className?: string }) => (
  <button
    type="button"
    className={cn(
      'flex h-10 items-center justify-center rounded-full bg-fill-muted p-2.5 text-sm font-medium text-white',
      className,
    )}
  >
    팔로우
  </button>
)

const MessageButton = ({
  label = '메시지 보내기',
  className,
}: {
  label?: string
  className?: string
}) => (
  <button
    type="button"
    className={cn(
      'flex h-10 items-center justify-center gap-1.5 rounded-full bg-fill-muted p-2.5',
      className,
    )}
  >
    <Image src="/chat.svg" alt="메시지" width={20} height={20} />
    <span className="text-sm leading-[1.375rem] font-semibold text-text-primary">{label}</span>
  </button>
)

const FavoriteButton = ({ className }: { className?: string }) => (
  <button
    type="button"
    className={cn(
      'h-10 items-center justify-center gap-1.5 rounded-full bg-fill-muted p-2.5',
      className,
    )}
  >
    <Image src="/star.svg" alt="즐겨찾기" width={20} height={20} />
    <span className="text-sm leading-[1.375rem] font-semibold text-text-primary">
      즐겨찾기 등록
    </span>
  </button>
)

/* ── mode별 액션 그룹 ── */

const MineActions = () => (
  <div className="flex justify-center pt-[0.7rem] pb-[1.854rem] tab:justify-start tab:pr-[8.5rem] tab:pb-[1.275rem] tab:pl-[4.9375rem]">
    <button
      type="button"
      className="flex h-10 w-[16.4375rem] items-center justify-center rounded-full bg-fill-muted p-2.5 text-sm font-medium text-white tab:w-full"
    >
      프로필 편집
    </button>
  </div>
)

const BreederActions = () => (
  <div className="flex items-center justify-center gap-3 pb-[1.854rem] tab:justify-start tab:gap-3 tab:px-10 tab:pb-[1.275rem]">
    <FavoriteButton className="hidden tab:order-1 tab:flex tab:w-[12.5rem]" />
    <FollowButton className="flex-1 tab:order-3 tab:flex-1" />
    <MessageButton label="상담하기" className="flex-1 tab:order-2 tab:w-[12.5rem] tab:flex-none" />
  </div>
)

const OtherActions = () => (
  <div className="flex items-center justify-center gap-3 pb-[1.854rem] tab:justify-start tab:px-10 tab:pb-[1.275rem]">
    <FollowButton className="w-[9.375rem] tab:order-2 tab:w-auto tab:flex-1" />
    <MessageButton className="w-[8.75rem] tab:order-1 tab:w-[12.5rem]" />
  </div>
)

const ACTION_MAP = {
  mine: MineActions,
  'mine-breeder': MineActions,
  breeder: BreederActions,
  other: OtherActions,
} satisfies Record<ProfileMode, ComponentType>

/* ── ProfileCard ── */

const ProfileCard = ({ profile, mode = 'mine' }: ProfileCardProps) => {
  const Actions = ACTION_MAP[mode]
  const isBreederProfile = mode === 'breeder' || mode === 'mine-breeder'
  const breederLocation = isBreederProfile ? (profile as BreederProfile).location : null

  return (
    <div className="tab:overflow-hidden tab:rounded-2xl tab:bg-surface-primary">
      {/* Content Area */}
      <div className="flex items-end justify-between pt-[0.659rem] tab:items-stretch tab:px-10 tab:pt-8">
        {/* Section 1: Badges + Nickname + Bio */}
        <div className="flex flex-col gap-2 tab:flex-1 tab:gap-0">
          <div className="flex items-center gap-1 tab:gap-3">
            {isBreederProfile && (
              <Badge variant="outline" className="h-6 text-xs leading-[1.375rem] tab:text-sm">
                브리더
              </Badge>
            )}
            {profile.badges.map((badge) => (
              <Badge
                key={badge}
                variant="outline"
                className="h-6 text-xs leading-[1.375rem] tab:text-sm"
              >
                {badge}
              </Badge>
            ))}
          </div>
          <p className="text-base font-bold text-text-primary tab:mt-[0.804rem] tab:text-2xl tab:leading-[1.375rem] tab:font-semibold">
            {profile.nickname}
          </p>
          {/* Location — breeder, mobile only */}
          {isBreederProfile && (
            <LocationInfo location={breederLocation!} className="mt-1 tab:hidden" />
          )}
          <Bio text={profile.bio} className="mt-3 hidden max-w-[26.1rem] tab:block" />
        </div>

        {/* Section 2: Follower — desktop only */}
        <div className="hidden shrink-0 items-end tab:flex">
          <FollowerSection followerCount={profile.followerCount} textClassName="text-sm" />
        </div>

        {/* Section 3: Avatar */}
        <div className="shrink-0">
          <Avatar size="lg" className="size-[4.0625rem] tab:h-[7.3125rem] tab:w-[7.4375rem]">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.nickname} />
            ) : (
              <AvatarFallback className="bg-fill-muted" />
            )}
          </Avatar>
        </div>
      </div>

      {/* Bio — mobile */}
      <Bio text={profile.bio} className="mt-[1.097rem] tab:hidden" />

      {/* Follower — mobile */}
      <FollowerSection
        followerCount={profile.followerCount}
        className="mt-[0.513rem] tab:hidden"
        textClassName="text-xs"
      />

      {/* Location — breeder, desktop only */}
      {isBreederProfile && (
        <LocationInfo location={breederLocation!} className="hidden py-2 tab:flex tab:px-10" />
      )}

      {/* Separator — desktop only */}
      <div className="my-5 hidden h-px w-full bg-border-light tab:block" />

      {/* Action Buttons */}
      <Actions />
    </div>
  )
}

export { ProfileCard }
