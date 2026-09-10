import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { DETAIL_TYPE } from '../_lib/detailTypography'

// 기록이 없을 때 브리더가 남긴 사유를 그대로 보여주는 안내 문구
const EmptyNote = ({ children }: { children: ReactNode }) => (
  <p className={cn(DETAIL_TYPE.sub, 'py-2')}>{children}</p>
)

export { EmptyNote }
