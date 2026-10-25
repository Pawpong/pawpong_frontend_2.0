/** 피드 카드 골격 — 화면 대부분이 이미지라 문구 한 줄보다 자리를 잡아두는 편이 덜 흔들린다 */
const CommunityFeedCardSkeleton = () => (
  <div className="flex animate-pulse flex-col overflow-hidden border-b border-neutral-100 bg-white py-6 tab:py-8">
    <div className="flex items-center gap-2 pb-4">
      <div className="size-10 shrink-0 rounded-full bg-neutral-150" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-24 rounded bg-neutral-150" />
        <div className="h-3 w-16 rounded bg-neutral-150" />
      </div>
    </div>
    <div className="mb-4 flex flex-col gap-2">
      <div className="h-4 w-4/5 rounded bg-neutral-100" />
      <div className="h-4 w-3/5 rounded bg-neutral-100" />
    </div>
    <div className="aspect-[4/3] max-h-[26rem] w-full rounded-xl bg-neutral-100" />
    <div className="flex gap-3 px-3 py-2">
      <div className="h-8 w-12 rounded bg-neutral-150" />
      <div className="h-8 w-12 rounded bg-neutral-150" />
      <div className="size-8 rounded bg-neutral-150" />
    </div>
    <div className="px-3 pb-3">
      <div className="h-3.5 w-2/3 rounded bg-neutral-150" />
    </div>
  </div>
)

export { CommunityFeedCardSkeleton }
