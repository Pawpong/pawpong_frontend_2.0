import { PawPrintIcon } from '@/shared/assets'
import { PLAY_CARD_NOTICE } from '../constants/discovery'
import type { PlayCard } from '../model/discovery.types'
import { TicketStrip, ticketStyles } from '@/shared/ui/Ticket'
import styles from './Discovery.module.css'

/**
 * 놀이 결과 티켓. 넘치며 멈추는 뒤집기로 도착하고, 위로 도트 반짝임이 터진 뒤 머리 줄에 도장이 찍힌다.
 * stamp 는 장식이라 읽지 않는다(같은 내용이 제목에 있다).
 */
export function PlayResultCard({ card, stamp }: { card: PlayCard; stamp?: string }) {
  return (
    <div className={styles.reveal}>
      <span
        aria-hidden
        data-accent={card.accent}
        className={`${ticketStyles.accent} ${styles.sparkles}`}
      />
      <article
        className={ticketStyles.ticket}
        data-accent={card.accent}
        aria-labelledby={`play-${card.id}`}
      >
        <TicketStrip
          label="PAWPONG PLAY CARD"
          icon={<PawPrintIcon aria-hidden className="size-5" />}
        />
        <div className="p-5 tab:p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-semibold text-primary-600">{card.label}</span>
            {stamp && (
              <span aria-hidden className={styles.stamp}>
                {stamp}
              </span>
            )}
          </div>
          <h3
            id={`play-${card.id}`}
            className="mt-1 font-cafe24 text-2xl leading-snug break-keep text-neutral-850"
          >
            {card.title}
          </h3>
          <p className="mt-2 text-sm leading-6 break-keep text-neutral-700">{card.description}</p>
          <ol className="mt-4 space-y-2.5">
            {card.moments.map((moment, index) => (
              <li
                key={moment}
                className="flex items-start gap-2.5 text-sm leading-6 break-keep text-neutral-850"
              >
                <span aria-hidden className={styles.momentNumber}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                {moment}
              </li>
            ))}
          </ol>
        </div>
        <p className={styles.ticketBottom}>
          해야 하는 미션이 아니라 함께 즐길 작은 아이디어예요. {PLAY_CARD_NOTICE}
        </p>
      </article>
    </div>
  )
}
