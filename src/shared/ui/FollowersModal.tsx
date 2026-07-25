'use client'

import { useState } from 'react'
import Link from 'next/link'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Dialog, DialogPortal, DialogOverlay, DialogClose } from '@/shared/ui'
import { ProfileAvatar } from './ProfileAvatar'
import { Button } from './Button'
import { FollowButton } from './FollowButton'
import { TextLabel } from './TextLabel'
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
}

const TABS: { key: FollowTab; label: string }[] = [
  { key: 'followers', label: '팔로워' },
  { key: 'following', label: '팔로잉' },
]

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
}: FollowersModalProps) => {
  const [tab, setTab] = useState<FollowTab>(defaultTab)
  // 삭제 확인 대상 (있으면 확인 모달 노출)
  const [pendingRemove, setPendingRemove] = useState<FollowUser | null>(null)

  const counts: Record<FollowTab, number> = {
    followers: followerCount,
    following: followingCount,
  }
  const users = tab === 'followers' ? followers : following

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
          <DialogPrimitive.Content
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="fixed top-1/2 left-1/2 z-50 flex h-[min(40.875rem,90vh)] w-[min(46.0625rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.25rem] bg-white shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]"
          >
            <DialogPrimitive.Title className="sr-only">팔로워·팔로잉 목록</DialogPrimitive.Title>

            {/* 닫기 */}
            <div className="flex h-12 shrink-0 items-center justify-end px-6 py-3">
              <DialogClose aria-label="닫기">
                <CloseIcon className="size-6 text-[#3e3e3e]" />
              </DialogClose>
            </div>

            {/* 탭 */}
            <div className="flex shrink-0 border-b border-[#e4e4e4] px-12">
              {TABS.map(({ key, label }) => {
                const active = tab === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={cn(
                      'flex flex-1 flex-col items-center justify-center px-3 py-2',
                      active && 'border-b border-[#3e3e3e]',
                    )}
                  >
                    <span
                      className={cn(
                        'text-base leading-[1.5]',
                        active ? 'font-semibold text-[#3e3e3e]' : 'font-medium text-[#a6a6a6]',
                      )}
                    >
                      {label}
                    </span>
                    <span
                      className={cn(
                        'text-sm leading-[1.5]',
                        active ? 'font-semibold text-[#3e3e3e]' : 'font-medium text-[#a6a6a6]',
                      )}
                    >
                      {counts[key]}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* 목록 */}
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-12 py-8">
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
                      onClick={() => setPendingRemove(user)}
                      className="shrink-0 font-medium text-[#a6a6a6]"
                    >
                      삭제
                    </Button>
                  ) : (
                    <FollowButton
                      status={user.mutual ? 'mutual' : 'following'}
                      size="sm"
                      onClick={() => onUnfollow?.(user.id)}
                      className="w-[4.5625rem] shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      {/* 팔로워 삭제 확인 (공통 CtaModal) */}
      <CtaModal
        open={!!pendingRemove}
        onOpenChange={(o) => !o && setPendingRemove(null)}
        showClose={false}
        iconBare
        icon={
          pendingRemove && (
            <ProfileAvatar
              size="large"
              src={pendingRemove.profileImageUrl}
              alt={pendingRemove.nickname}
            />
          )
        }
        title={
          <>
            <span className="font-bold">{pendingRemove?.nickname}님</span> 을 삭제 하시겠어요?
          </>
        }
        titleClassName="text-base"
        direction="row"
        actions={[
          {
            label: '삭제',
            variant: 'outline',
            className: 'text-[#d63d4a]',
            onClick: () => {
              if (pendingRemove) onRemoveFollower?.(pendingRemove.id)
              setPendingRemove(null)
            },
          },
          {
            label: '취소',
            variant: 'outline',
            className: 'border-transparent bg-[#ededed]',
            onClick: () => setPendingRemove(null),
          },
        ]}
      />
    </>
  )
}

export { FollowersModal, type FollowersModalProps, type FollowUser, type FollowTab }
