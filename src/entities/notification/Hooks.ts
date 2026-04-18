'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { notificationQueries } from './Queries'

export const useNotifications = (isRead?: boolean, limit?: number) =>
  useInfiniteQuery(notificationQueries.list(isRead, limit))

export const useUnreadCount = () => useQuery(notificationQueries.unreadCount())
