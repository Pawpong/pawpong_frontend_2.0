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
    <div className={cn('flex items-center gap-4', className)}>
      {FILTER_TABS.map((tab) => (
        <button key={tab.value} type="button" onClick={() => onChange(tab.value)}>
          <Badge
            variant={value === tab.value ? 'status' : 'filled'}
            className={cn('cursor-pointer', value === tab.value && 'bg-text-primary text-white')}
          >
            {tab.label}
          </Badge>
        </button>
      ))}
    </div>
  )
}

export { ChatFilterTabs }
