'use client'

import { useEffect } from 'react'
import { subscribeNativePushSession } from './nativePushSession'

/** 루트에서 한 번만 구독해 로그인 화면 밖에서도 RN 세션을 유지한다. */
export function NativePushSession() {
  useEffect(subscribeNativePushSession, [])
  return null
}
