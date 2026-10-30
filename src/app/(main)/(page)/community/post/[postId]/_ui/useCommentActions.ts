'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  invalidateCommunityPostData,
  useDeleteCommunityComment,
  useUpdateCommunityComment,
} from '@/features/community'
import { isAuthReadSessionCurrent, type AuthReadSession } from '@/shared/lib/authReadSession'
import type { CommunityComment } from '@/shared/types'
import { commentActionFeedback, type CommentActionState } from './commentAction'

export function useCommentActions(
  postId: string,
  session: AuthReadSession | null,
  enabled: boolean,
  readComments: () => Promise<CommunityComment[]>,
) {
  const scope = JSON.stringify([postId, session?.scope])
  const context = useRef<{ scope: string; enabled: boolean } | null>({ scope, enabled })
  const queryClient = useQueryClient()
  const current = useRef<CommentActionState | null>(null)
  const flight = useRef<{ scope: string } | null>(null)
  const [stored, setStored] = useState<CommentActionState | null>(null)
  const [pending, setPending] = useState<{ scope: string; checking: boolean } | null>(null)
  const [notice, setNotice] = useState<{
    scope: string
    message: string
    commentId?: string
  } | null>(null)
  const active = stored?.scope === scope ? stored : null
  const update = useUpdateCommunityComment(active?.comment.commentId ?? '', postId, session)
  const remove = useDeleteCommunityComment(postId, session)
  useLayoutEffect(() => {
    context.current = { scope, enabled }
    return () => {
      context.current = null
    }
  }, [scope, enabled])
  const isCurrent = () =>
    context.current?.scope === scope && !!session && isAuthReadSessionCurrent(session)
  const busy = () => flight.current?.scope === scope
  const change = (next: CommentActionState | null) => {
    current.current = next
    setStored(next)
  }
  const canManage = (comment: CommunityComment) =>
    enabled &&
    !!session &&
    comment.postId === postId &&
    session?.identity ===
      JSON.stringify([comment.authorModel === 'Breeder' ? 'breeder' : 'adopter', comment.authorId])
  const canWrite = (comment: CommunityComment) =>
    context.current?.enabled === true && isCurrent() && canManage(comment)
  const sameIntent = (action: CommentActionState) =>
    isCurrent() && current.current?.intent === action.intent
  const finish = (action: CommentActionState, message: string, returnFocus = true) => {
    if (!sameIntent(action)) return
    change(null)
    setNotice({ scope, message, ...(returnFocus ? { commentId: action.comment.commentId } : {}) })
  }
  const start = (comment: CommunityComment, mode: CommentActionState['mode']) => {
    if (!canWrite(comment) || busy() || current.current?.scope === scope) return
    setNotice(null)
    change({ scope, intent: {}, mode, comment, draft: comment.body, attempted: false })
  }
  const cancel = () => {
    const action = current.current
    if (
      !action ||
      action.intent !== active?.intent ||
      action.scope !== scope ||
      busy() ||
      !isCurrent()
    )
      return
    finish(action, action.mode === 'edit' ? '댓글 수정을 취소했어요.' : '댓글 삭제를 취소했어요.')
  }
  const setDraft = (draft: string) => {
    const action = current.current
    if (
      !action ||
      action.intent !== active?.intent ||
      action.scope !== scope ||
      action.mode !== 'edit' ||
      busy() ||
      !isCurrent()
    )
      return
    change({ ...action, draft, error: undefined, attempted: false })
  }
  const submit = async () => {
    const action = current.current
    if (
      !action ||
      action.intent !== active?.intent ||
      action.scope !== scope ||
      busy() ||
      !canWrite(action.comment)
    )
      return
    const body = action.draft.trim()
    if (action.mode === 'edit' && !body) return
    const attempt = { scope }
    flight.current = attempt
    setPending({ scope, checking: false })
    change({ ...action, error: undefined, attempted: true })
    try {
      if (action.mode === 'edit') await update.mutateAsync({ body })
      else await remove.mutateAsync(action.comment.commentId)
      finish(
        action,
        action.mode === 'edit' ? '댓글을 수정했어요.' : '댓글을 삭제했어요.',
        action.mode === 'edit',
      )
    } catch (error) {
      if (sameIntent(action))
        change({ ...current.current!, error: commentActionFeedback(error, action.mode) })
    } finally {
      if (flight.current === attempt) {
        flight.current = null
        setPending(null)
      }
    }
  }
  const recheck = async () => {
    const action = current.current
    if (
      !action ||
      action.intent !== active?.intent ||
      action.scope !== scope ||
      busy() ||
      !isCurrent()
    )
      return
    const attempt = { scope }
    flight.current = attempt
    setPending({ scope, checking: true })
    try {
      const comments = await readComments()
      if (!sameIntent(action)) return
      void invalidateCommunityPostData(queryClient, postId)
      const latest = comments.find((comment) => comment.commentId === action.comment.commentId)
      if (action.mode === 'delete' && !latest) {
        finish(action, '현재 불러온 목록에서 댓글을 찾을 수 없어요.', false)
      } else if (
        action.mode === 'edit' &&
        action.attempted &&
        latest?.body === action.draft.trim()
      ) {
        finish(action, '현재 댓글에 수정한 내용이 반영되어 있어요.')
      } else {
        change({
          ...current.current!,
          error: latest
            ? '현재 댓글을 확인했어요. 내용을 확인한 뒤 다시 진행해 주세요.'
            : '현재 불러온 목록에서 댓글을 찾을 수 없어요. 입력한 내용은 유지돼요.',
        })
      }
    } catch {
      if (sameIntent(action))
        change({
          ...current.current!,
          error: '댓글 목록을 확인하지 못했어요. 잠시 후 다시 확인해 주세요.',
        })
    } finally {
      if (flight.current === attempt) {
        flight.current = null
        setPending(null)
      }
    }
  }
  return {
    active,
    canManage,
    start,
    cancel,
    setDraft,
    submit,
    recheck,
    isBusy: pending?.scope === scope,
    isChecking: pending?.scope === scope && pending.checking,
    notice: notice?.scope === scope ? notice : null,
  }
}

export type CommentActionsController = ReturnType<typeof useCommentActions>
