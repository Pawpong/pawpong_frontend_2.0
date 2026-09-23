'use client'

import * as React from 'react'
import { useUploadSingleFile } from '@/features/upload'
import { createClientMessageId } from '@/features/chat-realtime'
import { normalizeApiError } from '@/shared/api'
import { CtaModal, Input } from '@/shared/ui'
import { LocationPinIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { preparePhoto } from '@/shared/lib/preparePhoto'
import type { ChatMessageType } from '@/shared/types'
import { CHAT_CONTENT_WIDTH, CHAT_GUTTER_X } from '../_lib/constants'
import { serializeChatAttachment, type ChatLocationPayload } from '../_lib/attachment'
import { ChatAttachMenu } from './ChatAttachMenu'

interface ChatMessageInputProps {
  onSend: (
    content: string,
    messageType?: ChatMessageType,
    clientMessageId?: string,
  ) => Promise<boolean>
  disabled?: boolean
}

const MAX_ATTACHMENT_SIZE = 100 * 1024 * 1024

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 30_000,
  timeout: 10_000,
}

const roundCoordinate = (value: number) => Math.round(value * 100_000) / 100_000

const getLocationErrorMessage = (error: GeolocationPositionError) => {
  if (error.code === error.PERMISSION_DENIED) {
    return '위치 권한이 꺼져 있습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return '현재 위치를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.'
  }
  return '위치 확인 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.'
}

