import type { CommunityRecordSummary } from '../model/communityRecords'
import { CommunityPixelIcon } from './CommunityPixelIcon'

/** 산책·병원·생활 기록 한 건을 작성자가 적은 값 그대로 보여 준다. */
export function CommunityRecordCard({ summary }: { summary: CommunityRecordSummary }) {
  return (
    <section
      aria-label={summary.title}
      className="rounded-xl border border-primary-200 bg-secondary-50 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-cafe24 text-sm text-primary-700">
          <CommunityPixelIcon name={summary.kind} className="text-primary-500" />
          {summary.title}
        </h3>
        <span className="text-xs font-medium text-neutral-700">{summary.date}</span>
      </div>
      {summary.facts.length > 0 && (
        <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
          {summary.facts.map((fact) => (
            <div key={fact.label} className="contents">
              <dt className="font-medium text-neutral-700">{fact.label}</dt>
              <dd className="min-w-0 font-semibold break-words text-neutral-850">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
