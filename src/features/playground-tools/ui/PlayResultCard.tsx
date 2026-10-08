import { PawPrintIcon } from '@/shared/assets'
import { PLAY_CARD_NOTICE } from '../constants/discovery'
import type { PlayCard } from '../model/discovery.types'
import styles from './Discovery.module.css'

export function PlayResultCard({ card }: { card: PlayCard }) {
  return (
    <article
      className={styles.ticket}
      data-accent={card.accent}
      aria-labelledby={`play-${card.id}`}
    >
      <div className={styles.ticketTop}>
        <span>PAWPONG PLAY CARD</span>
        <PawPrintIcon aria-hidden className="size-5" />
      </div>
      <div className="p-5 tab:p-6">
        <span className="text-xs font-semibold text-primary-600">{card.label}</span>
        <h3
          id={`play-${card.id}`}
          className="mt-1 font-cafe24 text-2xl leading-snug text-neutral-850"
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
  )
}
