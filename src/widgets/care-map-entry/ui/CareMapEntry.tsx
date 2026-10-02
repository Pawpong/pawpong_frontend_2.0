import Link from 'next/link'
import { Container } from '@/shared/ui'

export function CareMapEntry() {
  return (
    <Container className="py-4 tab:py-6">
      <section
        aria-label="우리 동네 돌봄 지도"
        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary-100 bg-secondary-50 px-5 py-5 tab:px-7"
      >
        <div className="flex items-center gap-4">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-500"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="size-7"
            >
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
              <path d="M12 6v8m-4-4h8" />
            </svg>
          </span>
          <div>
            <h2 className="text-base font-bold text-primary-900">우리 동네 돌봄 지도</h2>
            <p className="mt-1 text-xs leading-5 text-primary-700 tab:text-sm">
              가까운 동물병원과 보호시설을 한눈에 찾아보세요.
            </p>
          </div>
        </div>
        <div className="flex w-full gap-2 text-xs font-semibold tab:w-auto tab:text-sm">
          <Link
            href="/care-map"
            className="flex-1 rounded-xl bg-primary-500 px-4 py-3 text-center text-white hover:bg-primary-700"
          >
            동물병원 찾기 ↗
          </Link>
          <Link
            href="/care-map?kind=shelter"
            className="flex-1 rounded-xl border border-primary-200 bg-white px-4 py-3 text-center text-primary-700 hover:bg-secondary-100"
          >
            보호시설 찾기 ↗
          </Link>
        </div>
      </section>
    </Container>
  )
}
