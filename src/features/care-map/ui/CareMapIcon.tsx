type IconName =
  | 'pin'
  | 'hospital'
  | 'shelter'
  | 'cafe'
  | 'travel'
  | 'stay'
  | 'search'
  | 'locate'
  | 'arrow'
  | 'phone'
  | 'close'

const paths: Record<IconName, string> = {
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  hospital: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z',
  shelter: 'm3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7',
  cafe: 'M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Zm12 1h2a2 2 0 0 1 0 4h-2M8 3v3m4-3v3M3 22h14',
  travel: 'm2 20 7-12 4 6 3-4 6 10H2ZM17 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z',
  stay: 'M3 6v14m0-4h18v4m0-4v-4a2 2 0 0 0-2-2h-8v6M6 12h2',
  search: 'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
  locate:
    'M12 2v3m0 14v3M2 12h3m14 0h3M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0ZM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  phone: 'M7 3H3c0 10 8 18 18 18v-4l-5-2-2 2a15 15 0 0 1-7-7l2-2-2-5Z',
  close: 'm6 6 12 12M6 18 18 6',
}

export function CareMapIcon({
  name,
  className = 'size-5',
}: {
  name: IconName
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
