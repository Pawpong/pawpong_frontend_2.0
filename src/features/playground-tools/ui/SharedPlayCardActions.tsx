'use client'

import Link from 'next/link'
import { trackAction } from '@/shared/lib/analyticsEvents'
import { buttonVariants } from '@/shared/ui/Button'
import { playCardStart } from '../model/playCardLinks'
import type { PlayCard } from '../model/discovery.types'
import { playCardKind } from '../model/playCardLinks'
import { useToolOwner } from '../model/useToolOwner'
import { PlayResultActions } from './PlayResultActions'

export function SharedPlayCardActions({ card }: { card: PlayCard }) {
  const owner = useToolOwner()
  return owner === null ? null : (
    <PlayResultActions key={owner} card={card} owner={owner} from={playCardKind(card)} />
  )
}

/** A shared card starts the play flow; this is not a completion or a conversion. */
export function SharedPlayStartLink({ card }: { card: PlayCard }) {
  return (
    <Link
      href={playCardStart(card).href}
      className={buttonVariants()}
      onClick={() => trackAction('pawpong_play_start', playCardKind(card))}
    >
      나도 해보기
    </Link>
  )
}
