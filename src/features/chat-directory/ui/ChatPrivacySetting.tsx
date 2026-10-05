'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizeApiError } from '@/shared/api'
import { Button, Switch } from '@/shared/ui'
import { getChatPrivacySettings, updateChatPrivacySettings } from '../api/chatDirectory.api'

/** 서버 기본값은 허용이며 저장 성공한 상태만 스위치에 반영한다. */
export function ChatPrivacySetting() {
  const client = useQueryClient()
  const key = ['chat', 'privacy'] as const
  const settings = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => getChatPrivacySettings(signal),
    retry: false,
  })
  const update = useMutation({
    mutationFn: updateChatPrivacySettings,
    onSuccess: (saved) => {
      client.setQueryData(key, saved)
      void client.invalidateQueries({ queryKey: ['chat', 'directory'] })
    },
  })
  const error = update.error ?? settings.error
  return (
    <div className="flex flex-col gap-2 px-4 py-4 tab:px-5">
      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor="chat-search-allowed"
          className="text-sm font-semibold text-neutral-850 tab:text-base"
        >
          닉네임 검색·새 채팅 허용
        </label>
        <Switch
          id="chat-search-allowed"
          checked={settings.data?.chatSearchAllowed ?? false}
          disabled={!settings.data || update.isPending}
          onCheckedChange={(allowed) => update.mutate(allowed)}
        />
      </div>
      <p className="text-xs leading-5 text-neutral-500 tab:text-sm">
        다른 사용자가 내 닉네임을 검색하고 새 대화를 시작할 수 있어요. 꺼도 기존 대화는 이어갈 수
        있어요.
      </p>
      {settings.isPending && (
        <p role="status" className="text-xs text-neutral-500">
          설정을 확인하는 중…
        </p>
      )}
      {update.isPending && (
        <p role="status" className="text-xs text-neutral-500">
          설정을 저장하는 중…
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-error-600">
          {normalizeApiError(error, '설정을 불러오거나 저장하지 못했어요.').message}
        </p>
      )}
      {settings.isError && (
        <Button size="sm" intent="secondary" onClick={() => void settings.refetch()}>
          다시 확인하기
        </Button>
      )}
    </div>
  )
}
