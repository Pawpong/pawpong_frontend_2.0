import Link from 'next/link'
import { PawPrintIcon, PixelArrowRightIcon } from '@/shared/assets'
import { createPageMetadata } from '@/shared/lib/metadata'
import { StructuredData } from '@/shared/ui/StructuredData'
import { ToolPage } from '@/features/playground-tools/ui/ToolPage'
import { ALL_PLAY_CARDS } from '@/features/playground-tools/model/discovery'
import {
  cardsInGroup,
  PLAY_CARD_GROUPS,
  playCardHref,
  playCardUrl,
} from '@/features/playground-tools/model/playCardLinks'

export const metadata = createPageMetadata({
  title: '반려동물 놀이 카드 모음',
  description:
    '산책 아이디어, 우리 아이 취향, 멍냥BTI까지. 반려동물과 함께 즐길 놀이 카드를 고르고 같은 카드를 친구와 나눠보세요.',
  path: '/playground/cards',
})

export default function PlayCardCollectionPage() {
  return (
    <ToolPage
      title="오늘은 어떤 카드로 놀까요?"
      description="고르고, 해보고, 함께 나누는 우리 아이의 작은 놀이 도감."
    >
      <nav
        aria-label="놀이 종류"
        className="mb-8 flex flex-wrap gap-x-5 gap-y-2 border-b border-secondary-200 pb-4"
      >
        {PLAY_CARD_GROUPS.map((group) => (
          <a
            key={group.id}
            href={`#${group.id}`}
            className="inline-flex min-h-11 items-center font-semibold text-primary-600 underline-offset-4 focus-ring hover:underline"
          >
            {group.title}
          </a>
        ))}
      </nav>
      <div className="space-y-12">
        {PLAY_CARD_GROUPS.map((group) => (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`${group.id}-title`}
            className="scroll-mt-24"
          >
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id={`${group.id}-title`} className="font-cafe24 text-2xl text-neutral-850">
                  {group.title}
                </h2>
                <p className="mt-2 text-sm text-neutral-700">{group.description}</p>
              </div>
              <Link
                href={group.href}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-600 focus-ring"
              >
                직접 해보기
                <PixelArrowRightIcon aria-hidden className="size-3" />
              </Link>
            </div>
            <ul className="grid gap-3 tab:grid-cols-2 lap:grid-cols-3">
              {cardsInGroup(group.id).map((card) => (
                <li key={card.id}>
                  <Link
                    href={playCardHref(card)}
                    className="flex h-full gap-3 rounded-xl border border-secondary-200 bg-secondary-50 p-5 focus-ring hover:border-primary-400"
                  >
                    <PawPrintIcon aria-hidden className="mt-1 size-5 shrink-0 text-primary-600" />
                    <span className="min-w-0">
                      <span className="block font-semibold break-keep text-neutral-850">
                        {card.title}
                      </span>
                      <span className="mt-2 block text-sm leading-6 break-keep text-neutral-700">
                        {card.description}
                      </span>
                      <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
                        카드 펼치기
                        <PixelArrowRightIcon aria-hidden className="size-3" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <StructuredData
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: '포퐁 반려동물 놀이 카드 모음',
          url: 'https://pawpong.kr/playground/cards',
          inLanguage: 'ko-KR',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: ALL_PLAY_CARDS.map((card, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: card.title,
              url: playCardUrl(card),
            })),
          },
        }}
      />
    </ToolPage>
  )
}
