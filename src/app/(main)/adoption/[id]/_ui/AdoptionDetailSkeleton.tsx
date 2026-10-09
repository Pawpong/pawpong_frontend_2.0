import { Container } from '@/shared/ui'
import { SkeletonBlock } from '@/shared/ui/Skeleton'

/**
 * 분양 상세를 불러오는 동안 실제 화면과 같은 틀(왼쪽 사진·이름·상담 버튼, 오른쪽 설명 카드)로 자리를 잡는다.
 * 공유 링크로 처음 들어온 사람에게 글자 한 줄 대신 곧 나올 화면의 모양을 먼저 보여준다.
 */
export function AdoptionDetailSkeleton() {
  return (
    <div role="status" aria-busy="true" className="pb-24 lap:pb-10">
      <span className="sr-only">분양글을 불러오는 중이에요.</span>
      {/* 빈 칸은 SkeletonBlock 이 각자 aria-hidden 이라 낭독기에는 안내 문구만 읽힌다. */}
      <Container className="px-4 py-4 lap:flex lap:items-start lap:gap-8 lap:py-8 pc:gap-10 pc:py-10">
        <div className="-mx-4 flex flex-col gap-4 tab:mx-0 lap:w-[20rem] lap:shrink-0 pc:w-[24rem]">
          <SkeletonBlock className="aspect-[375/279] w-full rounded-none tab:aspect-square tab:rounded-lg" />
          <div className="space-y-3 px-4 tab:px-0">
            <SkeletonBlock className="h-7 w-2/3 rounded" />
            <SkeletonBlock className="h-4 w-1/2 rounded" />
            <SkeletonBlock className="h-12 w-full" />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-6 pt-6 lap:pt-0">
          <SkeletonBlock className="h-6 w-1/3 rounded" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-40 w-full rounded-xl" />
        </div>
      </Container>
    </div>
  )
}
