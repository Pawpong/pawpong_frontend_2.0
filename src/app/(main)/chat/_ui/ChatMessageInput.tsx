'use client'

import * as React from 'react'
import { useDeleteFile, useUploadSingleFile } from '@/features/upload'
import { normalizeApiError } from '@/shared/api'
import { CtaModal, Input } from '@/shared/ui'
import { LocationPinIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import type { ChatMessageType } from '@/shared/types'
import { CHAT_CONTENT_WIDTH, CHAT_GUTTER_X } from '../_lib/constants'
import { serializeChatAttachment, type ChatLocationPayload } from '../_lib/attachment'
import { ChatAttachMenu } from './ChatAttachMenu'

interface ChatMessageInputProps {
  onSend: (content: string, messageType?: ChatMessageType) => boolean
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
  const uploadFile = useUploadSingleFile()
  const deleteFile = useDeleteFile()
  const isDisabled = disabled || uploadFile.isPending

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (onSend(trimmed)) setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleAttachment = async (file: File, messageType: 'image' | 'file') => {
    setAttachmentError(null)

    if (messageType === 'image' && !file.type.startsWith('image/')) {
      setAttachmentError('이미지 파일만 선택할 수 있습니다.')
      return
    }
    if (file.size > MAX_ATTACHMENT_SIZE) {
      setAttachmentError('첨부 파일은 100MB 이하만 전송할 수 있습니다.')
      return
    }

    try {
      const uploaded = await uploadFile.mutateAsync({ file, folder: 'chat' })
      const content = serializeChatAttachment({
        kind: messageType,
        // cdnUrl은 만료되는 signed URL이므로 영구 경로인 url을 본문에 저장한다.
        url: uploaded.url,
        name: file.name,
        size: uploaded.size || file.size,
        mimeType: file.type,
      })

      if (!onSend(content, messageType)) {
        try {
          await deleteFile.mutateAsync(uploaded.fileName)
        } catch {
          // 소켓 전송 실패가 사용자에게 더 중요하므로 정리 실패는 별도로 노출하지 않는다.
        }
        setAttachmentError('실시간 연결을 확인한 뒤 다시 첨부해주세요.')
      }
    } catch (error) {
      setAttachmentError(normalizeApiError(error, '파일 업로드에 실패했습니다.').message)
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
      ({ coords }) => {
        const payload: ChatLocationPayload = {
          kind: 'location',
          latitude: roundCoordinate(coords.latitude),
          longitude: roundCoordinate(coords.longitude),
          accuracy: Math.round(coords.accuracy),
        }
        const sent = onSend(serializeChatAttachment(payload), 'location')
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
        <div className="flex items-center gap-3">
          {/* 첨부 메뉴 (+ 버튼 클릭 시 이미지/위치/파일) */}
          <ChatAttachMenu
            disabled={isDisabled}
            onSelectFile={handleAttachment}
            onSelectLocation={handleLocationRequest}
          />

          {/* 입력 */}
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
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
            보내기
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
