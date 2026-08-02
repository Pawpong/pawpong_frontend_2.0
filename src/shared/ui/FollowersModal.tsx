'use client'

import { useState } from 'react'
import Link from 'next/link'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Dialog, DialogPortal, DialogOverlay, DialogClose } from '@/shared/ui'
import { ProfileAvatar } from './ProfileAvatar'
import { Button } from './Button'
import { FollowButton } from './FollowButton'
import { TextLabel } from './TextLabel'
import { NavigationBar } from './NavigationBar'
import { InfiniteScrollTrigger } from './InfiniteScrollTrigger'
import { CtaModal } from './CtaModal'
import { CloseIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

interface FollowUser {
  id: string
  nickname: string
  profileImageUrl?: string
  /** 팔로잉 탭에서 맞팔 여부 — true면 "맞팔로잉"(다크), false면 "팔로잉"(아웃라인) */
  mutual?: boolean
}

type FollowTab = 'followers' | 'following'

interface FollowersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 탭에 표시할 총 개수 (로드된 목록 길이와 다를 수 있음) */
  followerCount: number
  followingCount: number
  followers: FollowUser[]
  following: FollowUser[]
  /** 처음 열 때 활성 탭 */
  defaultTab?: FollowTab
  /** 팔로워 삭제 */
  onRemoveFollower?: (userId: string) => void
  /** 팔로잉 해제(언팔로우) */
  onUnfollow?: (userId: string) => void
  /** 프로필 이동 링크 */
  getProfileHref?: (userId: string) => string
  /** 탭별 무한스크롤 (없으면 첫 페이지만 표시) */
  paging?: Record<FollowTab, FollowListPaging>
}

interface FollowListPaging {
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
}

const TABS: { key: FollowTab; label: string }[] = [
  { key: 'followers', label: '팔로워' },
  { key: 'following', label: '팔로잉' },
]

// [refactored] 확인 모달 문구/액션 라벨을 mode 룩업으로 통합 (삼항 3곳 제거)
type ConfirmMode = 'remove' | 'unfollow'

const CONFIRM: Record<ConfirmMode, { question: string; actionLabel: string }> = {
  remove: { question: ' 을 삭제 하시겠어요?', actionLabel: '삭제' },
  unfollow: { question: '의 팔로우를 취소하시겠어요?', actionLabel: '팔로우 취소' },
}

