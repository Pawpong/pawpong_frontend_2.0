'use client'

import { useState, type ComponentType } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from '@tanstack/react-query'
import {
  Button,
  buttonVariants,
  LocationText,
  ProfileAvatar,
  FollowersModal,
  type FollowUser,
} from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { formatBreederLocation } from '@/shared/lib/formatBreederLocation'
import { profileQueries } from '@/entities/profile'
import { useAuthStatus } from '@/features/auth'
import { ReportBreederAction } from '@/features/report'
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

/**
 * strip  — 가로 한 줄 (아바타 | 이름·카운트·소개 | 액션). 공개 홈처럼 폭이 넉넉한 자리.
 * sidebar — PC 2단 레이아웃의 좁은 좌측 컬럼에서 세로로 쌓는다 (블로그형 마이홈).
 */
type ProfileCardLayout = 'strip' | 'sidebar'

interface ProfileCardBaseProps {
  profile: AdopterPublicProfile
  mode?: 'mine' | 'other'
  layout?: ProfileCardLayout
}

interface ProfileCardBreederProps {
  profile: BreederPublicProfile
  mode: 'breeder' | 'mine-breeder'
  layout?: ProfileCardLayout
}

type ProfileCardProps = ProfileCardBaseProps | ProfileCardBreederProps

