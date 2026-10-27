import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ALL_PLAY_CARDS, findPlayCard } from '@/features/playground-tools/model/discovery'
import { playCardHref, playCardUrl } from '@/features/playground-tools/model/playCardLinks'
import { PlayResultCard } from '@/features/playground-tools/ui/PlayResultCard'
import {
  SharedPlayCardActions,
  SharedPlayStartLink,
} from '@/features/playground-tools/ui/SharedPlayCardActions'
import { ToolPage } from '@/features/playground-tools/ui/ToolPage'
import { StructuredData } from '@/shared/ui/StructuredData'
import { createPageMetadata } from '@/shared/lib/metadata'
import { SITE_URL } from '@/shared/config/site'

type Props = { params: Promise<{ cardId: string }> }
export const generateStaticParams = () => ALL_PLAY_CARDS.map((card) => ({ cardId: card.id }))
export async function generateMetadata({ params }: Props) {
  const card = findPlayCard((await params).cardId)
  if (!card) notFound()
  return createPageMetadata({
    title: card.title,
    description: card.description,
    path: playCardHref(card),
  })
}

export default async function SharedPlayCardPage({ params }: Props) {
  const card = findPlayCard((await params).cardId)
  if (!card) notFound()
  return (
    <ToolPage title={card.title} description={card.description}>
      <nav aria-label="현재 위치" className="mb-6 text-sm text-primary-600">
        <Link
          href="/playground/cards"
          className="inline-flex min-h-11 items-center underline underline-offset-4 focus-ring"
        >
          놀이 카드 모아보기
        </Link>
      </nav>
      <div className="mx-auto max-w-3xl">
        <PlayResultCard card={card} stamp="WITH YOU" />
        <section className="mt-6 space-y-3" aria-labelledby="try-play">
          <h2 id="try-play" className="font-cafe24 text-xl text-neutral-850">
            우리 아이는 어떤 카드일까요?
          </h2>
          <p className="text-sm leading-6 text-neutral-700">
            지금 보고 있는 것은 공유한 놀이 카드예요. 직접 골라보면 우리 아이의 또 다른 모습을 만날
            수 있어요.
          </p>
          <SharedPlayStartLink card={card} />
        </section>
        <SharedPlayCardActions card={card} />
        <section className="mt-8 border-t border-secondary-200 pt-6">
          <h2 className="font-cafe24 text-xl text-neutral-850">카드에 대해 궁금한 점</h2>
          <h3 className="mt-4 font-semibold">공유하면 어떤 정보가 보이나요?</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            이 카드의 이름과 놀이 아이디어만 보여요. 고른 답변, 이름, 사진, 위치는 공유 링크에
            담기지 않아요.
          </p>
          <h3 className="mt-4 font-semibold">성격이나 건강을 진단하는 검사인가요?</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            함께할 시간을 떠올리는 가벼운 놀이예요. 성격·건강 진단이나 전문적인 행동 평가가 아니며,
            아이가 편안해하는 범위에서 즐겨주세요.
          </p>
        </section>
      </div>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: card.title,
          description: card.description,
          url: playCardUrl(card),
          inLanguage: 'ko-KR',
          isPartOf: { '@id': `${SITE_URL}/#website` },
        }}
      />
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: '놀이터',
              item: 'https://pawpong.kr/playground',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: '놀이 카드',
              item: 'https://pawpong.kr/playground/cards',
            },
            { '@type': 'ListItem', position: 3, name: card.title, item: playCardUrl(card) },
          ],
        }}
      />
    </ToolPage>
  )
}
