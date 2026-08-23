'use client'

import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { communityQueries } from '@/entities/community'
import type {
  CommunityAuthorModel,
  CommunityComment,
  CreateCommunityCommentRequest,
  PaginationResponse,
  UpdateCommunityCommentRequest,
} from '@/shared/types'
import {
  createCommunityComment,
  updateCommunityComment,
  deleteCommunityComment,
} from './community.api'

interface OptimisticCommentAuthor {
  authorId: string
  authorModel: CommunityAuthorModel
  authorNickname: string
  authorProfileImageUrl?: string
}

interface CreateCommentVariables extends CreateCommunityCommentRequest {
  /** 낙관적으로 화면에 바로 얹을 댓글을 만드는 데만 쓴다 — 실제 API 요청 바디에는 안 실린다. */
  optimisticAuthor?: OptimisticCommentAuthor
}

type CommentsCache = InfiniteData<PaginationResponse<CommunityComment>>

/** 댓글 목록 캐시 마지막 페이지 끝에 새 댓글 하나를 붙인다. */
const appendComment = (data: CommentsCache | undefined, comment: CommunityComment) => {
  if (!data) {
    return {
      pageParams: [1],
      pages: [
        {
          items: [comment],
          pagination: {
            currentPage: 1,
            pageSize: 20,
            totalItems: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      ],
    } satisfies CommentsCache
  }

  const lastIndex = data.pages.length - 1
  const lastPage = data.pages[lastIndex]
  const pages = data.pages.slice()
  pages[lastIndex] = {
    ...lastPage,
    items: [...lastPage.items, comment],
    pagination: { ...lastPage.pagination, totalItems: lastPage.pagination.totalItems + 1 },
  }

  return { ...data, pages }
}

/**
 * 댓글 작성 (parentCommentId 있으면 답글) — 목록 카드의 commentCount·commentPreview까지 갱신.
 *
 * optimisticAuthor를 넘기면 요청이 끝나길 기다리지 않고 입력창 바로 아래에 댓글을 먼저 그린다
 * (인스타그램처럼 "쓰자마자 보이는" 흐름). 실패하면 원래 목록으로 되돌린다.
 *
 * postId가 'mock-'로 시작하는 로컬 목업 글(mockFeed)이면 실제 API를 아예 부르지 않는다 —
 * 백엔드가 없어 항상 실패할 요청이라, 방금 낙관적으로 그린 댓글이 onError로 되돌아가 버리는
 * 것을 막기 위해서다. 실제 게시글에는 영향이 없다.
 */
export const useCreateCommunityComment = (postId: string) => {
  const qc = useQueryClient()
  const listKey = communityQueries.comments(postId).queryKey
  const isMockPost = postId.startsWith('mock-')

  return useMutation({
    mutationFn: ({ optimisticAuthor: _optimisticAuthor, ...data }: CreateCommentVariables) =>
      isMockPost
        ? Promise.resolve({ commentId: `temp-${Date.now()}` })
        : createCommunityComment(postId, data),
    onMutate: async ({ body, parentCommentId, optimisticAuthor }) => {
      if (!optimisticAuthor) return undefined

      await qc.cancelQueries({ queryKey: listKey })
      const snapshot = qc.getQueryData<CommentsCache>(listKey)

      const optimisticComment: CommunityComment = {
        commentId: `temp-${Date.now()}`,
        postId,
        authorId: optimisticAuthor.authorId,
        authorModel: optimisticAuthor.authorModel,
        authorNickname: optimisticAuthor.authorNickname,
        authorProfileImageUrl: optimisticAuthor.authorProfileImageUrl,
        parentCommentId: parentCommentId ?? null,
        body,
        likeCount: 0,
        createdAt: new Date().toISOString(),
      }

      qc.setQueryData<CommentsCache>(listKey, (data) => appendComment(data, optimisticComment))

      return { snapshot }
    },
    onError: (_error, _variables, context) => {
      if (context) qc.setQueryData(listKey, context.snapshot)
    },
    onSettled: () => {
      if (isMockPost) return
      void qc.invalidateQueries({ queryKey: communityQueries.all() })
    },
  })
}

export const useUpdateCommunityComment = (commentId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCommunityCommentRequest) => updateCommunityComment(commentId, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityQueries.all() })
    },
  })
}

export const useDeleteCommunityComment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => deleteCommunityComment(commentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: communityQueries.all() })
    },
  })
}
