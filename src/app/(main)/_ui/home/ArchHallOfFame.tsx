'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ProfileAvatar } from '@/shared/ui/ProfileAvatar'
import { SessionImage } from '@/shared/ui/SessionImage'
import { useAuthReadSession } from '@/shared/lib/useAuthReadSession'
import { FavoriteIcon, PawPrintIcon } from '@/shared/assets'
import type { CommunityHallOfFame, CommunityHallOfFameWinner } from '@/shared/types'
import styles from './ArchHallOfFame.module.css'

function WinnerCard({
  winner,
  rank,
  state,
  unavailable,
}: {
  winner?: CommunityHallOfFameWinner
  rank: number
  state: CommunityHallOfFame['state']
  unavailable: boolean
}) {
  const session = useAuthReadSession()
  const identity = `${session?.scope ?? 'anonymous'}:${winner?.photoUrl}`
  const [failed, setFailed] = useState<string>()
  if (!winner)
    return (
      <article
        className={`${styles.card} ${styles.empty}`}
        aria-label={`${rank}위 ${unavailable ? '현재 열람 불가' : '선정된 글 없음'}`}
      >
        <span className={styles.rank}>{rank}위</span>
        <PawPrintIcon className="size-7 text-secondary-500" aria-hidden="true" />
        <p>
          {unavailable ? '현재 열람 불가' : state === 'open' ? '집계 중이에요' : '선정된 글 없음'}
        </p>
      </article>
    )
  return (
    <article className={styles.card}>
      <Link
        href={`/community/post/${winner.postId}`}
        className={`${styles.post} focus-ring`}
        aria-label={`${rank}위 · ${winner.author.nickname}의 게시글 보기`}
      >
        <div className={styles.photo}>
          {winner.photoUrl && failed !== identity ? (
            <SessionImage
              src={winner.photoUrl}
              alt={winner.bodyExcerpt || '수상 게시글 사진'}
              fill
              sizes="(min-width: 1440px) 180px, 150px"
              className="object-cover"
              onError={() => setFailed(identity)}
            />
          ) : (
            <PawPrintIcon className="size-8 text-secondary-500" aria-hidden="true" />
          )}
          <span className={styles.rank}>{rank}위</span>
        </div>
        <p className={styles.excerpt}>{winner.bodyExcerpt || '수상 게시글 보기'}</p>
      </Link>
      <div className={styles.meta}>
        {winner.author.authorModel === 'Breeder' ? (
          <Link
            href={`/home/${winner.author.userId}`}
            className={`${styles.author} focus-ring`}
            title={winner.author.nickname}
          >
            <ProfileAvatar
              src={winner.author.profileImageUrl ?? undefined}
              alt=""
              size="xsmall"
              className="shrink-0"
            />
            <span className={styles.nickname}>{winner.author.nickname}</span>
          </Link>
        ) : (
          <span className={styles.author} title={winner.author.nickname}>
            <ProfileAvatar
              src={winner.author.profileImageUrl ?? undefined}
              alt=""
              size="xsmall"
              className="shrink-0"
            />
            <span className={styles.nickname}>{winner.author.nickname}</span>
          </span>
        )}
        <span className={styles.likes}>
          <FavoriteIcon status="fill" className="size-3 text-pressed-favorite" aria-hidden="true" />
          <span className="sr-only">좋아요 </span>
          {winner.likeCount}
        </span>
      </div>
    </article>
  )
}

export function ArchHallOfFame({
  winners,
  state,
  unavailableRanks = [],
}: {
  winners: CommunityHallOfFameWinner[]
  state: CommunityHallOfFame['state']
  unavailableRanks?: number[]
}) {
  return (
    <div
      className={styles.viewport}
      role="region"
      aria-label="명예의 전당 수상 게시글, 작은 화면에서 좌우로 넘겨보세요"
      tabIndex={0}
    >
      <div className={styles.stage}>
        <Image
          src="/images/hall-of-fame/concepts/stage-b-refined-v3.png"
          alt=""
          fill
          sizes="(min-width: 1440px) 1120px, 100vw"
          className={styles.desktopArt}
          unoptimized
        />

        <Image
          src="/images/hall-of-fame/concepts/stage-b-v1.png"
          alt=""
          fill
          sizes="660px"
          className={styles.mobileArt}
          unoptimized
        />
        {[1, 2, 3].map((rank) => (
          <div key={rank} data-rank={rank} className={styles.slot}>
            <span className={styles.crest} aria-hidden="true" />
            <WinnerCard
              rank={rank}
              winner={winners.find((winner) => winner.rank === rank)}
              state={state}
              unavailable={unavailableRanks.includes(rank)}
            />
            <span className={styles.mobilePodium} aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  )
}
