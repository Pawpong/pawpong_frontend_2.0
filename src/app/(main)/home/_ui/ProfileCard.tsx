'use client'

import { useState, type ComponentType, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query'
import { Button, buttonVariants, ProfileAvatar, FollowersModal, type FollowUser } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { formatBreederLocation } from '@/shared/lib/formatBreederLocation'
import { LocationOnIcon } from '@/shared/assets'
import { profileQueries } from '@/entities/profile'
import { useFollowUser, useUnfollowUser, useRemoveFollower } from '@/features/profile'
import { useCreateOrGetChatRoom } from '@/features/send-message'
import type {
  AdopterPublicProfile,
  BreederPublicProfile,
  FollowUserCard,
  PaginationResponse,
} from '@/shared/types'
import { FavoriteBreederIconButton } from './FavoriteBreederIconButton'

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
  (query.data?.pages ?? []).flatMap((page) => page.items.map(toFollowUser))

const toMutualFollowers = (query: FollowListQuery): FollowUser[] =>
  (query.data?.pages ?? []).flatMap((page) =>
    page.items.filter((card) => card.isFollowing).map(toFollowUser),
  )

const toPaging = (query: FollowListQuery) => ({
  hasMore: query.hasNextPage,
  isLoadingMore: query.isFetchingNextPage,
  onLoadMore: query.fetchNextPage,
})

type ProfileMode = 'mine' | 'mine-breeder' | 'other' | 'breeder'

interface ProfileCardBaseProps {
  profile: AdopterPublicProfile
  mode?: 'mine' | 'other'
}

interface ProfileCardBreederProps {
  profile: BreederPublicProfile
  mode: 'breeder' | 'mine-breeder'
}

type ProfileCardProps = ProfileCardBaseProps | ProfileCardBreederProps

// 모바일은 가로(아바타 → 라벨), PC는 세로(라벨 → 아바타). DOM 순서는 하나로 두고
// flex-col-reverse로 뒤집어 마크업 중복을 피한다.
const FollowerSection = ({
  vertical,
  label = '친구 목록',
  users = [],
  className,
  textClassName,
  onClick,
}: {
  vertical?: boolean
  label?: string
  users?: FollowUser[]
  className?: string
  textClassName?: string
  onClick?: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex gap-0.5',
      vertical ? 'flex-col-reverse items-start gap-2' : 'items-center',
      className,
    )}
  >
    {/* 친구 목록 미리보기 — ProfileAvatar xsmall(24) + 회색 테두리, 살짝 겹침 */}
    <div className="flex items-center">
      {(users.length > 0 ? users.slice(0, 3) : [undefined, undefined, undefined]).map((user, i) => (
        <ProfileAvatar
          key={user?.id ?? i}
          size="xsmall"
          src={user?.profileImageUrl}
          alt={user?.nickname}
          className={cn('border-2 border-neutral-150', i < 2 && '-mr-[0.3125rem]')}
        />
      ))}
    </div>
    <span className={cn('font-medium text-neutral-850', textClassName)}>{label}</span>
  </button>
)

