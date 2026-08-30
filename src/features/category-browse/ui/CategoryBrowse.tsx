import Image from 'next/image'
import Link from 'next/link'
import { Container, CtaBanner } from '@/shared/ui'

// Figma 2752-269487 — 카테고리 버튼(동물+pill+라벨)은 통짜 SVG. default/hover 2상태.
const CATEGORIES = [
  { label: '고양이 찾기', href: '/explore?category=cat', src: 'cat' },
  { label: '강아지 찾기', href: '/explore?category=dog', src: 'dog' },
  { label: '도마뱀 찾기', href: '/explore?category=lizard', src: 'lizard' },
  { label: '브리더 탐색', href: '/explore?type=breeder', src: 'explore' },
]

const HomeCategoryButton = ({ label, href, src }: (typeof CATEGORIES)[number]) => (
  <Link
    href={href}
    aria-label={label}
    className="group relative block h-[5.78125rem] w-[6.640625rem] pc:h-[10.3996rem] pc:w-[11.991rem]"
  >
    <Image
      src={`/images/category/${src}-default-md.svg`}
      alt={label}
      fill
      sizes="(max-width: 1439px) 106px, 192px"
      className="object-contain transition-opacity group-hover:opacity-0"
      loading="eager"
    />
    <Image
      src={`/images/category/${src}-hover-md.svg`}
      alt=""
      fill
      sizes="(max-width: 1439px) 106px, 192px"
      className="object-contain opacity-0 transition-opacity group-hover:opacity-100"
    />
  </Link>
)

const CategoryBrowse = () => {
  return (
    <>
      {/* 브리더 CTA 스트립 밴드 (Figma 2752-266432) — 밴드 py-8 flush.
          스트립 px-16 py-12(pc px-32) · 텍스트 12px→pc 14px */}
      <Container className="px-4 py-3 tab:py-2">
        <CtaBanner text="신뢰할 수 있는 브리더 포퐁에서 만나요 !" />
      </Container>

      {/* 카테고리 밴드 (Figma 2752-269648) — 밴드 py-16(pc py-10) flush.
          모바일(~767px): 2×2 Grid / 태블릿 이상: 4개 한 줄 */}
      <Container className="px-4 py-4 pc:py-[0.625rem]">
        <div className="mx-auto grid w-full grid-cols-[repeat(2,6.640625rem)] place-items-center justify-center gap-x-[2.1875rem] gap-y-2 tab:flex tab:items-center tab:justify-center tab:gap-[2.1875rem] pc:grid pc:min-h-[10.4621rem] pc:max-w-[60.526rem] pc:grid-cols-4 pc:gap-[4.1875rem]">
          {CATEGORIES.map((category) => (
            <HomeCategoryButton key={category.label} {...category} />
          ))}
        </div>
      </Container>
    </>
  )
}

export { CategoryBrowse }
