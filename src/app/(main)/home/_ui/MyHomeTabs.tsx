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
    <div className="flex w-full items-center gap-8">
      <button
        type="button"
        onClick={() => onTabChange('posts')}
        className={cn(
          'relative flex flex-1 items-center justify-center p-2.5',
          activeTab === 'posts'
            ? 'after:absolute after:absolute after:bottom-[-2px] after:left-0 after:h-[3px] after:w-full after:bg-[#5d5d5d]'
            : '',
        )}
      >
        <span
          className={cn(
            'text-base leading-[1.375rem] text-[#5d5d5d] whitespace-nowrap',
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
          'relative flex flex-1 items-center justify-center gap-2.5 p-2.5',
          activeTab === 'breeders'
            ? 'after:absolute after:absolute after:bottom-[-1px] after:left-0 after:h-[3px] after:w-full after:bg-[#5d5d5d]'
            : '',
        )}
      >
        <span
          className={cn(
            'text-base leading-[1.375rem] text-[#5d5d5d] whitespace-nowrap',
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
