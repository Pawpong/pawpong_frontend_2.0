import { Chip } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { FILTER_TABS, type FilterTab } from '../_lib/constants'

interface ChatFilterTabsProps {
  value: FilterTab
  onChange: (tab: FilterTab) => void
  className?: string
}

const ChatFilterTabs = ({ value, onChange, className }: ChatFilterTabsProps) => {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-1.5', className)}
      role="group"
      aria-label="대화 필터"
    >
      {FILTER_TABS.map((tab) => (
        <Chip key={tab.value} selected={value === tab.value} onClick={() => onChange(tab.value)}>
          {tab.label}
        </Chip>
      ))}
    </div>
  )
}

export { ChatFilterTabs }
