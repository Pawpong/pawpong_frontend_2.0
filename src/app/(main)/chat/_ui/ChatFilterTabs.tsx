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
    <div
      className={cn('flex flex-wrap items-center gap-1.5', className)}
      role="group"
      aria-label="대화 필터"
    >
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          aria-pressed={value === tab.value}
          onClick={() => onChange(tab.value)}
          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <Badge
            variant={value === tab.value ? 'pointFilled' : 'default'}
            size="lg"
            className={cn(
              'h-8 cursor-pointer px-3 text-sm transition-colors',
              value !== tab.value && 'border-neutral-150 text-neutral-700 hover:bg-neutral-50',
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
