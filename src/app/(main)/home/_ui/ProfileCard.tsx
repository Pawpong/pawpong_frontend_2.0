'use client'

import { useState, type ComponentType, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query'
import { Badge, ProfileAvatar, FollowButton, FollowersModal, type FollowUser } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { uniqueBy } from '@/shared/lib/uniqueBy'
import { LocationOnIcon } from '@/shared/assets/icons'
import { profileQueries } from '@/entities/profile'
import { useUnfollowUser, useRemoveFollower } from '@/features/profile'
import type {
  AdopterPublicProfile,
  BreederPublicProfile,
  FollowUserCard,
  PaginationResponse,
} from '@/shared/types'

// 백엔드 FollowUserCard → 모달이 쓰는 FollowUser (맞팔 여부는 두 플래그 조합)
const toFollowUser = (card: FollowUserCard): FollowUser => ({
  id: card.userId,
  nickname: card.nickname,
  profileImageUrl: card.profileImageUrl,
  mutual: card.isFollowing && card.isFollowedBy,
})

// [refactored] 팔로워/팔로잉 두 쿼리가 쓰던 변환·paging 조립을 헬퍼로 (중복 2회 → 1곳)
type FollowListQuery = UseInfiniteQueryResult<InfiniteData<PaginationResponse<FollowUserCard>>>

const toFollowUsers = (query: FollowListQuery): FollowUser[] =>
  // 무한스크롤 페이지 병합 시 user.id 중복 제거 (FollowersModal key 중복 방어)
  uniqueBy(
    (query.data?.pages ?? []).flatMap((page) => page.items.map(toFollowUser)),
    (user) => user.id,
  )

const toPaging = (query: FollowListQuery) => ({
  hasMore: query.hasNextPage,
  isLoadingMore: query.isFetchingNextPage,
  onLoadMore: query.fetchNextPage,
})

type ProfileMode = 'mine' | 'mine-breeder' | 'other' | 'breeder'

// 하단 액션(메시지/상담/팔로우 등)에 공통으로 전달되는 핸들러
interface ProfileActionProps {
  onMessage?: () => void
  isMessagePending?: boolean
  isFollowing?: boolean
  onToggleFollow?: () => void
  isFollowPending?: boolean
}

interface ProfileCardBaseProps extends ProfileActionProps {
  profile: AdopterPublicProfile
  mode?: 'mine' | 'other'
}

interface ProfileCardBreederProps extends ProfileActionProps {
  profile: BreederPublicProfile
  mode: 'breeder' | 'mine-breeder'
}

type ProfileCardProps = ProfileCardBaseProps | ProfileCardBreederProps

const FollowerSection = ({
  followerCount,
  className,
  textClassName,
  onClick,
}: {
  followerCount: number
  className?: string
  textClassName?: string
  onClick?: () => void
}) => (
  <button type="button" onClick={onClick} className={cn('flex items-center gap-0.5', className)}>
    {/* 팔로워 미리보기 — ProfileAvatar xsmall(24) + 회색 테두리, 살짝 겹침 */}
    <div className="flex items-center">
      {[0, 1, 2].map((i) => (
        <ProfileAvatar
          key={i}
          size="xsmall"
          className={cn('border-2 border-neutral-150', i < 2 && '-mr-[0.3125rem]')}
        />
      ))}
    </div>
    <span className={cn('font-medium text-neutral-850', textClassName)}>
      팔로워 {followerCount}
    </span>
  </button>
)

const LocationInfo = ({ location, className }: { location: string; className?: string }) => (
  <div className={cn('flex items-center gap-1.5', className)}>
    <LocationOnIcon className="size-5 text-text-secondary" />
    <span className="text-sm font-medium text-text-secondary">{location}</span>
  </div>
)

// [refactored] 프로필 이름/소개 타이포 — 공통 스타일을 한 곳에, 크기만 className으로 분기
const ProfileName = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn('leading-[1.5] font-semibold text-neutral-850', className)}>{children}</p>
)

const ProfileBio = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn('leading-[1.5] font-semibold break-words text-neutral-850', className)}>
    {children}
  </p>
)

/* ── 공통 버튼 ── */

