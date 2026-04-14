'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { noticeQueries } from './Queries'

export const useNoticeList = (limit?: number) => useInfiniteQuery(noticeQueries.list(limit))
export const useNoticeDetail = (noticeId: string) => useQuery(noticeQueries.detail(noticeId))
