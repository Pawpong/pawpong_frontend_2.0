import type { CommunityComment } from '@/shared/types'

export interface CommentThread {
  parentId: string
  root: CommunityComment | null
  replies: CommunityComment[]
  createdAt: string
}

export interface CommentReplyTarget {
  commentId: string
  nickname: string
}

export class CommentIntentError extends Error {}

export function buildCommentTree(comments: CommunityComment[]) {
  const repliesByParent = comments.reduce<Record<string, CommunityComment[]>>((acc, comment) => {
    if (comment.parentCommentId) (acc[comment.parentCommentId] ??= []).push(comment)
    return acc
  }, {})
  const loadedIds = new Set(comments.map((comment) => comment.commentId))
  const threads: CommentThread[] = comments
    .filter((comment) => !comment.parentCommentId)
    .map((root) => ({
      parentId: root.commentId,
      root,
      replies: repliesByParent[root.commentId] ?? [],
      createdAt: root.createdAt,
    }))
  // 삭제된 부모 아래의 답글도 목록에서 사라지지 않게 한다.
  Object.entries(repliesByParent).forEach(([parentId, replies]) => {
    if (!loadedIds.has(parentId))
      threads.push({ parentId, root: null, replies, createdAt: replies[0].createdAt })
  })
  threads.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  return { threads, loadedIds }
}
