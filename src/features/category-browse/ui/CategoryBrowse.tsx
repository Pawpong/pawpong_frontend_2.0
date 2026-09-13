import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/shared/ui'

// Figma 2752-269487 — 카테고리 버튼(동물+pill+라벨)은 통짜 SVG. default/hover 2상태.
// 벡터라 모바일부터 PC까지 한 파일로 CSS 확대가 매끄러워, PNG처럼 sm/md 파일을 따로 두지 않는다.
const CATEGORIES = [
  { label: '고양이 찾기', href: '/explore?category=cat', src: 'cat' },
  { label: '강아지 찾기', href: '/explore?category=dog', src: 'dog' },
  { label: '도마뱀 찾기', href: '/explore?category=lizard', src: 'lizard' },
  { label: '브리더 탐색', href: '/explore?type=breeder', src: 'explore' },
] as const

const HomeCategoryButton = ({ label, href, src }: (typeof CATEGORIES)[number]) => (
  <Link
    href={href}
    aria-label={label}
    className="group relative block aspect-[192/177] w-full max-w-[6.640625rem] pc:h-[10.3996rem] pc:w-[11.991rem] pc:max-w-none"
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
      {/*
        //QA: 모바일 카테고리 배치 수정 — 375~767px에서는 2x2, 탭·PC에서는 4개 한 줄로 정렬한다.
        //QA: 버튼 크기 수정 — 각 SVG의 원본 비율을 유지하면서 태블릿·PC 간격을 적용한다.
      */}
      <Container className="px-4 py-4 pc:py-[0.625rem]">
        <div className="mx-auto grid w-full grid-cols-[repeat(2,6.640625rem)] place-items-center justify-center gap-x-[2.1875rem] gap-y-2 tab:grid-cols-[repeat(4,6.640625rem)] tab:gap-[2.1875rem] pc:min-h-[10.4621rem] pc:max-w-[60.526rem] pc:grid-cols-[repeat(4,11.991rem)] pc:gap-[4.1875rem]">
          {CATEGORIES.map((category) => (
            <HomeCategoryButton key={category.label} {...category} />
          ))}
        </div>
      </Container>
    </>
  )
}

export { CategoryBrowse }
