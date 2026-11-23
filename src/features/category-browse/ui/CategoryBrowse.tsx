import Image from 'next/image'
import Link from 'next/link'
import { PageShell } from '@/shared/ui'

// Figma 2752-269487 — 카테고리 버튼(동물+pill+라벨)은 통짜 SVG. default/hover 2상태.
// 벡터라 모바일부터 PC까지 한 파일로 CSS 확대가 매끄러워, PNG처럼 sm/md 파일을 따로 두지 않는다.
const CATEGORIES = [
  { label: '고양이 찾기', href: '/explore?type=adoption&category=cat', src: 'cat' },
  { label: '강아지 찾기', href: '/explore?type=adoption&category=dog', src: 'dog' },
  { label: '도마뱀 찾기', href: '/explore?type=adoption&category=lizard', src: 'lizard' },
  { label: '브리더 탐색', href: '/explore?type=breeder', src: 'explore' },
] as const

const CATEGORY_IMAGE_SIZES = '(max-width: 767px) 202px, (max-width: 1439px) 154px, 192px'

const HomeCategoryButton = ({ label, href, src }: (typeof CATEGORIES)[number]) => (
  <Link
    href={href}
    aria-label={label}
    className="group relative block aspect-[192/177] w-full rounded-lg focus-ring pc:max-w-[11.991rem]"
  >
    <Image
      src={`/images/category/${src}-default-md.svg`}
      alt={label}
      fill
      sizes={CATEGORY_IMAGE_SIZES}
      className="object-contain transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0"
      loading="eager"
    />
    <Image
      src={`/images/category/${src}-hover-md.svg`}
      alt=""
      fill
      sizes={CATEGORY_IMAGE_SIZES}
      className="object-contain opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
    />
  </Link>
)

const CategoryBrowse = () => {
  return (
    <section aria-labelledby="category-browse-title" className="bg-primary-50/40">
      <PageShell className="px-4 pt-7 pb-9 tab:pt-9 tab:pb-11 pc:pt-12 pc:pb-14">
        <h1
          id="category-browse-title"
          className="mb-5 text-center font-cafe24 text-2xl leading-[1.4] text-primary-800 tab:mb-7 tab:text-3xl pc:mb-9 pc:text-4xl"
        >
          새로운 가족을 찾아볼까요?
        </h1>
        <div className="mx-auto grid w-full max-w-[26rem] grid-cols-2 items-center gap-3 tab:max-w-[44rem] tab:grid-cols-4 tab:gap-6 pc:max-w-[60.526rem] pc:gap-[4.1875rem]">
          {CATEGORIES.map((category) => (
            <HomeCategoryButton key={category.label} {...category} />
          ))}
        </div>
      </PageShell>
    </section>
  )
}

export { CategoryBrowse }
