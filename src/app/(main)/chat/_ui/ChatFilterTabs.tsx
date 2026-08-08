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
          <Badge
            variant={value === tab.value ? 'primaryFilled' : 'primaryOutline'}
            size="md"
            className={cn(
              'cursor-pointer pc:px-2 pc:py-1 pc:text-sm',
              value === tab.value ? 'pc:h-[1.8125rem]' : 'pc:h-8',
            )}
          >
            {tab.label}
          </Badge>
        </button>
      ))}
    </div>
  )
}

export { ChatFilterTabs }