// [refactored] pill 버튼 공통 베이스 (h-40, 둥근, muted 배경) — 메시지/즐겨찾기 아이콘 버튼이 공유
const PILL_BASE = 'flex h-10 items-center justify-center rounded-full bg-fill-muted p-2.5'

// [refactored] 팔로우 버튼은 shared/ui/FollowButton(공통)으로 통합 — 로컬 정의 제거
// [refactored] 아이콘+라벨 pill 버튼 — 메시지/즐겨찾기 공통 구조 통합
const IconPillButton = ({
  icon,
  label,
  className,
  onClick,
  disabled,
}: {
  icon: string
  label: string
  className?: string
  onClick?: () => void
  disabled?: boolean
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(PILL_BASE, 'gap-1.5 disabled:opacity-50', className)}
  >
    <Image src={icon} alt={label} width={20} height={20} />
    <span className="text-sm leading-[1.375rem] font-semibold text-text-primary">{label}</span>
  </button>
)

// [refactored] IconPillButton 얇은 래퍼 — 기존 호출부(MineActions 등) 유지
const MessageButton = ({
  label = '메시지 보내기',
  className,
  onClick,
  disabled,
}: {
  label?: string
  className?: string
  onClick?: () => void
  disabled?: boolean
}) => (
  <IconPillButton
    icon="/chat.svg"
    label={label}
    className={className}
    onClick={onClick}
    disabled={disabled}
  />
)

const FavoriteButton = ({ className }: { className?: string }) => (
  <IconPillButton icon="/star.svg" label="즐겨찾기 등록" className={className} />
)

/* ── mode별 하단 액션 (디자인: pill border 버튼) ── */

const EditButton = () => (
  <Link
    href="/home/edit"
    className="flex h-10 flex-1 items-center justify-center rounded-full border border-neutral-300 p-2 text-base leading-[1.5] font-semibold text-neutral-850 tab:h-12"
  >
    프로필 편집
  </Link>
)

const MineActions = () => <EditButton />

const BreederActions = ({
  onMessage,
  isMessagePending,
  isFollowing,
  onToggleFollow,
  isFollowPending,
}: ProfileActionProps) => (
  <>
    <FavoriteButton className="hidden tab:flex tab:w-[12.5rem]" />
    <MessageButton
      label="상담하기"
      className="tab:w-[12.5rem]"
      onClick={onMessage}
      disabled={isMessagePending}
    />
    <FollowButton
      status={isFollowing ? 'following' : 'follow'}
      className="flex-1"
      onClick={onToggleFollow}
      disabled={isFollowPending}
    />
  </>
)

const OtherActions = ({
  onMessage,
  isMessagePending,
  isFollowing,
  onToggleFollow,
  isFollowPending,
}: ProfileActionProps) => (
  <>
    <MessageButton className="tab:w-[12.5rem]" onClick={onMessage} disabled={isMessagePending} />
    <FollowButton
      status={isFollowing ? 'following' : 'follow'}
      className="flex-1"
      onClick={onToggleFollow}
      disabled={isFollowPending}
    />
  </>
)

const ACTION_MAP = {
  mine: MineActions,
  'mine-breeder': MineActions,
  breeder: BreederActions,
  other: OtherActions,
} satisfies Record<ProfileMode, ComponentType<ProfileActionProps>>

/* ── ProfileCard ── */

