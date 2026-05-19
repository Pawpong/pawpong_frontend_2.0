'use client'

import { Avatar, AvatarFallback, AvatarImage, Badge } from '@/shared/ui'
import type { MyHomeProfile } from '@/shared/mocks/myHome'

interface ProfileCardProps {
  profile: MyHomeProfile
}

const FOLLOWER_AVATARS = [
  { id: 1, imageUrl: '' },
  { id: 2, imageUrl: '' },
  { id: 3, imageUrl: '' },
]

const FollowerAvatarGroup = () => (
  <div className="flex items-center">
    {FOLLOWER_AVATARS.map((follower, i) => (
      <div key={follower.id} className={i > 0 ? '-ml-[0.55rem]' : ''}>
        <Avatar size="xs" className="ring-[3px] ring-white tab:ring-[#f5f5f5]">
          {follower.imageUrl ? (
            <AvatarImage src={follower.imageUrl} alt="팔로워" />
          ) : (
            <AvatarFallback className="bg-[#d9d9d9]" />
          )}
        </Avatar>
      </div>
    ))}
  </div>
)

const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <div className="tab:overflow-hidden tab:rounded-2xl tab:bg-[#f5f5f5]">
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
          <p className="text-base font-bold text-[#5d5d5d] tab:mt-[0.804rem] tab:text-2xl tab:font-semibold tab:leading-[1.375rem]">
            {profile.nickname}
          </p>
        </div>

        {/* Middle: Follower — desktop only */}
        <div className="hidden shrink-0 flex-col justify-end tab:flex">
          <div className="flex items-center gap-2.5 p-2.5">
            <FollowerAvatarGroup />
            <span className="text-sm font-medium text-[#5d5d5d]">
              팔로워 {profile.followerCount}
            </span>
          </div>
        </div>

        {/* Right: Avatar */}
        <div className="shrink-0 tab:pl-2.5">
          <Avatar size="lg" className="size-[4.0625rem] tab:h-[7.3125rem] tab:w-[7.4375rem]">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.nickname} />
            ) : (
              <AvatarFallback className="bg-[#d4d4d4]" />
            )}
          </Avatar>
        </div>
      </div>

      {/* Bio — mobile: below profile row */}
      <p className="mt-[1.097rem] text-sm font-medium leading-[1.375rem] text-[#5d5d5d] tab:hidden">
        {profile.bio}
      </p>

      {/* Bio — desktop: inside content area (handled by original layout) */}
      <div className="hidden tab:block tab:px-10">
        <p className="mt-3 max-w-[26.1rem] text-sm font-medium leading-[1.375rem] text-[#5d5d5d]">
          {profile.bio}
        </p>
      </div>

      {/* Follower — mobile: centered */}
      <div className="mt-[0.513rem] flex items-center gap-2.5 p-2.5 tab:hidden">
        <FollowerAvatarGroup />
        <span className="text-xs font-medium text-[#5d5d5d]">
          팔로워 {profile.followerCount}
        </span>
      </div>

      {/* Separator — desktop only */}
      <div className="my-5 hidden h-px w-full bg-[color:color(display-p3_0.7777_0.7777_0.7777)] tab:block" />

      {/* Profile Edit Button */}
      <div className="flex justify-center pt-[0.7rem] pb-[1.854rem] tab:justify-start tab:pb-[1.275rem] tab:pl-[4.9375rem] tab:pr-[8.5rem]">
        <button
          type="button"
          className="flex h-10 w-[16.4375rem] items-center justify-center rounded-full bg-[#d4d4d4] p-2.5 text-sm font-medium text-white tab:w-full"
        >
          프로필 편집
        </button>
      </div>
    </div>
  )
}

export { ProfileCard }
