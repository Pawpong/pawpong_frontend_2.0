import Link from 'next/link'

interface AdoptionCtaBarProps {
  listingId: string
  chatCount?: number
}

/* ── 하단 고정 CTA 바 (채팅 진입) ── */
const AdoptionCtaBar = ({ listingId, chatCount }: AdoptionCtaBarProps) => (
  <div className="fixed right-0 bottom-0 left-0 z-10 bg-white p-[1.25rem] tab:flex tab:items-center tab:justify-center tab:py-[1.4375rem]">
    <div className="flex items-center gap-[0.625rem] tab:w-auto">
      <Link
        href={`/adoption/${listingId}/apply`}
        className="flex h-12 flex-1 items-center justify-center rounded-full bg-[#d4d4d4] text-[1rem] font-semibold text-[#5d5d5d] tab:w-[29.75rem] tab:flex-initial"
      >
        대화중인 채팅 {chatCount}
      </Link>
    </div>
  </div>
)

export { AdoptionCtaBar }
