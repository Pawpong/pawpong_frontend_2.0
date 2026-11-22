import { useAuthStatus } from '@/shared/lib/useAuthStatus'
import { FilterTab } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { FILTER_TABS, type ChatFilter } from '../_lib/constants'

interface ChatFilterTabsProps {
  value: ChatFilter
  onChange: (tab: ChatFilter) => void
  className?: string
}

// 탐색·홈 분양 목록과 같은 30px 필터 칩. 좁은 폭에서도 줄바꿈하지 않고 옆으로 민다
const ChatFilterTabs = ({ value, onChange, className }: ChatFilterTabsProps) => {
  const { userRole } = useAuthStatus()
  // 일반(입양자끼리) 대화는 입양자에게만 생기므로 브리더에게는 탭을 숨긴다
  const tabs = FILTER_TABS.filter((tab) => tab.value !== 'general' || userRole === 'adopter')

  return (
    <div
      className={cn('-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 py-0.5', className)}
      role="group"
      aria-label="대화 필터"
    >
      {tabs.map((tab) => (
        <FilterTab
          key={tab.value}
          look="chip"
          selected={value === tab.value}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </FilterTab>
      ))}
    </div>
  )
}

export { ChatFilterTabs }
