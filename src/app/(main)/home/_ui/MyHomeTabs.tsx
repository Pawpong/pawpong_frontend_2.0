'use client'

import { LockIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/Cn'

type TabType = 'posts' | 'breeders'

interface MyHomeTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const MyHomeTabs = ({ activeTab, onTabChange }: MyHomeTabsProps) => {
  return (
    <div className="flex h-8 w-full items-center gap-4 tab:h-auto tab:gap-8">
      <button
        type="button"
        onClick={() => onTabChange('posts')}
        className={cn(
          'relative flex h-full flex-1 min-w-px items-center justify-center px-1.5 py-2.5',
          activeTab === 'posts'
            ? 'border-b-2 border-[#5d5d5d] tab:border-b-0 tab:after:absolute tab:after:bottom-[-2px] tab:after:left-0 tab:after:h-[3px] tab:after:w-full tab:after:bg-[#5d5d5d]'
            : '',
        )}
      >
        <span
          className={cn(
            'text-sm leading-[1.375rem] text-[#5d5d5d] whitespace-nowrap tab:text-base',
            activeTab === 'posts' ? 'font-bold' : 'font-medium',
          )}
        >
          게시글
        </span>
      </button>
      <button
        type="button"
        onClick={() => onTabChange('breeders')}
        className={cn(
          'relative flex h-full flex-1 min-w-px items-center justify-center gap-2.5 px-1.5 py-2.5',
          activeTab === 'breeders'
            ? 'border-b-2 border-[#5d5d5d] tab:border-b-0 tab:after:absolute tab:after:bottom-[-1px] tab:after:left-0 tab:after:h-[3px] tab:after:w-full tab:after:bg-[#5d5d5d]'
            : '',
        )}
      >
        <span
          className={cn(
            'text-sm leading-[1.375rem] text-[#5d5d5d] whitespace-nowrap tab:text-base',
            activeTab === 'breeders' ? 'font-bold' : 'font-medium',
          )}
        >
          즐겨찾는 브리더
        </span>
        <LockIcon className="size-5 shrink-0 -translate-y-px text-[#5d5d5d]" />
      </button>
    </div>
  )
}

export { MyHomeTabs }
export type { TabType }