const ProfileCard = ({
  profile,
  mode = 'mine',
  onMessage,
  isMessagePending,
  isFollowing,
  onToggleFollow,
  isFollowPending,
}: ProfileCardProps) => {
  const Actions = ACTION_MAP[mode]
  const [followOpen, setFollowOpen] = useState(false)

  // [refactored] 타입 단언(as) 대신 in-내로잉으로 브리더 프로필 판별
  const breederProfile = 'businessLocation' in profile ? profile : null
  const isBreederProfile = breederProfile !== null
  const profileUserId = 'breederId' in profile ? profile.breederId : profile.userId

  // 친구 목록 — 모달이 열릴 때만 조회
  const followersQuery = useInfiniteQuery(profileQueries.followers(profileUserId, followOpen))
  const followingsQuery = useInfiniteQuery(profileQueries.followings(profileUserId, followOpen))
  const { mutate: unfollow } = useUnfollowUser()
  const { mutate: removeFollower } = useRemoveFollower()
  const locationText = breederProfile
    ? `${breederProfile.businessLocation.city} ${breederProfile.businessLocation.district}`
    : null

  // 상단 뱃지 (전 모드 공통, 채운 #3e3e3e) — 모바일 md(14px) / 데스크탑 lg(16px)
  const renderBadges = (size?: 'md') => (
    <>
      {isBreederProfile && (
        <Badge variant="active" size={size}>
          브리더
        </Badge>
      )}
      <Badge variant="active" size={size}>
        {profile.bpm} BPM
      </Badge>
    </>
  )

  return (
    <>
      {/* ===== Mobile (디자인 node 1023-22324) — 세로 gap-16 ===== */}
      <div className="flex flex-col gap-4 tab:hidden">
        {/* 프로필 정보 (세로 gap-12) */}
        <div className="flex flex-col items-start gap-3">
          {/* 상단: 좌(뱃지·이름) / 우(아바타 large 52) */}
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col items-start gap-2">
              <div className="flex flex-wrap items-start gap-3">{renderBadges('md')}</div>
              <ProfileName className="text-base">{profile.nickname}</ProfileName>
            </div>
            <ProfileAvatar
              size="large"
              src={profile.profileImageUrl}
              alt={profile.nickname}
              className="shrink-0"
            />
          </div>
          {/* 소개 */}
          <ProfileBio className="w-full text-sm">{profile.bio}</ProfileBio>
          {locationText && <LocationInfo location={locationText} />}
          {/* 팔로워 */}
          <FollowerSection
            followerCount={profile.followerCount}
            textClassName="text-xs"
            onClick={() => setFollowOpen(true)}
          />
        </div>
        {/* 하단: 모드별 버튼 (풀폭, gap-10, h-40) */}
        <div className="flex w-full items-start gap-2.5">
          <Actions
            onMessage={onMessage}
            isMessagePending={isMessagePending}
            isFollowing={isFollowing}
            onToggleFollow={onToggleFollow}
            isFollowPending={isFollowPending}
          />
        </div>
      </div>

      {/* ===== Desktop (디자인 node 1021-20324) ===== */}
      <div className="mx-auto hidden max-w-[59.25rem] overflow-hidden rounded-lg bg-neutral-50 tab:block">
        {/* 상단: 좌(뱃지·이름·소개) / 우(팔로워·아바타) — h-204 고정, 콘텐츠 가운데 정렬 */}
        <div className="flex h-[12.75rem] items-center justify-center overflow-hidden px-5 py-8">
          <div className="flex w-full max-w-[48.75rem] items-end justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
              <div className="flex items-start gap-3">{renderBadges()}</div>
              <ProfileName className="text-2xl">{profile.nickname}</ProfileName>
              {locationText && <LocationInfo location={locationText} />}
              <ProfileBio className="text-base">{profile.bio}</ProfileBio>
            </div>
            <div className="flex shrink-0 items-end gap-3">
              <FollowerSection
                followerCount={profile.followerCount}
                textClassName="text-xs"
                onClick={() => setFollowOpen(true)}
              />
              <ProfileAvatar size="xlarge" src={profile.profileImageUrl} alt={profile.nickname} />
            </div>
          </div>
        </div>

        {/* 하단: 구분선 + 모드별 버튼 */}
        <div className="flex flex-col items-center gap-3 pb-8">
          <div className="h-px w-full bg-neutral-150" />
          <div className="flex w-full max-w-[36.625rem] items-center gap-6 px-5">
            <Actions
              onMessage={onMessage}
              isMessagePending={isMessagePending}
              isFollowing={isFollowing}
              onToggleFollow={onToggleFollow}
              isFollowPending={isFollowPending}
            />
          </div>
        </div>
      </div>

      <FollowersModal
        open={followOpen}
        onOpenChange={setFollowOpen}
        followerCount={profile.followerCount}
        followingCount={profile.followingCount ?? 0}
        followers={toFollowUsers(followersQuery)}
        following={toFollowUsers(followingsQuery)}
        onRemoveFollower={removeFollower}
        onUnfollow={unfollow}
        getProfileHref={(id) => `/home/${id}`}
        paging={{ followers: toPaging(followersQuery), following: toPaging(followingsQuery) }}
      />
    </>
  )
}

export { ProfileCard }
