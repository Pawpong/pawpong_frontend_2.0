import { PawPrintIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { ticketStyles, type TicketAccent } from '@/shared/ui/Ticket'
import styles from './Discovery.module.css'

/** 결과 카드를 만드는 동안 보여 주는 섞기 장면. 문구는 상태로 읽힌다. */
export function PlayShuffle({ accent, label }: { accent: TicketAccent; label: string }) {
  return (
    <div data-accent={accent} className={cn(ticketStyles.accent, styles.shuffle)}>
      <span aria-hidden className={styles.shuffleDeck}>
        <span />
        <span />
        <span>
          <PawPrintIcon />
        </span>
      </span>
      <p role="status" className={styles.shuffleText}>
        {label}
      </p>
    </div>
  )
}
