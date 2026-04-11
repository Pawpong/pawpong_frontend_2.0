'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationQueries } from './queries'
import { markAsRead, markAllAsRead, deleteNotification } from './api'

export const useNotifications = (isRead?: boolean, limit?: number) =>
  useInfiniteQuery(notificationQueries.list(isRead, limit))

export const useUnreadCount = () => useQuery(notificationQueries.unreadCount())

export const useMarkAsRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationQueries.all() })
    },
  })
}

export const useMarkAllAsRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationQueries.all() })
    },
  })
}

export const useDeleteNotification = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationQueries.all() })
    },
  })
}
