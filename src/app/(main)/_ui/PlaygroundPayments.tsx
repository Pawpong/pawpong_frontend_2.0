'use client'

import type { ReactNode } from 'react'
import { useMe } from '@/features/auth'
import { PurchaseProvider } from '@/features/in-app-purchase'

export function PlaygroundPayments({ children }: { children: ReactNode }) {
  const { isLoggedIn, me } = useMe()
  return (
    <PurchaseProvider memberId={isLoggedIn && me ? me.userId : null}>{children}</PurchaseProvider>
  )
}
