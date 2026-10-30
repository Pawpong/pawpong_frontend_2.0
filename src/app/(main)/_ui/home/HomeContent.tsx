import Image from 'next/image'
import Link from 'next/link'
import type { InitialBanners } from '@/entities/home/server'
import { SearchBar } from '@/shared/ui'
import { CareMapEntry } from '@/widgets/care-map-entry'
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
          <span className="text-xs font-semibold text-neutral-850 tab:text-base">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}

export function Journey({ dark = false }: { dark?: boolean }) {
  const steps = [
    { title: '살펴보기', text: '동물과 브리더의 공개 정보를 확인해요.' },
    { title: '신청하기', text: '상세 화면에서 입양 신청을 작성해요.' },
    { title: '이야기 나누기', text: '채팅으로 건강과 사육 환경을 상담해요.' },
  ]
  return (
    <section className={dark ? 'bg-primary-800 text-white' : 'bg-secondary-50 text-neutral-850'}>
      <div className="page-shell py-12 tab:py-16">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-cafe24 text-2xl leading-[1.4] tab:text-[1.75rem]">
            만나기 전, 이렇게 확인해요
          </h2>
          <Link
            href="/about"
            className={`rounded text-sm underline underline-offset-4 focus-ring ${dark ? 'text-point-500' : 'text-primary-700'}`}
          >
            이용 방법 보기
          </Link>
        </div>
        <ol className="grid gap-5 tab:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={`border-t pt-4 ${dark ? 'border-primary-300' : 'border-primary-200'}`}
            >
              <span
                className={`text-sm font-semibold ${dark ? 'text-point-500' : 'text-primary-600'}`}
              >
                0{index + 1}
              </span>
              <h3 className="mt-2 font-cafe24 text-xl">{step.title}</h3>
              <p
                className={`mt-2 text-sm leading-6 ${dark ? 'text-primary-100' : 'text-neutral-700'}`}
              >
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function HomeContent({ initial }: { initial: InitialBanners | null }) {
  return (
    <>
      <div className="page-shell pt-6 tab:pt-8">
        <PreviewBanner initial={initial} />
      </div>
      <section
        aria-labelledby="home-explore-title"
        className="page-shell pt-8 pb-12 tab:pt-10 tab:pb-16"
      >
        <div className="mb-6 flex flex-col gap-5 tab:flex-row tab:items-center tab:justify-between tab:gap-8">
          <div className="shrink-0">
            <h1
              id="home-explore-title"
              className="font-cafe24 text-2xl leading-[1.4] text-neutral-850 tab:text-[1.75rem]"
            >
              어떤 만남을 찾고 있나요?
            </h1>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              동물과 브리더의 정보를 한곳에서 살펴보세요.
            </p>
          </div>
          <div className="w-full tab:max-w-[25rem]">
            <SearchBar />
          </div>
        </div>
        <SpeciesLinks />
      </section>
      <div className="border-t border-neutral-150">
        <PreviewPets title="분양 가능한 동물" />
      </div>
      <PreviewHallOfFame />
      <PreviewPlayground />
      <Journey />
      <PreviewCommunity />
      <div className="page-shell pb-14">
        <CareMapEntry />
      </div>
    </>
  )
}
