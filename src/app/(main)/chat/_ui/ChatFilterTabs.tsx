import { useAuthStatus } from '@/features/auth'
import { Chip } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { FILTER_TABS, type FilterTab } from '../_lib/constants'

interface ChatFilterTabsProps {
  value: FilterTab
  onChange: (tab: FilterTab) => void
  className?: string
}

const ChatFilterTabs = ({ value, onChange, className }: ChatFilterTabsProps) => {
  const { userRole } = useAuthStatus()
  // 일반(입양자끼리) 대화는 입양자에게만 생기므로 브리더에게는 탭을 숨긴다
  const tabs = FILTER_TABS.filter((tab) => tab.value !== 'general' || userRole === 'adopter')

  return (
    <div
      className={cn('flex flex-wrap items-center gap-1.5', className)}
      role="group"
      aria-label="대화 필터"
    >
      {tabs.map((tab) => (
        <Chip key={tab.value} selected={value === tab.value} onClick={() => onChange(tab.value)}>
          {tab.label}
        </Chip>
      ))}
    </div>
  )
}

export { ChatFilterTabs }
