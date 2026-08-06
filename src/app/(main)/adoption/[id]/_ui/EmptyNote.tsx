import type { ReactNode } from 'react'

// 기록이 없을 때 표시하는 안내 문구
const EmptyNote = ({ children }: { children: ReactNode }) => (
  <p className="py-[0.5rem] text-[0.875rem] leading-[1.375rem] font-medium text-[#a4a4a4]">
    {children}
  </p>
)

export { EmptyNote }
