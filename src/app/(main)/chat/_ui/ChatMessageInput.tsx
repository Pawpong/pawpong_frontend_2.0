'use client'

import * as React from 'react'
import { useUploadSingleFile } from '@/features/upload'
import { createClientMessageId } from '@/features/chat-realtime'
import { normalizeApiError } from '@/shared/api'
import { Button, CtaModal, Textarea } from '@/shared/ui'
import { LocationPinIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { inNativeAppWebView } from '@/shared/lib/nativeBridge'
import { isPhotoFile, preparePhoto } from '@/shared/lib/preparePhoto'
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
  /** 있으면 입력창 대신 이 안내를 보여준다 (차단·탈퇴 등으로 대화할 수 없는 방) */
  unavailableMessage?: string
}

const MAX_ATTACHMENT_SIZE = 100 * 1024 * 1024
/** 입력창이 늘어나는 최대 높이 — 넘으면 입력창 안에서 스크롤한다 (약 4줄) */
const MAX_INPUT_HEIGHT = 112

/** 터치 키보드 기기(모바일 웹·앱 WebView)에서는 Enter 를 줄바꿈으로 쓰고 전송은 버튼으로만 한다 */
const isTouchKeyboard = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 30_000,
  timeout: 10_000,
}

const roundCoordinate = (value: number) => Math.round(value * 100_000) / 100_000

const getLocationErrorMessage = (error: GeolocationPositionError) => {
  if (error.code === error.PERMISSION_DENIED) {
    return inNativeAppWebView()
      ? '위치 권한이 꺼져 있습니다. 휴대폰 설정에서 포퐁 앱의 위치 권한을 허용해주세요.'
      : '위치 권한이 꺼져 있습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
  }
  if (error.code === error.POSITION_UNAVAILABLE) {
    return '현재 위치를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.'
  }
  return '위치 확인 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.'
}

const ChatMessageInput = ({ onSend, disabled, unavailableMessage }: ChatMessageInputProps) => {
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
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // 줄 수에 맞춰 높이를 다시 잰다 — 전송 후 값이 비면 한 줄 높이로 돌아온다
  React.useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    // scrollHeight 는 테두리를 빼고 재므로 더해 줘야 한 줄일 때 스크롤바가 생기지 않는다
    const border = el.offsetHeight - el.clientHeight
    el.style.height = `${Math.min(el.scrollHeight + border, MAX_INPUT_HEIGHT)}px`
  }, [value])
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

  // PC: Enter 전송, Shift+Enter 줄바꿈 / 터치 키보드: Enter 는 기본 동작(줄바꿈)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && !isTouchKeyboard()) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  // 사진은 정리(축소·JPG·위치 메타데이터 제거) 후 사진 말풍선으로, 그 밖의 파일은 원본 그대로 파일 카드로 보낸다
  const handleAttachment = async (file: File) => {
    const messageType = isPhotoFile(file) ? 'image' : 'file'
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

  if (unavailableMessage) {
    return (
      <div className={cn('shrink-0 border-t border-neutral-150 bg-white py-4', CHAT_GUTTER_X)}>
        <p
          role="status"
          className={cn(
            CHAT_CONTENT_WIDTH,
            'text-center text-body-md font-medium text-neutral-500',
          )}
        >
          {unavailableMessage}
        </p>
      </div>
    )
  }

  return (
    <div className={cn('shrink-0 border-t border-neutral-150 bg-white py-3', CHAT_GUTTER_X)}>
      <div className={cn(CHAT_CONTENT_WIDTH, 'flex flex-col gap-2')}>
        {attachmentError && (
          <p role="alert" className="text-xs text-error-700">
            {attachmentError}
          </p>
        )}
        {pendingAttachment && (
          <div
            className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-xs text-neutral-700"
            role="status"
          >
            <span className="min-w-0 flex-1 truncate">
              {pendingAttachment.name} · {isSending ? '전송 확인 중' : '전송 대기'}
            </span>
            <Button
              intent="link"
              size="inline"
              disabled={isDisabled}
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
            </Button>
            <Button
              intent="ghost"
              size="inline"
              disabled={isSending}
              onClick={() => setPendingAttachment(null)}
            >
              닫기
            </Button>
          </div>
        )}
        {/* 댓글 입력창과 같은 구성 — 아바타 자리에 첨부(+), 공통 입력 필드, 따로 떨어진 전송 버튼.
            여러 줄로 늘어나면 첨부·전송 버튼은 마지막 줄에 맞춘다 */}
        <div className="flex items-end gap-2">
          {/* 첨부 메뉴 (+ 버튼 클릭 시 이미지/위치/파일) */}
          <ChatAttachMenu
            disabled={isDisabled || Boolean(pendingAttachment)}
            onSelectFile={handleAttachment}
            onSelectLocation={handleLocationRequest}
          />
          <Textarea
            ref={textareaRef}
            autoGrow
            rows={1}
            value={value}
            onChange={(e) => {
              textDraftId.current = null
              setValue(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              uploadFile.isPending ? '파일을 업로드하는 중입니다.' : '메시지를 입력하세요'
            }
            disabled={isDisabled}
            aria-label="메시지"
            className="min-w-0 flex-1"
          />
          <div className="flex min-w-14 shrink-0">
            <Button
              size="md"
              onClick={handleSubmit}
              disabled={isDisabled || !value.trim()}
              aria-busy={isSending}
              width="full"
            >
              {isSending ? '확인 중' : '보내기'}
            </Button>
          </div>
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
            intent: 'secondary',
            disabled: isLocating,
            onClick: () => setLocationModalOpen(false),
          },
          {
            label: isLocating ? '위치 확인 중' : '위치 공유',
            intent: 'primary',
            disabled: isLocating,
            onClick: handleLocationShare,
          },
        ]}
      />
    </div>
  )
}

export { ChatMessageInput }