// [refactored] 아바타 미리보기 + "친구 목록" 라벨 → 실제 팔로워/팔로잉 숫자.
// 카운트는 profile 에 이미 있는데 모달에만 넘기고 있어서, 카드가 공간만 쓰고 정보는 없었다.
const FollowCounts = ({
  followerCount,
  followingCount,
  onClick,
}: {
  followerCount: number
  followingCount: number
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-1 text-sm leading-[1.5] font-medium whitespace-nowrap text-neutral-700 hover:text-neutral-850"
  >
    <span>팔로워</span>
    <span className="font-semibold text-neutral-850">{followerCount}</span>
    <span aria-hidden className="px-0.5 text-neutral-300">
      ·
    </span>
    <span>팔로잉</span>
    <span className="font-semibold text-neutral-850">{followingCount}</span>
  </button>
)

/* ── mode별 하단 액션 (디자인: pill border 버튼) ── */

// 프로필 편집·팔로우·메시지 공통 크기 — 모바일 32, PC 40
// [refactored] flex-1 + min-w 로 두어 컨테이너가 폭을 정한다.
// (strip 은 w-auto 라 min-w 만큼, sidebar 는 w-full 이라 컬럼을 채운다 — max-w 캡 두 개 제거)
const ACTION_SIZE = 'h-8 flex-1 text-sm whitespace-nowrap pc:h-10 pc:min-w-30 pc:px-6 pc:text-base'

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
      className={ACTION_SIZE}
    >
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
      className={ACTION_SIZE}
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

const ProfileCard = ({ profile, mode = 'mine', layout = 'strip' }: ProfileCardProps) => {
  const Actions = ACTION_MAP[mode]
  // 세로 배치는 2단(tab+)에서만 — 모바일은 두 레이아웃 모두 같은 가로 스트립이다
  const isSidebar = layout === 'sidebar'
  const [followOpen, setFollowOpen] = useState(false)

  // [refactored] 브리더 판별을 한 곳에서 — 이전엔 'isFavorited' in / 'breederId' in /
  // 'businessLocation' in 으로 같은 판정을 네 번 했다 (타입 단언 없이 in-내로잉)
  const breederProfile = 'businessLocation' in profile ? profile : null
  const profileUserId = breederProfile?.breederId ?? (profile as AdopterPublicProfile).userId
  const isFollowing = breederProfile?.isFollowing ?? (profile as AdopterPublicProfile).isFollowing
  const isVisitor = mode === 'other' || mode === 'breeder'

  // [refactored] 카드에서 미리보기가 사라져 모달을 열 때만 받는다 (공개 홈 진입 시 선요청 제거)
  const followersQuery = useInfiniteQuery(profileQueries.followers(profileUserId, followOpen))
  const followingsQuery = useInfiniteQuery(
    profileQueries.followings(profileUserId, followOpen && !isVisitor),
  )
  const { mutate: unfollow } = useUnfollowUser()
  const { mutate: removeFollower } = useRemoveFollower()
  // 남의 브리더 홈에서만 카드 우상단 즐겨찾기·신고를 띄운다
  const showFavoriteAction = mode === 'breeder' && breederProfile !== null
  // 브리더 신고는 입양자(비로그인 포함)에게만 보인다
  const { isReady, isLoggedIn, userRole } = useAuthStatus()
  const canReportBreeder = isReady && (!isLoggedIn || userRole === 'adopter')
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

  // 즐겨찾기·더보기 — 2단(tab+)에서는 아바타 줄로, 모바일에서는 이름 줄로 자리를 옮긴다
  const favoriteActions = showFavoriteAction ? (
    <div className="flex shrink-0 items-center gap-1">
      <FavoriteBreederIconButton
        breederId={breederProfile.breederId}
        isFavorited={breederProfile.isFavorited}
        size="nav"
      />
      {canReportBreeder && <ReportBreederAction breederId={breederProfile.breederId} />}
    </div>
  ) : null

  return (
    <>
      {/* [refactored] 아바타 + (이름·카운트·소개) + 액션을 한 행으로.
          모바일에서는 액션만 다음 줄로 감싸(w-full) 두 버튼이 눌리기 좋은 폭을 갖는다.
          sidebar 레이아웃은 PC 에서만 세로로 쌓는다.
          즐겨찾기는 팔로우·메시지와 급이 다른 보조 토글이라(Figma 3349-2026986) 액션 행에
          섞지 않고 이름 줄 오른쪽에 둔다 — 안 그러면 팔로우/메시지 폭이 좁아지고 위계가 깨진다. */}
      <div
        className={cn(
          'mx-auto flex w-full max-w-168 flex-wrap items-start gap-x-4 gap-y-3',
          isSidebar ? 'tab:max-w-none tab:flex-col tab:gap-4' : 'pc:max-w-[48.75rem]',
        )}
      >
        <div
          className={cn(
            'flex min-w-0 flex-1 items-start gap-3 pc:gap-4',
            isSidebar && 'tab:w-full tab:flex-none tab:flex-col',
          )}
        >
          {isSidebar ? (
            <div className="flex items-start gap-3 tab:w-full tab:justify-between">
              <ProfileAvatar
                size="responsiveProfile"
                src={profile.profileImageUrl}
                alt={profile.nickname}
                className="shrink-0 tab:size-20 pc:size-24"
              />
              {favoriteActions && <div className="hidden tab:block">{favoriteActions}</div>}
            </div>
          ) : (
            <ProfileAvatar
              size="responsiveProfile"
              src={profile.profileImageUrl}
              alt={profile.nickname}
              className="shrink-0"
            />
          )}
          <div className="flex w-full min-w-0 flex-1 flex-col gap-0.5">
            {/* 즐겨찾기·신고는 카드가 유일한 진입점이다 (상단 nav 는 2단에서 사라진다).
                절대배치 대신 이름 줄에 나란히 둬서 자리를 예약할 필요가 없다.
                2단(tab+)에서는 아바타 줄로 옮겨가 여기선 숨긴다 */}
            <div className="flex items-start gap-1">
              <p className="min-w-0 flex-1 truncate text-lg leading-[1.5] font-semibold text-neutral-850 pc:text-xl">
                {profile.nickname}
              </p>
              {favoriteActions && (
                <div className={cn(isSidebar && 'tab:hidden')}>{favoriteActions}</div>
              )}
            </div>
            {/* 위치 → 카운트 순으로 이름 아래에 각각 한 줄씩 (같은 줄에 묶지 않는다) */}
            {locationText && <LocationText location={locationText} />}
            <FollowCounts
              followerCount={profile.followerCount}
              followingCount={profile.followingCount}
              onClick={() => setFollowOpen(true)}
            />
            {/* 스트립은 한 줄, 사이드바는 폭이 좁으니 세 줄까지 편다 */}
            <p
              className={cn(
                'text-sm leading-[1.5] font-medium break-words text-neutral-700',
                isSidebar ? 'truncate tab:line-clamp-3 tab:text-clip' : 'truncate',
              )}
            >
              {profile.bio}
            </p>
          </div>
        </div>

        {/* 팔로우 + 메시지 — 동급 액션 두 개가 폭을 반씩 나눠 갖는다(ACTION_SIZE의 flex-1) */}
        <div
          className={cn(
            'flex w-full shrink-0 items-center gap-2.5 pc:gap-3',
            // 좁은 컬럼에 팔로우+메시지를 나란히 두면 라벨이 두 줄로 깨진다
            isSidebar ? 'tab:w-full' : 'pc:w-auto',
          )}
        >
          <Actions targetId={profileUserId} isFollowing={isFollowing} />
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
