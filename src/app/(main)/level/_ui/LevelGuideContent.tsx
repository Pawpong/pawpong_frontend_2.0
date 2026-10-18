'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ACTIVITY_LABELS,
  LEVEL_NOTICE,
  LevelIcon,
  activityConfigOptions,
  getActivityCatalog,
  type ActivityCatalog,
} from '@/entities/gamification'
import { useAuthStatus } from '@/features/auth'
import { SupportInquiryModal } from '@/features/inquiry'
import { AsyncState, Badge, Button, Container, DetailLink, NavigationBar } from '@/shared/ui'
import { FeatureIntro } from '@/shared/ui/FeatureIntro'

const BREEDER_KINDS = ['listing', 'listing_detail', 'consult_review', 'adoption_review']
const PER_EVENT_LIMIT: Record<string, string> = {
  contest: '대회당 1번',
  winner: '대회당 1번',
  consult_review: '신청당 1번',
  adoption_review: '신청당 1번',
}
const REVOKE_CASES = [
  '글·댓글을 지우거나 비공개로 바꾸면 그때 받은 EXP가 회수돼요.',
  '신고로 숨겨진 활동, 정지·탈퇴한 계정이 남긴 공감·후기도 회수돼요.',
  '지우고 다시 쓰거나 같은 사람이 공감을 취소했다 다시 눌러도 또 쌓이지 않아요.',
  'EXP가 줄면 레벨도 함께 내려갈 수 있어요. 바뀐 이유는 나의 활동 이력에서 볼 수 있어요.',
]

type Rule = ActivityCatalog['rules'][string]
const limitText = (kind: string, rule: Rule) => {
  if (rule.once) return '처음 1번'
  const caps = [rule.daily && `하루 ${rule.daily}번`, rule.monthly && `한 달 ${rule.monthly}번`]
  return caps.filter(Boolean).join(' · ') || PER_EVENT_LIMIT[kind] || '제한 없음'
}

const SectionTitle = ({ id, children }: { id: string; children: string }) => (
  <h2 id={id} className="font-cafe24 text-xl text-neutral-850 tab:text-2xl">
    {children}
  </h2>
)

const RuleList = ({ title, rules }: { title: string; rules: Array<[string, Rule]> }) => (
  <div>
    <h3 className="text-sm font-semibold text-primary-700">{title}</h3>
    <ul className="mt-2 divide-y divide-secondary-200 rounded-2xl border border-secondary-200 bg-white">
      {rules.map(([kind, rule]) => (
        <li key={kind} className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="min-w-0 text-sm font-semibold text-neutral-850">
            {ACTIVITY_LABELS[kind] ?? kind}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-neutral-700">{limitText(kind, rule)}</span>
            <Badge variant="primarySoft">+{rule.exp} EXP</Badge>
          </span>
        </li>
      ))}
    </ul>
  </div>
)

const LevelTable = ({ catalog }: { catalog: ActivityCatalog }) => (
  <ol className="grid gap-3 lap:grid-cols-2">
    {catalog.families.map((family) => {
      const levels = catalog.levels.filter((level) => level.family === family.key)
      if (levels.length === 0) return null
      return (
        <li
          key={family.key}
          className="rounded-2xl border border-secondary-200 bg-white p-4 tab:p-5"
        >
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-cafe24 text-lg text-primary-700">{family.name}</h3>
            <span className="text-xs font-semibold text-neutral-700">
              Lv.{levels[0].value}–{levels[levels.length - 1].value}
            </span>
          </div>
          <ol className="mt-3 grid grid-cols-5 gap-1.5 tab:gap-2">
            {levels.map((level) => (
              <li
                key={level.value}
                className="flex flex-col items-center gap-1 rounded-xl bg-secondary-50 px-1 py-2"
              >
                <span className="flex h-10 items-center">
                  <LevelIcon value={level.value} size={40} />
                </span>
                <span className="text-xs font-semibold text-neutral-850">Lv.{level.value}</span>
                <span className="text-[0.625rem] text-neutral-700">
                  {level.exp.toLocaleString()} EXP
                </span>
              </li>
            ))}
          </ol>
        </li>
      )
    })}
  </ol>
)

