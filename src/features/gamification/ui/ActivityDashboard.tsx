'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  getActivity,
  synchronizeActivity,
  displayActivityBadges,
  withActivitySession,
  PixelActivityBadge,
} from '@/entities/gamification'
import { Button } from '@/shared/ui'
import { cafe24Proup } from '@/shared/lib/fonts'
import styles from './activity.module.css'

const LABELS: Record<string, string> = {
  profile: '프로필 완성',
  post: '공개 이야기',
  comment: '댓글 교류',
  listing: '분양 소개',
  contest: '콘테스트 출품',
  winner: '명예의 전당',
}
export function ActivityDashboard({
  ownerId,
  generation,
}: {
  ownerId: string
  generation: number
}) {
  const client = useQueryClient()
  const key = ['gamification', 'private', ownerId, generation]
  const view = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => withActivitySession(generation, () => getActivity(signal)),
    retry: false,
    throwOnError: false,
    gcTime: 0,
  })
  const sync = useMutation({
    mutationFn: () => withActivitySession(generation, () => synchronizeActivity()),
    onSuccess: (data) => {
      client.setQueryData(key, data)
      void client.invalidateQueries({ queryKey: ['gamification', 'public'] })
    },
  })
  const display = useMutation({
    mutationFn: (keys: string[]) =>
      withActivitySession(generation, () => displayActivityBadges(keys)),
    onSuccess: (data) => {
      client.setQueryData(key, data)
      void client.invalidateQueries({ queryKey: ['gamification', 'public'] })
    },
  })
  const data = view.data
  const busy = sync.isPending || display.isPending
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
        <div className={styles.stats}>
          <div className={styles.stat}>
            <strong>{data?.totalExp ?? 0}</strong>확인된 EXP
          </div>
          <div className={styles.stat}>
            <strong>
              {earned.length} / {data?.badges.length ?? 6}
            </strong>
            달성한 업적
          </div>
        </div>
        <Button disabled={busy || view.isPending} onClick={() => sync.mutate()}>
          {sync.isPending
            ? '실제 활동을 확인하고 있어요…'
            : data?.updatedAt
              ? '새 활동 반영하기'
              : '내 활동 확인하고 시작하기'}
        </Button>
        <p className="mt-3 text-xs">
          개발용 실험 정책이에요. EXP와 배지는 인증·진료 전문성·입양 안전을 보증하지 않아요.
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
          <Button intent="secondary" onClick={() => void view.refetch()}>
            다시 확인
          </Button>
        </div>
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
                    disabled={busy || (!selected && data.displayBadges.length >= 3)}
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
                  {LABELS[entry.kind] ?? '활동'} ·{' '}
                  {entry.reason === 'revoked'
                    ? '회수'
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
          서울 시간 기준으로 글은 일 2건·월 20건, 댓글은 일 5건·월 50건까지 적립해요. 삭제·비공개
          전환은 원장을 역분개해요. 양측 확인 상담·입양·후기는 아직 보상하지 않아요.
        </p>
      </section>
      <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold">
        <Link href="/community/write">첫 이야기 나누기</Link>
        <Link href="/profile/edit">프로필 완성하기</Link>
        <Link href="/community">커뮤니티로 돌아가기</Link>
      </div>
    </div>
  )
}
