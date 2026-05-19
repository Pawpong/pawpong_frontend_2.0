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
        <Avatar size="xs" className="ring-[3px] ring-[#f5f5f5]">
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
    <div className="overflow-hidden rounded-2xl bg-[#f5f5f5]">
      {/* Content Area */}
      <div className="flex items-stretch px-10 pt-8">
        {/* Left: Text Info */}
        <div className="flex flex-1 flex-col">
          {/* Badges */}
          <div className="flex items-center gap-3">
            {profile.badges.map((badge) => (
              <Badge key={badge} variant="outline">
                {badge}
              </Badge>
            ))}
          </div>

          {/* Nickname */}
          <p className="mt-[0.804rem] text-2xl font-semibold leading-[1.375rem] text-[#5d5d5d]">
            {profile.nickname}
          </p>

          {/* Bio */}
          <p className="mt-3 max-w-[26.1rem] text-sm font-medium leading-[1.375rem] text-[#5d5d5d]">
            {profile.bio}
          </p>
        </div>

        {/* Middle: Follower — bottom-aligned */}
        <div className="flex shrink-0 flex-col justify-end">
          <div className="flex items-center gap-2.5 p-2.5">
            <FollowerAvatarGroup />
            <span className="text-sm font-medium text-[#5d5d5d]">
              팔로워 {profile.followerCount}
            </span>
          </div>
        </div>

        {/* Right: Avatar */}
        <div className="shrink-0 pl-2.5">
          <Avatar size="lg">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.nickname} />
            ) : (
              <AvatarFallback className="bg-[#d4d4d4]" />
            )}
          </Avatar>
        </div>
      </div>

      {/* Separator — full width */}
      <div className="my-5 h-px w-full bg-[color:color(display-p3_0.7777_0.7777_0.7777)]" />

      {/* Profile Edit Button */}
      <div className="pb-[1.275rem] pl-[4.9375rem] pr-[8.5rem]">
        <button
          type="button"
          className="flex h-10 w-full items-center justify-center rounded-full bg-[#d4d4d4] p-2.5 text-sm font-medium text-white"
        >
          프로필 편집
        </button>
      </div>
    </div>
  )
}

export { ProfileCard }