/** 활동 단계 안내 — 30단계 표, 적립·회수 기준, 레벨/EXP 문의. */
export function LevelGuideContent() {
  const config = useQuery(activityConfigOptions)
  const enabled = config.data?.enabled === true && !config.isError
  const catalog = useQuery({
    queryKey: ['gamification', 'catalog'],
    queryFn: ({ signal }) => getActivityCatalog(signal),
    enabled,
    retry: false,
    throwOnError: false,
  })
  const { userRole } = useAuthStatus()
  const [inquiryOpen, setInquiryOpen] = useState(false)

  // 나의 활동의 '레벨/EXP 문의' 링크(#inquiry)는 내용이 그려진 뒤에야 위치가 생긴다.
  // 라우터의 진입 스크롤이 끝난 다음 프레임에 옮겨야 덮어쓰이지 않는다.
  useEffect(() => {
    if (!catalog.isSuccess || window.location.hash !== '#inquiry') return
    const frame = requestAnimationFrame(() =>
      document.getElementById('inquiry')?.scrollIntoView({ block: 'start' }),
    )
    return () => cancelAnimationFrame(frame)
  }, [catalog.isSuccess])

  const rules = Object.entries(catalog.data?.rules ?? {})

  return (
    <div className="flex w-full flex-1 flex-col bg-white pb-12">
      <NavigationBar title="활동 단계" backHref="/my-activity" />
      <Container className="py-6 tab:py-10">
        <div className="mx-auto max-w-4xl space-y-8 tab:space-y-10">
          <FeatureIntro eyebrow="포퐁 활동 단계" title="함께한 활동이 단계가 돼요">
            글을 나누고, 공감을 받고, 새 가족을 이어줄 때마다 EXP가 쌓여 30단계로 올라가요.{' '}
            {LEVEL_NOTICE}
          </FeatureIntro>

          {/* 빈 화면 대신 불러오는 중·실패·준비 중을 공통 상태 블록으로 알린다 */}
          {config.isPending || (enabled && catalog.isPending) ? (
            <AsyncState status="loading" message="활동 단계 안내를 불러오고 있어요." />
          ) : config.isError || catalog.isError ? (
            <AsyncState
              status="error"
              message="활동 단계 안내를 불러오지 못했어요."
              onRetry={() => void (config.isError ? config.refetch() : catalog.refetch())}
              isRetrying={config.isFetching || catalog.isFetching}
            />
          ) : !enabled ? (
            <AsyncState
              status="empty"
              message="지금은 활동 단계 안내를 볼 수 없어요."
              action={<DetailLink href="/home" label="홈으로 가기" className="min-h-11" />}
            />
          ) : (
            catalog.data && (
              <div className="space-y-8 tab:space-y-10">
                <section aria-labelledby="level-table-title" className="space-y-4">
                  <SectionTitle id="level-table-title">30단계</SectionTitle>
                  <p className="text-sm leading-relaxed text-neutral-700">
                    5단계마다 배지 모양이 바뀌어요. 숫자는 그 단계가 되는 누적 EXP예요.
                  </p>
                  <LevelTable catalog={catalog.data} />
                </section>

                <section aria-labelledby="level-rules-title" className="space-y-4">
                  <SectionTitle id="level-rules-title">이렇게 쌓여요</SectionTitle>
                  <p className="text-sm leading-relaxed text-neutral-700">
                    하루·한 달 횟수는 한국 시간 기준이에요. 적립 알림은 따로 보내지 않고,
                    &lsquo;나의 활동&rsquo;에서 확인할 수 있어요.
                  </p>
                  <RuleList
                    title="모두"
                    rules={rules.filter(([kind]) => !BREEDER_KINDS.includes(kind))}
                  />
                  <RuleList
                    title="브리더"
                    rules={rules.filter(([kind]) => BREEDER_KINDS.includes(kind))}
                  />
                </section>

                <section aria-labelledby="level-revoke-title" className="space-y-4">
                  <SectionTitle id="level-revoke-title">이럴 땐 EXP가 회수돼요</SectionTitle>
                  <ul className="space-y-2 rounded-2xl border border-secondary-200 bg-white p-5">
                    {REVOKE_CASES.map((text) => (
                      <li
                        key={text}
                        className="flex gap-2 text-sm leading-relaxed text-neutral-700"
                      >
                        <span aria-hidden className="text-secondary-500">
                          •
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs leading-relaxed text-neutral-700">
                    레벨은 검색 순위·추천·이용 권한과 연결되지 않아요. 누적 EXP와 이력은 나만 볼 수
                    있어요.
                  </p>
                </section>

                <section
                  id="inquiry"
                  aria-labelledby="level-inquiry-title"
                  className="scroll-mt-20 rounded-2xl border border-secondary-300 bg-secondary-50 p-5 tab:p-8"
                >
                  <h2
                    id="level-inquiry-title"
                    className="font-cafe24 text-xl text-primary-700 tab:text-2xl"
                  >
                    레벨/EXP 문의
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                    쌓여야 할 EXP가 없거나 회수된 이유가 궁금하면 알려주세요. 관련 활동과 바뀐
                    내용을 남겨주시면 운영팀이 확인해요. 목표 처리 기한은 영업일 5일이에요.
                  </p>
                  <div className="mt-5">
                    <Button onClick={() => setInquiryOpen(true)}>레벨/EXP 문의하기</Button>
                  </div>
                </section>
              </div>
            )
          )}
        </div>
      </Container>

      <SupportInquiryModal
        audience={userRole === 'breeder' ? 'breeder' : 'adopter'}
        initialTopic="level_exp"
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
      />
    </div>
  )
}
