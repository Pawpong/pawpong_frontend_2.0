import { Badge } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { FILTER_TABS, type FilterTab } from '../_lib/constants'

interface ChatFilterTabsProps {
  value: FilterTab
  onChange: (tab: FilterTab) => void
  className?: string
}

const ChatFilterTabs = ({ value, onChange, className }: ChatFilterTabsProps) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {FILTER_TABS.map((tab) => (
        <button key={tab.value} type="button" onClick={() => onChange(tab.value)}>
          {/* 모바일 md(14px) → PC lg(16px) */}
          <Badge
            variant={value === tab.value ? 'active' : 'default'}
            size="md"
            className="cursor-pointer pc:h-auto pc:py-1 pc:text-base"
          >
            {tab.label}
          </Badge>
        </button>
      ))}
    </div>
  )
}

export { ChatFilterTabs }
