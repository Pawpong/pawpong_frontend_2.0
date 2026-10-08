'use client'
import { useQuery } from '@tanstack/react-query'
import {
  activityConfigOptions,
  getActivityCatalog,
  BreederLevelBadge,
  ACTIVITY_LABELS,
  LEVEL_NOTICE,
} from '@/entities/gamification'
import { AsyncState, DetailLink } from '@/shared/ui'
import { FeatureIntro } from '@/shared/ui/FeatureIntro'

// 레이아웃의 main 안에 들어가므로 랜드마크를 겹치지 않게 div로 감싼다.
const PAGE = 'mx-auto w-full max-w-4xl space-y-8 px-5 pt-6 pb-16 tab:px-8 tab:pt-10'
export function LevelGuideContent() {
  const config = useQuery(activityConfigOptions)
  const catalog = useQuery({
    queryKey: ['gamification', 'catalog'],
    queryFn: ({ signal }) => getActivityCatalog(signal),
    enabled: config.data?.enabled === true && !config.isError,
    retry: false,
    throwOnError: false,
  })
  // 빈 화면 대신 불러오는 중·실패·준비 중을 공통 상태 블록으로 알린다.
  const state =
    config.isPending || (config.data?.enabled && catalog.isPending) ? (
      <AsyncState status="loading" message="활동 단계 안내를 불러오고 있어요." />
    ) : config.isError || catalog.isError ? (
      <AsyncState
        status="error"
        message="활동 단계 안내를 불러오지 못했어요."
        onRetry={() => void (config.isError ? config.refetch() : catalog.refetch())}
        isRetrying={config.isFetching || catalog.isFetching}
      />
    ) : !config.data?.enabled ? (
      <AsyncState
        status="empty"
        message="지금은 활동 단계 안내를 볼 수 없어요."
        action={<DetailLink href="/home" label="홈으로 가기" className="min-h-11" />}
      />
    ) : null
  if (state) return <div className={PAGE}>{state}</div>
  return (
    <div className={PAGE}>
      <FeatureIntro eyebrow="포퐁 활동" title="포퐁 활동 단계">
        {LEVEL_NOTICE}
      </FeatureIntro>
      <section>
        <h2 className="mb-4 text-xl font-semibold">30단계와 누적 EXP</h2>
        <div className="grid grid-cols-2 gap-3 tab:grid-cols-3">
          {catalog.data?.levels.map((level) => (
            <div key={level.value} className="rounded-xl border border-primary-100 p-3">
              <BreederLevelBadge level={level} showFamily />
              <p className="mt-2 text-sm">{level.exp.toLocaleString()} EXP</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold">활동별 적립</h2>
        <ul className="space-y-3">
          {Object.entries(catalog.data?.rules ?? {}).map(([kind, rule]) => (
            <li
              key={kind}
              className="flex flex-wrap justify-between gap-2 border-b border-neutral-150 pb-2"
            >
              <span>
                {ACTIVITY_LABELS[kind] ?? kind} · +{rule.exp} EXP
              </span>
              <span className="text-sm text-neutral-600">
                {rule.once
                  ? '최초 1회'
                  : [rule.daily && `일 ${rule.daily}회`, rule.monthly && `월 ${rule.monthly}회`]
                      .filter(Boolean)
                      .join(' · ') ||
                    (['contest', 'winner'].includes(kind)
                      ? '대회당 1회'
                      : ['consult_review', 'adoption_review'].includes(kind)
                        ? '신청당 1회'
                        : '상한 없음')}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          분양글·분양 상세·상담 후기·입양 후기는 브리더 활동이에요. 나머지 활동은 입양자와
          브리더에게 공통으로 적용돼요. 일·월 상한은 한국 시간 기준이에요.
        </p>
      </section>
      <section className="space-y-3 text-sm leading-6">
        <h2 className="text-xl font-semibold">변경·회수와 문의</h2>
        <p>
          삭제·숨김 등으로 활동이 무효가 되면 EXP가 회수되고 레벨도 내려갈 수 있어요. 삭제 후
          재작성이나 같은 사람의 공감 취소·재공감으로 반복 적립할 수 없어요. 비활성·정지 계정의
          레벨은 공개하지 않아요.
        </p>
        <p>
          레벨은 검색 순위·추천·권한과 연결되지 않아요. 내 EXP와 최근 변경 이력은 마이홈에서 확인할
          수 있어요.
        </p>
        <p>레벨/EXP 이의 제기는 1:1 문의로 보내 주세요. 목표 처리 기한은 영업일 5일이에요.</p>
        <DetailLink href="/faq" label="레벨/EXP 문의하기" className="min-h-11" />
      </section>
      <DetailLink href="/home?tab=activity" label="마이홈에서 내 활동 보기" className="min-h-11" />
    </div>
  )
}
