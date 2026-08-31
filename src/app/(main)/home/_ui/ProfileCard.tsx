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
import {
  Badge,
  Button,
  buttonVariants,
  ProfileAvatar,
  FollowersModal,
  type FollowUser,
} from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
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
  className,
  textClassName,
  onClick,
}: {
  vertical?: boolean
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
      {[0, 1, 2].map((i) => (
        <ProfileAvatar
          key={i}
          size="xsmall"
          className={cn('border-2 border-neutral-150', i < 2 && '-mr-[0.3125rem]')}
        />
      ))}
    </div>
    <span className={cn('font-medium text-neutral-850', textClassName)}>친구 목록</span>
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
      {isFollowing ? '팔로잉' : '팔로우'}
    </Button>
  )
}

// 채팅방 계약은 입양자↔브리더 전용이라 브리더 홈에서만 메시지 액션을 노출한다.
const BreederVisitorActions = (props: VisitorActionsProps) => (
  <>
    <FollowActionButton {...props} />
    <MessageButton targetId={props.targetId} />
  </>
)

const AdopterVisitorActions = (props: VisitorActionsProps) => <FollowActionButton {...props} />

// 내 홈 액션은 props 를 쓰지 않는다 (같은 자리에서 렌더되므로 시그니처만 맞춤)
const ACTION_MAP = {
  mine: MineActions,
  'mine-breeder': MineActions,
  breeder: BreederVisitorActions,
  other: AdopterVisitorActions,
} satisfies Record<ProfileMode, ComponentType<VisitorActionsProps>>

/* ── ProfileCard ── */

const ProfileCard = ({ profile, mode = 'mine' }: ProfileCardProps) => {
  const Actions = ACTION_MAP[mode]
  const [followOpen, setFollowOpen] = useState(false)

  // [refactored] 브리더 판별을 한 곳에서 — 이전엔 'isFavorited' in / 'breederId' in /
  // 'businessLocation' in 으로 같은 판정을 네 번 했다 (타입 단언 없이 in-내로잉)
  const breederProfile = 'businessLocation' in profile ? profile : null
  const isBreederProfile = breederProfile !== null
  const profileUserId = breederProfile?.breederId ?? (profile as AdopterPublicProfile).userId
  const isFollowing = breederProfile?.isFollowing ?? (profile as AdopterPublicProfile).isFollowing

  // 친구 목록 — 모달이 열릴 때만 조회
  const followersQuery = useInfiniteQuery(profileQueries.followers(profileUserId, followOpen))
  const followingsQuery = useInfiniteQuery(profileQueries.followings(profileUserId, followOpen))
  const { mutate: unfollow } = useUnfollowUser()
  const { mutate: removeFollower } = useRemoveFollower()
  // 남의 브리더 홈에서만 카드 우상단 즐겨찾기 아이콘을 띄운다
  const showFavoriteAction = mode === 'breeder' && breederProfile !== null
  const locationText = breederProfile
    ? `${breederProfile.businessLocation.city} ${breederProfile.businessLocation.district}`
    : null

  // 상단 뱃지 (전 모드 공통) — point-500 채움 + primary-500 테두리/텍스트
  // 모바일 md(10px·h-24) / PC lg(14px). PC 높이는 디자인 노드 기준 32px로 맞춘다.
  const renderBadges = (size?: 'md') => {
    // [refactored] size 미지정(=PC lg)일 때만 높이를 32로 맞춘다는 규칙을 이름으로 드러냄
    const badgeProps = {
      variant: 'pointFilled',
      size,
      className: size ? undefined : 'h-8',
    } as const

    return (
      <>
        {isBreederProfile && <Badge {...badgeProps}>브리더</Badge>}
        <Badge {...badgeProps}>{profile.bpm} BPM</Badge>
      </>
    )
  }

  return (
    <>
      {/* ===== Mobile (디자인 node 1023-22324) — 세로 gap-16 ===== */}
      <div className="mx-auto flex w-full max-w-168 flex-col gap-4 pc:hidden">
        {/* 프로필 정보 (세로 gap-12) */}
        <div className="flex flex-col items-start gap-3">
          {/* 상단: 좌(뱃지·이름) / 우(아바타 large 52) */}
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col items-start gap-2">
              <div className="flex flex-wrap items-start gap-3">{renderBadges('md')}</div>
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
          {/* 친구 목록 */}
          <FollowerSection textClassName="text-xs" onClick={() => setFollowOpen(true)} />
        </div>
        {/* 하단: 모드별 버튼 (풀폭, gap-10, h-40) */}
        <div className="flex w-full items-start gap-2.5">
          <Actions targetId={profileUserId} isFollowing={isFollowing} />
        </div>
      </div>

      {/* ===== Desktop (디자인 node 1021-20324) ===== */}
      <div className="mx-auto hidden max-w-[59.25rem] overflow-hidden rounded-lg bg-point-50 pc:block">
        {/* 상단: 좌(프로필 정보) / 우(즐겨찾기 아이콘·팔로워·아바타) */}
        <div className="flex items-center justify-center overflow-hidden px-5 py-8">
          <div className="flex w-full max-w-[48.75rem] items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
              <div className="flex items-start gap-3">{renderBadges()}</div>
              <ProfileName className="text-2xl">{profile.nickname}</ProfileName>
              {/* 디자인상 이름·소개 블록 폭 440. 위치는 소개 아래 (모바일 블록과 같은 순서) */}
              <ProfileBio className="w-full max-w-[27.5rem] text-base">{profile.bio}</ProfileBio>
              {locationText && <LocationInfo location={locationText} />}
            </div>
            {/* [refactored] 두 갈래가 팔로워+아바타를 똑같이 그리고 있어 한 벌로 합쳤다.
                실제 차이는 즐겨찾기 행 유무와 래퍼 폭뿐 */}
            <div
              className={cn(
                'flex items-end gap-3',
                showFavoriteAction ? 'min-w-0 flex-1 flex-col items-end self-stretch' : 'shrink-0',
              )}
            >
              {showFavoriteAction && (
                <div className="flex h-12 w-full items-center justify-end">
                  <FavoriteBreederIconButton
                    breederId={breederProfile.breederId}
                    isFavorited={breederProfile.isFavorited}
                  />
                </div>
              )}
              <div
                className={cn(
                  'flex items-end gap-3',
                  showFavoriteAction && 'w-[13.5625rem] justify-end',
                )}
              >
                <FollowerSection
                  vertical
                  textClassName="text-xs"
                  onClick={() => setFollowOpen(true)}
                />
                <ProfileAvatar size="xlarge" src={profile.profileImageUrl} alt={profile.nickname} />
              </div>
            </div>
          </div>
        </div>

        {/* 하단: 구분선 + 모드별 버튼 */}
        <div className="flex flex-col items-center gap-3 pb-8">
          <div className="h-px w-full bg-neutral-150" />
          <div
            className={cn(
              'flex w-full items-start gap-6',
              mode === 'breeder' ? 'max-w-[48rem]' : 'max-w-[43rem] px-5',
            )}
          >
            <Actions targetId={profileUserId} isFollowing={isFollowing} />
          </div>
        </div>
      </div>

      <FollowersModal
        open={followOpen}
        onOpenChange={setFollowOpen}
        followerCount={profile.followerCount}
        followingCount={profile.followingCount}
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
