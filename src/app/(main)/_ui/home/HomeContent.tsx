import Image from 'next/image'
import Link from 'next/link'
import type { InitialBanners } from '@/entities/home/server'
import { TEXT } from '@/shared/config'
import { SearchBar } from '@/shared/ui'
import { CareMapEntry } from '@/widgets/care-map-entry'
import { HomeSectionHeader } from './HomeSectionHeader'
import { PreviewBanner } from './PreviewBanner'
import { PreviewCommunity, PreviewPets, PreviewHallOfFame, PreviewPlayground } from './PreviewFeeds'

export const species = [
  {
    name: '고양이',
    href: '/explore?type=adoption&category=cat',
    image: '/images/onboarding/animal-cat-v3.png',
    tone: 'bg-secondary-100',
  },
  {
    name: '강아지',
    href: '/explore?type=adoption&category=dog',
    image: '/images/onboarding/animal-dog-v3.png',
    tone: 'bg-primary-50',
  },
  {
    name: '도마뱀',
    href: '/explore?type=adoption&category=lizard',
    image: '/images/onboarding/animal-lizard-v3.png',
    tone: 'bg-point-100',
  },
] as const

export function SpeciesLinks() {
  const destinations = [
    ...species.map((animal) => ({ ...animal, label: `${animal.name} 찾기` })),
    {
      name: '브리더',
      label: '브리더 탐색',
      href: '/explore?type=breeder',
      image: '/images/onboarding/member-breeder-v3.png',
    },
  ]
  return (
    <div className="grid grid-cols-4 gap-2 tab:gap-5">
      {destinations.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="flex min-w-0 flex-col items-center gap-3 rounded-xl border border-primary-100 bg-secondary-50 px-1 py-4 text-center focus-ring hover:border-primary-400 hover:bg-secondary-100 tab:py-6"
        >
          <Image
            src={item.image}
            alt=""
            width={112}
            height={112}
            className="size-16 object-contain tab:size-24"
          />
          <span className="text-body-s font-semibold text-neutral-850">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}

export function Journey() {
  const steps = [
    { title: '살펴보기', text: '동물과 브리더의 공개 정보를 확인해요.' },
    { title: '신청하기', text: '상세 화면에서 입양 신청을 작성해요.' },
    { title: '이야기 나누기', text: '채팅으로 건강과 사육 환경을 상담해요.' },
  ]
  return (
    <section aria-labelledby="home-journey-title" className="bg-secondary-50 section-band">
      <div className="page-shell">
        <HomeSectionHeader
          id="home-journey-title"
          title="만나기 전, 이렇게 확인해요"
          href="/about"
          linkLabel="이용 방법 보기"
        />
        <ol className="grid gap-5 tab:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="border-t border-primary-200 pt-4">
              <span className="text-body-s font-semibold text-primary-600">0{index + 1}</span>
              <h3 className={`mt-1 ${TEXT.body}`}>{step.title}</h3>
              <p className="mt-1 text-body-s text-neutral-700">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function HomeContent({ initial }: { initial: InitialBanners | null }) {
  return (
    // 섹션 사이 간격·화면 위아래 끝 여백은 section-stack 한 곳에서 정한다 (섹션은 위아래 여백을 두지 않는다)
    <div className="section-stack">
      <div className="page-shell">
        <PreviewBanner initial={initial} />
      </div>
      <section aria-labelledby="home-explore-title" className="page-shell">
        <div className="section-head-gap flex flex-col gap-4 tab:flex-row tab:items-center tab:justify-between tab:gap-8">
          <div className="shrink-0">
            {/* 홈의 유일한 화면 제목 — 섹션 제목보다 한 단계 크다 */}
            <h1 id="home-explore-title" className={TEXT.display}>
              어떤 만남을 찾고 있나요?
            </h1>
            <p className="mt-1 text-body-s text-neutral-700">
              동물과 브리더의 정보를 한곳에서 살펴보세요.
            </p>
          </div>
          <div className="w-full tab:max-w-[25rem]">
            <SearchBar />
          </div>
        </div>
        <SpeciesLinks />
      </section>
      {/* 구분선은 섹션 간격 한가운데에 둔다 (간격을 두 번 쓰지 않게) */}
      <hr className="-my-[calc(var(--section-space)/2)] border-neutral-150" />
      <PreviewPets title="분양 가능한 동물" />
      <PreviewHallOfFame />
      <PreviewPlayground />
      <Journey />
      <PreviewCommunity />
      <div className="page-shell">
        <CareMapEntry />
      </div>
    </div>
  )
}
