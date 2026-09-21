'use client'

import { useId } from 'react'
import { tv } from 'tailwind-variants'

const card = tv({
  base: 'flex min-h-20 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-500 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
  variants: {
    selected: {
      true: 'border-primary-500 bg-primary-50',
      false: 'border-neutral-150 bg-white hover:bg-neutral-50',
    },
  },
})

interface RadioCardGroupProps {
  name: string
  label: string
  value: string
  options: { value: string; label: string; description?: string }[]
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
}

export const RadioCardGroup = ({
  name,
  label,
  value,
  options,
  onChange,
  onBlur,
  error,
}: RadioCardGroupProps) => {
  const id = useId()
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-3 text-sm font-semibold text-neutral-850">
        {label} <span className="font-normal text-primary-600">필수</span>
      </legend>
      <div className="grid gap-3 tab:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className={card({ selected: value === option.value })}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              onBlur={onBlur}
              className="mt-0.5 size-4 shrink-0 accent-primary-500"
            />
            <span>
              <span className="block text-sm font-semibold text-neutral-850">{option.label}</span>
              {option.description && (
                <span className="mt-1 block text-xs leading-relaxed text-neutral-700">
                  {option.description}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-error-500">
          {error}
        </p>
      )}
    </fieldset>
  )
}
