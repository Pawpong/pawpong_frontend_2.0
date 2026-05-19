'use client'

import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, Badge } from '@/shared/ui'
import type { AvatarItem } from '@/shared/ui'
import { cn } from '@/shared/lib/Cn'
import type { MyHomeProfile } from '@/shared/mocks/myHome'

interface ProfileCardProps {
  profile: MyHomeProfile
}

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
  <div className={cn('flex items-center gap-2.5 p-2.5', className)}>
    <AvatarGroup avatars={FOLLOWER_AVATARS} ringClassName="ring-[3px] ring-white tab:ring-surface-primary" />
    <span className={cn('font-medium text-text-primary', textClassName)}>
      팔로워 {followerCount}
    </span>
  </div>
)

const Bio = ({
  text,
  className,
}: {
  text: string
  className?: string
}) => (
  <p className={cn('text-sm font-medium leading-[1.375rem] text-text-primary', className)}>
    {text}
  </p>
)

const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <div className="tab:overflow-hidden tab:rounded-2xl tab:bg-surface-primary">
      {/* Content Area */}
      <div className="flex items-end justify-between pt-[0.659rem] tab:items-stretch tab:px-10 tab:pt-8">
        {/* Left: Text Info */}
        <div className="flex flex-col gap-2 tab:flex-1 tab:gap-0">
          {/* Badges */}
          <div className="flex items-center gap-1 tab:gap-3">
            {profile.badges.map((badge) => (
              <Badge key={badge} variant="outline" className="h-6 text-xs leading-[1.375rem] tab:text-sm">
                {badge}
              </Badge>
            ))}
          </div>

          {/* Nickname */}
          <p className="text-base font-bold text-text-primary tab:mt-[0.804rem] tab:text-2xl tab:font-semibold tab:leading-[1.375rem]">
            {profile.nickname}
          </p>
        </div>

        {/* Middle: Follower — desktop only */}
        <div className="hidden shrink-0 flex-col justify-end tab:flex">
          <FollowerSection followerCount={profile.followerCount} textClassName="text-sm" />
        </div>

        {/* Right: Avatar */}
        <div className="shrink-0 tab:pl-2.5">
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

      {/* Bio — desktop */}
      <div className="hidden tab:block tab:px-10">
        <Bio text={profile.bio} className="mt-3 max-w-[26.1rem]" />
      </div>

      {/* Follower — mobile */}
      <FollowerSection
        followerCount={profile.followerCount}
        className="mt-[0.513rem] tab:hidden"
        textClassName="text-xs"
      />

      {/* Separator — desktop only */}
      <div className="my-5 hidden h-px w-full bg-border-light tab:block" />

      {/* Profile Edit Button */}
      <div className="flex justify-center pt-[0.7rem] pb-[1.854rem] tab:justify-start tab:pb-[1.275rem] tab:pl-[4.9375rem] tab:pr-[8.5rem]">
        <button
          type="button"
          className="flex h-10 w-[16.4375rem] items-center justify-center rounded-full bg-fill-muted p-2.5 text-sm font-medium text-white tab:w-full"
        >
          프로필 편집
        </button>
      </div>
    </div>
  )
}

export { ProfileCard }
