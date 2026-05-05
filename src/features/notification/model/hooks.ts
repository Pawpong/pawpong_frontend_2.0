'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationQueries } from '@/entities/notification/Queries'
import { markAsRead, markAllAsRead, deleteNotification } from '@/entities/notification/Api'

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
