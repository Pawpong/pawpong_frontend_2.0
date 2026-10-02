'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationQueries } from '@/entities/notification'
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from './notification.api'

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

export const useDeleteAllNotifications = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteAllNotifications,
    onSuccess: async () => {
      // 삭제 전 진행 중이던 조회와 누적 페이지를 비우고 목록·헤더 배지를 함께 갱신한다.
      await qc.resetQueries({ queryKey: notificationQueries.all() }, { cancelRefetch: true })
    },
  })
}
