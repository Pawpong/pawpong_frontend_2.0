import { cn } from '@/shared/lib/cn'

/** 하단 CTA·오너 바의 버튼 폭 — 레일(inline) 안에서는 컬럼 폭을 그대로 쓰고, 고정 바에서만 시안의 최대 폭을 지킨다 */
export const getActionLayout = (isInline: boolean) =>
  cn('flex min-w-0 flex-1', !isInline && 'max-w-[18.5625rem] tab:max-w-[16.125rem]')
