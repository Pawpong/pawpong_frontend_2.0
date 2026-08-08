'use client'

import * as React from 'react'
import { useDeleteFile, useUploadSingleFile } from '@/features/upload'
import { normalizeApiError } from '@/shared/api'
import { Input } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { ChatMessageType } from '@/shared/types'
import { CHAT_CONTENT_WIDTH, CHAT_GUTTER_X } from '../_lib/constants'
import { serializeChatAttachment } from '../_lib/attachment'
import { ChatAttachMenu } from './ChatAttachMenu'

interface ChatMessageInputProps {
  onSend: (content: string, messageType?: ChatMessageType) => boolean
  disabled?: boolean
}

const MAX_ATTACHMENT_SIZE = 100 * 1024 * 1024

const ChatMessageInput = ({ onSend, disabled }: ChatMessageInputProps) => {
  const [value, setValue] = React.useState('')
  const [attachmentError, setAttachmentError] = React.useState<string | null>(null)
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
        url: uploaded.cdnUrl,
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
          <ChatAttachMenu disabled={isDisabled} onSelectFile={handleAttachment} />

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
    </div>
  )
}

export { ChatMessageInput }
