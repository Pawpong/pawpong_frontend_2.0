import type { ContestEntry } from '@/shared/types'

/** 하단 설명 */
const EntryDescription = ({ entry }: { entry: ContestEntry }) => (
  <div className="shrink-0 bg-[#2f2f2f] px-5 py-3 tab:px-16 tab:py-8">
    <p className="text-sm leading-relaxed font-medium text-white">{entry.description}</p>
  </div>
)

export { EntryDescription }
