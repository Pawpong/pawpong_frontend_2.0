'use client'
import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getActivity,
  synchronizeActivity,
  displayActivityBadges,
  type ActivitySession,
  PixelActivityBadge,
  ACTIVITY_LABELS,
  getActivityCatalog,
} from '@/entities/gamification'
import { Button, DetailLink, PixelProgressBar } from '@/shared/ui'
import { cafe24Proup } from '@/shared/lib/fonts'
import styles from './activity.module.css'

export function ActivityDashboard({ session }: { session: ActivitySession }) {
  const client = useQueryClient()
  const key = ['gamification', 'private', session.scope]
  const mutationKey = ['gamification', 'write', session.scope]
  const writing = useIsMutating({ mutationKey }) > 0
  const view = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => synchronizeActivity(session, signal),
    refetchOnMount: 'always',
    enabled: !writing,
    retry: false,
    throwOnError: false,
    gcTime: 0,
    refetchOnWindowFocus: true,
  })
  const cancelReads = () => client.cancelQueries({ queryKey: key, exact: true })
  const saveView = async (data: Awaited<ReturnType<typeof getActivity>>) => {
    // Cancel again in case focus/reconnect started another read while a mutation was pending.
    await cancelReads()
    client.setQueryData(key, data)
    void client.invalidateQueries({ queryKey: ['gamification', 'public'] })
  }
  const sync = useMutation({
    mutationKey,
    mutationFn: () => synchronizeActivity(session),
    onMutate: cancelReads,
    onSuccess: saveView,
  })
  const display = useMutation({
    mutationKey,
    mutationFn: (keys: string[]) => displayActivityBadges(session, keys),
    onMutate: cancelReads,
    onSuccess: saveView,
  })
  const catalog = useQuery({
    queryKey: ['gamification', 'catalog'],
    queryFn: ({ signal }) => getActivityCatalog(signal),
    retry: false,
    throwOnError: false,
  })
  const data = view.data
  const floor = catalog.data?.levels.find((level) => level.value === data?.level?.value)?.exp
  const ceiling = data?.level?.nextExp
  const progress =
    floor !== undefined && ceiling != null
      ? Math.max(0, Math.min(100, (((data?.totalExp ?? 0) - floor) / (ceiling - floor)) * 100))
      : 0
  const busy = writing || sync.isPending || display.isPending
  const earned = data?.badges.filter((badge) => badge.state === 'earned') ?? []
  const error = view.error ?? sync.error ?? display.error
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className="text-xs font-bold tracking-wider">PAWPONG / 나의 발걸음</p>
        <h1 className={cafe24Proup.className}>작은 이야기가, 나만의 배지로</h1>
        <p>
          우리 아이와 함께한 활동을 모아요. 경험을 나누고 업적을 채우면 도트 배지가 생겨요. 대표
          배지는 커뮤니티에서 나를 소개해요.
        </p>
        {data?.level && (
          <div className="my-5 space-y-3">
            {/* 레벨 배지는 마이홈 이름 앞에 있고 그 배지가 이 화면으로 온다. 여기는 다음 레벨까지의 진행만 보여준다 */}
            {ceiling != null ? (
              <>
                <p className={cafe24Proup.className}>
                  Lv.{data.level.nextValue}까지{' '}
                  {Math.max(0, ceiling - data.totalExp).toLocaleString()} EXP 남음
                </p>
                {floor !== undefined && (
                  <div className="h-5 w-full">
                    <PixelProgressBar
                      percent={Math.round(progress)}
                      label={`다음 활동 단계 진행도 ${Math.round(progress)}%`}
                    />
                  </div>
                )}
              </>
            ) : (
              <p>마지막 활동 단계에 도달했어요.</p>
            )}
            {data.previousLevel != null && data.previousLevel > data.level.value && (
              <p className="text-sm text-neutral-700">
                활동 변경으로 Lv.{data.previousLevel}에서 Lv.{data.level.value}로 변경됐어요. 아래
                회수 이력에서 해당 활동을 확인해 주세요.
              </p>
            )}
          </div>
        )}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>{data?.totalExp ?? '—'}</strong>확인된 EXP
          </div>
          <div className={styles.stat}>
            <strong>{data ? `${earned.length} / ${data.badges.length}` : '—'}</strong>
            달성한 업적
          </div>
        </div>
        <Button disabled={busy || view.isPending || view.isError} onClick={() => sync.mutate()}>
          {sync.isPending
            ? '실제 활동을 확인하고 있어요…'
            : data?.updatedAt
              ? '새 활동 반영하기'
              : '내 활동 확인하고 시작하기'}
        </Button>
        <p className="mt-3 text-xs">
          포퐁 안에서 쌓은 활동을 보여주는 단계예요. 브리더 자격이나 아이의 건강을 보증하지 않아요.
        </p>
      </section>
      {view.isPending && (
        <p role="status" className="py-6">
          활동 기록을 불러오고 있어요.
        </p>
      )}
      {error && (
        <div role="alert" className="py-4">
          <p>{error instanceof Error ? error.message : '활동을 확인하지 못했어요.'}</p>
          <Button
            intent="secondary"
            disabled={busy || view.isFetching}
            onClick={async () => {
              const result = await view.refetch()
              if (result.isSuccess) {
                sync.reset()
                display.reset()
              }
            }}
          >
            다시 확인
          </Button>
        </div>
      )}
      {display.isSuccess && (
        <p role="status" className="mt-4 text-sm">
          대표 배지를 저장했어요.
        </p>
      )}
      <section aria-labelledby="badge-library" className="mt-8">
        <h2 id="badge-library" className="text-xl font-bold">
          나의 도트 배지함
        </h2>
        <p className="mt-2 text-sm">
          획득한 배지를 최대 3개 선택해 커뮤니티에 보여주세요. {data?.displayBadges.length ?? 0}/3
          선택
        </p>
        <div className={styles.grid}>
          {data?.badges.map((badge, index) => {
            const selected = data.displayBadges.includes(badge.key)
            return (
              <article
                key={badge.key}
                className={styles.badge}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <PixelActivityBadge
                  badgeKey={badge.key}
                  title={badge.title}
                  locked={badge.state !== 'earned'}
                />
                <h3>{badge.title}</h3>
                <p>{badge.description}</p>
                <meter
                  value={badge.progress}
                  max={badge.target}
                  aria-label={`${badge.title} 진행도`}
                />
                <p>
                  {badge.state === 'earned'
                    ? '달성 완료'
                    : badge.state === 'revoked'
                      ? '관련 활동 변경으로 회수됨'
                      : `${badge.progress}/${badge.target} 진행 중`}
                </p>
                {badge.state === 'earned' && (
                  <button
                    type="button"
                    aria-pressed={selected}
                    disabled={busy || view.isError || (!selected && data.displayBadges.length >= 3)}
                    onClick={() =>
                      display.mutate(
                        selected
                          ? data.displayBadges.filter((key) => key !== badge.key)
                          : [...data.displayBadges, badge.key],
                      )
                    }
                  >
                    {selected ? '대표 배지 해제' : '대표 배지로 쓰기'}
                  </button>
                )}
              </article>
            )
          })}
        </div>
      </section>
      <section className={styles.history}>
        <h2>최근 발걸음</h2>
        {!data?.history.length ? (
          <p className="text-sm">내 활동을 확인하면 적립 내역이 여기에 쌓여요.</p>
        ) : (
          <ol>
            {data.history.map((entry, index) => (
              <li key={`${entry.at}:${index}`}>
                <span>
                  {ACTIVITY_LABELS[entry.kind] ?? '활동'} ·{' '}
                  {entry.reason === 'revoked'
                    ? '회수'
                    : entry.reason === 'adjusted'
                      ? '운영 정정'
                      : entry.reason === 'restored'
                        ? '복원'
                        : '적립'}
                </span>
                <strong>
                  {entry.delta > 0 ? '+' : ''}
                  {entry.delta} EXP
                </strong>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-4 text-xs">
          서울 시간 기준 글은 일 2건·월 20건, 댓글과 공감받음은 각각 일 10건·월 100건까지 적립해요.
          삭제·비공개 등으로 활동이 무효가 되면 EXP가 회수되고 레벨도 내려갈 수 있어요.
        </p>
      </section>
      <nav aria-label="활동 바로가기" className="mt-6 flex flex-wrap gap-x-4">
        <DetailLink href="/level" label="활동 단계 안내" className="min-h-11" />
        <DetailLink
          href="/level#inquiry"
          label="레벨/EXP 문의 · 목표 처리 영업일 5일"
          className="min-h-11"
        />
        <DetailLink href="/community/write" label="첫 이야기 나누기" className="min-h-11" />
        <DetailLink href="/profile/edit" label="프로필 완성하기" className="min-h-11" />
        <DetailLink href="/community" label="커뮤니티로 돌아가기" className="min-h-11" />
      </nav>
    </div>
  )
}