const LocationInfo = ({ location, className }: { location: string; className?: string }) => (
  <div className={cn('flex items-center gap-1.5', className)}>
    <LocationOnIcon className="size-5 text-primary-500 pc:size-6" />
    <span className="text-sm font-medium text-primary-500">{location}</span>
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

/* ── mode별 하단 액션 (디자인: pill border 버튼) ── */

// 프로필 편집·팔로우·메시지 공통 크기 — 모바일 32, PC 40
const ACTION_SIZE = 'h-8 flex-1 text-sm pc:h-10 pc:text-base'

const EditButton = () => (
  <Link href="/profile/edit" className={cn(buttonVariants({ variant: 'outline' }), ACTION_SIZE)}>
    프로필 편집
  </Link>
)

const MineActions = () => <EditButton />

/* ── 남의 홈에서 보이는 액션 (Figma 3349-2026986) ── */

// 흰 배경 + border/secondary(#cacaca) pill
// 누르면 채팅방 생성(또는 기존 방 조회) 후 /chat 으로 이동
const MessageButton = ({ targetId }: { targetId: string }) => {
  const router = useRouter()
  const { mutate: startChat, isPending } = useCreateOrGetChatRoom()

  return (
    <Button
      variant="outline"
      disabled={isPending}
      onClick={() =>
        startChat(
          { breederId: targetId },
          {
            onSuccess: (room) => router.push(`/chat?roomId=${room.roomId}`),
            onError: () => alert('채팅방을 열지 못했습니다. 잠시 후 다시 시도해주세요.'),
          },
        )
      }
      className={cn(ACTION_SIZE, 'gap-1.5 pc:gap-2')}
    >
      <Image src="/chat.svg" alt="" width={24} height={24} className="size-5 pc:size-6" />
      메시지
    </Button>
  )
}

interface VisitorActionsProps {
  /** 팔로우 대상 — 입양자는 userId, 브리더는 breederId (백엔드 팔로우 대상은 양쪽 모두 허용) */
  targetId: string
  isFollowing: boolean
}

// 시안의 팔로우는 point 색 BaseButton(최대 258).
// 공통 FollowButton 은 팔로워 모달용 muted pill 이라 여기서는 쓰지 않는다
const FollowActionButton = ({ targetId, isFollowing }: VisitorActionsProps) => {
  const follow = useFollowUser()
  const unfollow = useUnfollowUser()
  const isPending = follow.isPending || unfollow.isPending

  return (
    <Button
      variant={isFollowing ? 'outline' : 'primary'}
      disabled={isPending}
      onClick={() => (isFollowing ? unfollow : follow).mutate(targetId)}
      className={cn(ACTION_SIZE, 'pc:max-w-[16.125rem]')}
    >
      {isFollowing ? '팔로우 취소' : '팔로우'}
    </Button>
  )
}

const VisitorActions = (props: VisitorActionsProps) => (
  <>
    <FollowActionButton {...props} />
    <MessageButton targetId={props.targetId} />
  </>
)

// 내 홈 액션은 props 를 쓰지 않는다 (같은 자리에서 렌더되므로 시그니처만 맞춤)
const ACTION_MAP = {
  mine: MineActions,
  'mine-breeder': MineActions,
  breeder: VisitorActions,
  other: VisitorActions,
} satisfies Record<ProfileMode, ComponentType<VisitorActionsProps>>

/* ── ProfileCard ── */

const ProfileCard = ({ profile, mode = 'mine' }: ProfileCardProps) => {
  const Actions = ACTION_MAP[mode]
  const [followOpen, setFollowOpen] = useState(false)

  // [refactored] 브리더 판별을 한 곳에서 — 이전엔 'isFavorited' in / 'breederId' in /
  // 'businessLocation' in 으로 같은 판정을 네 번 했다 (타입 단언 없이 in-내로잉)
  const breederProfile = 'businessLocation' in profile ? profile : null
  const profileUserId = breederProfile?.breederId ?? (profile as AdopterPublicProfile).userId
  const isFollowing = breederProfile?.isFollowing ?? (profile as AdopterPublicProfile).isFollowing
  const isVisitor = mode === 'other' || mode === 'breeder'

  // 공개 홈은 팔로우 중일 때 함께 팔로우하는 사람 미리보기도 필요하다.
  const followersQuery = useInfiniteQuery(
    profileQueries.followers(profileUserId, followOpen || (isVisitor && isFollowing)),
  )
  const followingsQuery = useInfiniteQuery(
    profileQueries.followings(profileUserId, followOpen && !isVisitor),
  )
  const { mutate: unfollow } = useUnfollowUser()
  const { mutate: removeFollower } = useRemoveFollower()
  // 남의 브리더 홈에서만 카드 우상단 즐겨찾기 아이콘을 띄운다
  const showFavoriteAction = mode === 'breeder' && breederProfile !== null
  // 특별시·광역시는 city/district 가 사실상 같은 지역이라(서울특별시/서울시) 그대로
  // 이어 붙이면 중복 표시된다 — 브리더 탐색 카드에서 고친 것과 같은 기준을 여기서도 적용
  const locationText = breederProfile
    ? formatBreederLocation(
        breederProfile.businessLocation.city,
        breederProfile.businessLocation.district,
      )
    : null

  const followers = toFollowUsers(followersQuery)
  const following = toFollowUsers(followingsQuery)
  const mutualFollowers = isVisitor ? toMutualFollowers(followersQuery) : []
  const showMutualFollowers = isVisitor && isFollowing && mutualFollowers.length > 0

  return (
    <>
      {/* ===== Mobile (디자인 node 1023-22324) — 세로 gap-16 ===== */}
      <div className="mx-auto flex w-full max-w-168 flex-col gap-4 pc:hidden">
        {/* 프로필 정보 (세로 gap-12) */}
        <div className="flex flex-col items-start gap-3">
          {/* 상단: 좌(뱃지·이름) / 우(아바타 large 52) */}
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col items-start gap-2">
              <ProfileName className="text-xl">{profile.nickname}</ProfileName>
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
          {isVisitor ? (
            <div className="flex min-h-6 items-start">
              {showMutualFollowers && (
                <FollowerSection
                  label="함께 팔로우하는 사람"
                  users={mutualFollowers}
                  textClassName="text-xs"
                  onClick={() => setFollowOpen(true)}
                />
              )}
            </div>
          ) : (
            <FollowerSection textClassName="text-xs" onClick={() => setFollowOpen(true)} />
          )}
        </div>
        {/* 하단: 모드별 버튼 (풀폭, gap-10, h-40) */}
        <div className="flex w-full items-start gap-2.5">
          <Actions targetId={profileUserId} isFollowing={isFollowing} />
        </div>
      </div>

      {/* ===== Desktop (디자인 node 1021-20324) ===== */}
      <div className="mx-auto hidden max-w-[59.25rem] overflow-hidden rounded-lg pc:block">
        {/* 상단: 좌(프로필 정보) / 우(즐겨찾기 아이콘·팔로워·아바타) */}
        <div className="flex items-center justify-center overflow-hidden px-5 py-8">
          <div className="flex h-40 w-full max-w-[48.75rem] items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-3 self-stretch">
              <ProfileName className="text-2xl">{profile.nickname}</ProfileName>
              {/* 디자인상 이름·소개 블록 폭 440. 위치는 소개 아래 (모바일 블록과 같은 순서) */}
              <ProfileBio className="w-full max-w-[27.5rem] text-base">{profile.bio}</ProfileBio>
              {locationText && <LocationInfo location={locationText} />}
            </div>
            {/* [refactored] 두 갈래가 팔로워+아바타를 똑같이 그리고 있어 한 벌로 합쳤다.
                실제 차이는 즐겨찾기 행 유무와 래퍼 폭뿐 */}
            <div
              className={cn(
                'flex min-w-0 flex-col items-end gap-3 self-stretch',
                showFavoriteAction ? 'flex-1' : 'w-[13.5625rem] shrink-0',
              )}
            >
              <div className="flex h-12 w-full shrink-0 items-center justify-end">
                {showFavoriteAction && (
                  <FavoriteBreederIconButton
                    breederId={breederProfile.breederId}
                    isFavorited={breederProfile.isFavorited}
                  />
                )}
              </div>
              <div className="flex w-[13.5625rem] items-end justify-end gap-3">
                {isVisitor ? (
                  showMutualFollowers && (
                    <FollowerSection
                      vertical
                      label="함께 팔로우하는 사람"
                      users={mutualFollowers}
                      className="min-w-0 flex-1"
                      textClassName="text-xs"
                      onClick={() => setFollowOpen(true)}
                    />
                  )
                ) : (
                  <FollowerSection
                    vertical
                    className="min-w-0 flex-1"
                    textClassName="text-xs"
                    onClick={() => setFollowOpen(true)}
                  />
                )}
                <ProfileAvatar size="xlarge" src={profile.profileImageUrl} alt={profile.nickname} />
              </div>
            </div>
          </div>
        </div>

        {/* 하단 액션 */}
        <div className="flex flex-col items-center pb-8">
          <div
            className={cn(
              'flex w-full items-start justify-center gap-6',
              isVisitor ? 'max-w-[48rem]' : 'max-w-[30.375rem]',
            )}
          >
            <Actions targetId={profileUserId} isFollowing={isFollowing} />
          </div>
        </div>
      </div>

      <FollowersModal
        open={followOpen}
        onOpenChange={setFollowOpen}
        variant={isVisitor ? 'mutual' : 'manage'}
        followerCount={isVisitor ? mutualFollowers.length : profile.followerCount}
        followingCount={profile.followingCount}
        followers={isVisitor ? mutualFollowers : followers}
        following={following}
        onRemoveFollower={removeFollower}
        onUnfollow={unfollow}
        getProfileHref={(id) => `/home/${id}`}
        paging={{ followers: toPaging(followersQuery), following: toPaging(followingsQuery) }}
      />
    </>
  )
}

export { ProfileCard }