const FollowersModal = ({
  open,
  onOpenChange,
  followerCount,
  followingCount,
  followers,
  following,
  defaultTab = 'followers',
  onRemoveFollower,
  onUnfollow,
  getProfileHref,
  paging,
}: FollowersModalProps) => {
  const [tab, setTab] = useState<FollowTab>(defaultTab)
  // 확인 모달 대상 — remove(팔로워 삭제) / unfollow(팔로우 취소)
  const [pending, setPending] = useState<{ user: FollowUser; mode: ConfirmMode } | null>(null)

  // [refactored] 탭별 목록/개수를 한 곳에서 조회 (counts 객체 + users 삼항 통합)
  const LISTS: Record<FollowTab, { users: FollowUser[]; count: number }> = {
    followers: { users: followers, count: followerCount },
    following: { users: following, count: followingCount },
  }
  const { users } = LISTS[tab]

  const renderName = (user: FollowUser) => {
    const name = <TextLabel size="14">{user.nickname}</TextLabel>
    const href = getProfileHref?.(user.id)
    return href ? (
      <Link href={href} className="min-w-0">
        {name}
      </Link>
    ) : (
      name
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay className="bg-black/60" />
          {/* 모바일·탭은 전체화면 시트, pc는 가운데 카드 */}
          <DialogPrimitive.Content
            // 설명 텍스트가 없는 모달 — Radix의 aria-describedby 누락 경고를 명시적으로 끔
            aria-describedby={undefined}
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="fixed inset-0 z-50 flex h-full w-full flex-col overflow-hidden bg-white pc:inset-auto pc:top-1/2 pc:left-1/2 pc:h-[min(40.875rem,90vh)] pc:w-[min(46.0625rem,calc(100vw-2rem))] pc:-translate-x-1/2 pc:-translate-y-1/2 pc:rounded-[1.25rem] pc:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]"
          >
            <DialogPrimitive.Title className="sr-only">팔로워·팔로잉 목록</DialogPrimitive.Title>

            {/* 모바일·탭: 뒤로가기 + 타이틀 */}
            <NavigationBar
              title="친구 목록"
              onBack={() => onOpenChange(false)}
              // 상단 여백 — Figma header 영역 (모바일 48px / 탭 64px)
              className="mt-12 shrink-0 tab:mt-16 pc:hidden"
            />

            {/* pc: 닫기 */}
            <div className="hidden h-12 shrink-0 items-center justify-end px-6 py-3 pc:flex">
              <DialogClose aria-label="닫기">
                <CloseIcon className="size-6 text-neutral-850" />
              </DialogClose>
            </div>

            {/* 탭 */}
            <div className="flex shrink-0 border-b border-neutral-150 px-4 tab:px-12">
              {TABS.map(({ key, label }) => {
                const active = tab === key
                // [refactored] 라벨·개수가 공유하는 active 스타일을 한 번만 계산
                const textClass = cn(
                  'text-sm leading-[1.5]',
                  active ? 'font-semibold text-neutral-850' : 'font-medium text-neutral-500',
                )
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={cn(
                      // 모바일·탭: 한 줄(라벨 개수) / pc: 라벨 위, 개수 아래
                      'flex flex-1 items-center justify-center gap-1 p-3 pc:flex-col pc:gap-0 pc:py-2',
                      active && 'border-b border-neutral-850',
                    )}
                  >
                    <span className={cn(textClass, 'pc:text-base')}>{label}</span>
                    <span className={textClass}>{LISTS[key].count}</span>
                  </button>
                )
              })}
            </div>

            {/* 목록 */}
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-5 tab:px-12 pc:py-8">
              {users.map((user) => (
                <div key={user.id} className="flex w-full items-center gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <ProfileAvatar
                      size="small"
                      src={user.profileImageUrl}
                      alt={user.nickname}
                      className="shrink-0"
                    />
                    {renderName(user)}
                  </div>

                  {tab === 'followers' ? (
                    <Button
                      variant="text"
                      onClick={() => setPending({ user, mode: 'remove' })}
                      className="shrink-0 font-medium text-neutral-500"
                    >
                      삭제
                    </Button>
                  ) : (
                    <FollowButton
                      status={user.mutual ? 'mutual' : 'following'}
                      size="sm"
                      onClick={() => setPending({ user, mode: 'unfollow' })}
                      className="w-[4.5625rem] shrink-0"
                    />
                  )}
                </div>
              ))}

              {paging && (
                <InfiniteScrollTrigger
                  onIntersect={paging[tab].onLoadMore}
                  hasNextPage={paging[tab].hasMore}
                  isFetchingNextPage={paging[tab].isLoadingMore}
                />
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* 팔로워 삭제 / 팔로우 취소 확인 (공통 CtaModal) */}
      <CtaModal
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        showClose={false}
        iconBare
        icon={
          pending && (
            <ProfileAvatar
              size="large"
              src={pending.user.profileImageUrl}
              alt={pending.user.nickname}
            />
          )
        }
        title={
          <>
            <span className="font-bold">{pending?.user.nickname}님</span>
            {pending && CONFIRM[pending.mode].question}
          </>
        }
        titleClassName="text-base"
        direction="responsive"
        actions={[
          {
            label: pending ? CONFIRM[pending.mode].actionLabel : '',
            variant: 'outline',
            className: 'text-error-500',
            onClick: () => {
              if (!pending) return
              const confirmAction = pending.mode === 'unfollow' ? onUnfollow : onRemoveFollower
              confirmAction?.(pending.user.id)
              setPending(null)
            },
          },
          {
            label: '취소',
            variant: 'outline',
            className: 'border-transparent bg-neutral-100',
            onClick: () => setPending(null),
          },
        ]}
      />
    </>
  )
}

export { FollowersModal, type FollowersModalProps, type FollowUser, type FollowTab }