const ChatMessageInput = ({ onSend, disabled }: ChatMessageInputProps) => {
  const [value, setValue] = React.useState('')
  const [attachmentError, setAttachmentError] = React.useState<string | null>(null)
  const [locationModalOpen, setLocationModalOpen] = React.useState(false)
  const [locationError, setLocationError] = React.useState<string | null>(null)
  const [isLocating, setIsLocating] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  const [isPreparingAttachment, setIsPreparingAttachment] = React.useState(false)
  const sending = React.useRef(false)
  const preparingAttachment = React.useRef(false)
  const textDraftId = React.useRef<string | null>(null)
  const [pendingAttachment, setPendingAttachment] = React.useState<{
    content: string
    type: 'image' | 'file' | 'location'
    name: string
    clientMessageId: string
  } | null>(null)
  const uploadFile = useUploadSingleFile()
  const isDisabled = disabled || uploadFile.isPending || isSending || isPreparingAttachment

  const send = async (content: string, type: ChatMessageType, clientMessageId: string) => {
    if (sending.current || disabled) return false
    sending.current = true
    setIsSending(true)
    try {
      return await onSend(content, type, clientMessageId)
    } catch {
      setAttachmentError('전송을 확인하지 못했어요. 대화 내역을 확인한 뒤 다시 보내주세요.')
      return false
    } finally {
      sending.current = false
      setIsSending(false)
    }
  }

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed || isDisabled) return
    const clientMessageId = textDraftId.current ?? createClientMessageId()
    textDraftId.current = clientMessageId
    if (await send(trimmed, 'text', clientMessageId)) {
      textDraftId.current = null
      setValue((current) => (current === value ? '' : current))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  const handleAttachment = async (file: File, messageType: 'image' | 'file') => {
    if (isDisabled || preparingAttachment.current) return
    setAttachmentError(null)

    if (file.size > MAX_ATTACHMENT_SIZE) {
      setAttachmentError('첨부 파일은 100MB 이하만 전송할 수 있습니다.')
      return
    }

    preparingAttachment.current = true
    setIsPreparingAttachment(true)
    try {
      const attachmentFile = messageType === 'image' ? await preparePhoto(file) : file
      const uploaded = await uploadFile.mutateAsync({ file: attachmentFile, folder: 'chat' })
      const content = serializeChatAttachment({
        kind: messageType,
        // cdnUrl은 만료되는 signed URL이므로 영구 경로인 url을 본문에 저장한다.
        url: uploaded.url,
        name: attachmentFile.name,
        size: uploaded.size || attachmentFile.size,
        mimeType: attachmentFile.type,
      })

      const clientMessageId = createClientMessageId()
      setPendingAttachment({
        content,
        type: messageType,
        name: attachmentFile.name,
        clientMessageId,
      })
      if (await send(content, messageType, clientMessageId)) setPendingAttachment(null)
      // 응답 유실이어도 이미 저장된 메시지가 참조할 수 있어 파일을 삭제하지 않는다.
    } catch (error) {
      setAttachmentError(normalizeApiError(error, '파일 업로드에 실패했습니다.').message)
    } finally {
      preparingAttachment.current = false
      setIsPreparingAttachment(false)
    }
  }

  const handleLocationRequest = () => {
    setAttachmentError(null)
    setLocationError(null)
    setLocationModalOpen(true)
  }

  const handleLocationShare = () => {
    setLocationError(null)

    if (!('geolocation' in navigator)) {
      setLocationError('이 브라우저에서는 위치 공유를 지원하지 않습니다.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const payload: ChatLocationPayload = {
          kind: 'location',
          latitude: roundCoordinate(coords.latitude),
          longitude: roundCoordinate(coords.longitude),
          accuracy: Math.round(coords.accuracy),
        }
        const content = serializeChatAttachment(payload)
        const clientMessageId = createClientMessageId()
        setPendingAttachment({ content, type: 'location', name: '현재 위치', clientMessageId })
        const sent = await send(content, 'location', clientMessageId)
        if (sent) setPendingAttachment(null)
        setIsLocating(false)
        setLocationModalOpen(false)
        if (!sent) {
          setAttachmentError('실시간 연결을 확인한 뒤 다시 위치를 공유해주세요.')
        }
      },
      (error) => {
        setIsLocating(false)
        setLocationError(getLocationErrorMessage(error))
      },
      GEOLOCATION_OPTIONS,
    )
  }

  return (
    <div className={cn('bg-white py-3', CHAT_GUTTER_X)}>
      <div className={cn(CHAT_CONTENT_WIDTH, 'flex flex-col gap-2')}>
        {attachmentError && (
          <p role="alert" className="text-xs text-error-700">
            {attachmentError}
          </p>
        )}
        {pendingAttachment && (
          <div className="flex items-center gap-2 text-xs" role="status">
            <span className="min-w-0 flex-1 truncate">
              {pendingAttachment.name} · {isSending ? '전송 확인 중' : '전송 대기'}
            </span>
            <button
              type="button"
              disabled={isDisabled}
              className="shrink-0 underline disabled:opacity-50"
              onClick={async () => {
                if (
                  await send(
                    pendingAttachment.content,
                    pendingAttachment.type,
                    pendingAttachment.clientMessageId,
                  )
                )
                  setPendingAttachment(null)
              }}
            >
              다시 보내기
            </button>
            <button
              type="button"
              disabled={isSending}
              className="shrink-0 underline"
              onClick={() => setPendingAttachment(null)}
            >
              닫기
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          {/* 첨부 메뉴 (+ 버튼 클릭 시 이미지/위치/파일) */}
          <ChatAttachMenu
            disabled={isDisabled || Boolean(pendingAttachment)}
            onSelectFile={handleAttachment}
            onSelectLocation={handleLocationRequest}
          />

          {/* 입력 */}
          <Input
            value={value}
            onChange={(e) => {
              textDraftId.current = null
              setValue(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            placeholder={uploadFile.isPending ? '파일을 업로드하는 중입니다.' : '입력해보세요'}
            disabled={isDisabled}
            className="flex-1"
          />

          {/* 보내기 버튼 */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isDisabled || !value.trim()}
            className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-neutral-850 p-2 text-base leading-[1.5] font-semibold text-neutral-50 disabled:cursor-not-allowed"
          >
            {isSending ? '확인 중' : '보내기'}
          </button>
        </div>
      </div>

      <CtaModal
        open={locationModalOpen}
        onOpenChange={(open) => {
          if (!isLocating) setLocationModalOpen(open)
        }}
        title="현재 위치를 공유할까요?"
        description={
          <span className="flex flex-col gap-2">
            <span>
              Pawpong은 현재 좌표만 대화 상대에게 전송하며, 이동 경로는 수집하지 않습니다.
            </span>
            {locationError && (
              <span role="alert" className="text-sm text-error-700">
                {locationError}
              </span>
            )}
          </span>
        }
        icon={<LocationPinIcon className="size-8 text-primary-500" />}
        showClose={!isLocating}
        direction="row"
        actions={[
          {
            label: '취소',
            variant: 'outline',
            disabled: isLocating,
            onClick: () => setLocationModalOpen(false),
          },
          {
            label: isLocating ? '위치 확인 중' : '위치 공유',
            variant: 'fill',
            disabled: isLocating,
            onClick: handleLocationShare,
          },
        ]}
      />
    </div>
  )
}

export { ChatMessageInput }
