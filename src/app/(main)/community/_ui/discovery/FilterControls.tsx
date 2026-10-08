import { cn } from '@/shared/lib/cn'

export const filterPill = (selected: boolean) =>
  cn(
    'relative inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-sm whitespace-nowrap focus-ring touch-target transition-colors',
    selected
      ? 'border-primary-500 bg-secondary-200 font-bold text-primary-700'
      : 'border-neutral-200 bg-white font-medium text-neutral-700 hover:bg-secondary-50',
  )

export function FilterOptions<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Record<T, string>
  value: T | undefined
  onChange: (value: T | undefined) => void
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-sm font-semibold text-neutral-850">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(options) as T[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={value === key}
            onClick={() => onChange(value === key ? undefined : key)}
            className={filterPill(value === key)}
          >
            {options[key]}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
