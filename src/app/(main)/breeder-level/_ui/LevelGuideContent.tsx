'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  activityConfigOptions,
  getActivityCatalog,
  BreederLevelBadge,
  ACTIVITY_LABELS,
  LEVEL_NOTICE,
} from '@/entities/gamification'
export function LevelGuideContent() {
  const config = useQuery(activityConfigOptions)
  const catalog = useQuery({
    queryKey: ['gamification', 'catalog'],
    queryFn: ({ signal }) => getActivityCatalog(signal),
    enabled: config.data?.enabled === true && !config.isError,
    retry: false,
    throwOnError: false,
  })
  if (!config.data?.enabled || config.isError || catalog.isError) return null
  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <header>
        <h1 className="font-cafe24 text-3xl">포퐁 활동 단계</h1>
        <p className="mt-4 text-sm leading-6">{LEVEL_NOTICE}</p>
      </header>
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
        <Link className="underline" href="/faq">
          레벨/EXP 문의하기
        </Link>
      </section>
      <Link className="inline-block underline" href="/home?tab=activity">
        마이홈에서 내 활동 보기
      </Link>
    </main>
  )
}
