'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCreateOrGetChatRoom } from '@/features/send-message'
import { normalizeApiError } from '@/shared/api'
import type { ChatRoomResponseDto } from '@/shared/types'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  ProfileAvatar,
} from '@/shared/ui'
import { searchChatUsers } from '@/features/chat-directory'

/** 역할과 관계없이 닉네임으로 상대를 선택하고 기존 방 또는 새 대화를 연다. */
export function ChatUserSearch({
  onSelectRoom,
}: {
  onSelectRoom: (room: ChatRoomResponseDto) => void
}) {
  const [open, setOpen] = useState(false)
  const [nickname, setNickname] = useState('')
  const [search, setSearch] = useState('')
  const startChat = useCreateOrGetChatRoom()
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(nickname.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [nickname])
  const users = useQuery({
    queryKey: ['chat', 'directory', search],
    queryFn: ({ signal }) => searchChatUsers(search, signal),
    enabled: open && !!search,
    staleTime: 0,
    retry: false,
  })
  const changeOpen = (next: boolean) => {
    if (startChat.isPending) return
    setOpen(next)
    setNickname('')
    setSearch('')
    startChat.reset()
  }
  return (
    <>
      <Button size="sm" intent="secondary" onClick={() => changeOpen(true)}>
        새 채팅
      </Button>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent
          className="max-h-[85dvh] overflow-y-auto"
          closeDisabled={startChat.isPending}
        >
          <DialogTitle>닉네임으로 대화 시작하기</DialogTitle>
          <DialogDescription>
            입양자와 브리더 모두 검색할 수 있어요. 검색과 새 채팅을 허용한 사용자만 보여요.
          </DialogDescription>
          <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-850">
            닉네임 검색
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={30}
              placeholder="상대방 닉네임을 입력해주세요"
              type="search"
              enterKeyHint="search"
              className="h-12 w-full rounded-lg border border-neutral-300 px-3 text-base font-normal focus-ring"
            />
          </label>
          <div
            className="flex min-h-24 flex-col gap-2"
            aria-live="polite"
            aria-busy={users.isFetching || startChat.isPending}
          >
            {!search ? (
              <p className="text-sm text-neutral-500">
                닉네임을 입력하면 대화 상대를 찾을 수 있어요.
              </p>
            ) : search !== nickname.trim() || users.isFetching ? (
              <p className="text-sm text-neutral-500">검색하는 중…</p>
            ) : users.isError ? (
              <p role="alert" className="text-sm text-error-600">
                {normalizeApiError(users.error, '사용자를 검색하지 못했어요.').message}
              </p>
            ) : !users.data?.length ? (
              <p className="text-sm text-neutral-500">
                검색 결과가 없어요. 닉네임을 다시 확인해주세요.
              </p>
            ) : (
              users.data.map((user) => (
                <button
                  key={user.userId}
                  type="button"
                  disabled={startChat.isPending}
                  className="flex min-h-16 items-center gap-3 rounded-lg border border-neutral-150 px-3 py-2 text-left focus-ring hover:bg-primary-50 disabled:opacity-50"
                  onClick={() =>
                    startChat.mutate(
                      { counterpartUserId: user.userId },
                      {
                        onSuccess: (room) => {
                          setOpen(false)
                          setNickname('')
                          setSearch('')
                          onSelectRoom(room)
                        },
                      },
                    )
                  }
                >
                  <ProfileAvatar size="small" src={user.profileImageUrl} alt={user.nickname} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-850">
                    {user.nickname}
                  </span>
                  <span className="text-xs text-neutral-500">대화하기</span>
                </button>
              ))
            )}
            {startChat.isPending && (
              <p role="status" className="text-sm text-neutral-500">
                대화를 여는 중…
              </p>
            )}
            {startChat.isError && (
              <p role="alert" className="text-sm text-error-600">
                {normalizeApiError(startChat.error, '채팅방을 열지 못했어요.').message}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
