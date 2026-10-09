import { SkeletonBlock } from '@/shared/ui/Skeleton'
import { HomeColumns } from './HomeColumns'

/**
 * 마이홈·다른 회원 홈의 프로필을 불러오는 동안 실제와 같은 2단 틀(왼쪽 프로필·메뉴, 오른쪽 글 격자)로 자리를 잡는다.
 * 빈 칸은 각자 aria-hidden 이라 낭독기에는 안내 문구만 읽힌다.
 */
export function HomeSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">프로필을 불러오는 중이에요.</span>
      <HomeColumns
        // 불러오는 동안은 스크롤할 내용이 없어 고정 위치 계산이 필요 없다.
        stickyTop={0}
        sidebar={
          <div className="space-y-3">
            <SkeletonBlock className="size-20 rounded-full" />
            <SkeletonBlock className="h-6 w-2/3 rounded" />
            <SkeletonBlock className="h-4 w-1/2 rounded" />
            <SkeletonBlock className="h-4 w-full rounded" />
            <div className="hidden space-y-2 pt-3 tab:block">
              {[0, 1, 2, 3].map((index) => (
                <SkeletonBlock key={index} className="h-9 w-full" />
              ))}
            </div>
          </div>
        }
      >
        <div className="px-4 tab:px-0">
          <SkeletonBlock className="mb-4 h-10 w-full tab:hidden" />
          <div className="grid grid-cols-3 gap-1 tab:gap-3 pc:grid-cols-4 pc:gap-5">
            {Array.from({ length: 6 }, (_, index) => (
              <SkeletonBlock
                key={index}
                className="aspect-square w-full rounded-none pc:rounded-lg"
              />
            ))}
          </div>
        </div>
      </HomeColumns>
    </div>
  )
}
