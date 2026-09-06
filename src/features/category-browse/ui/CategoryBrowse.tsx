import Image from 'next/image'
import Link from 'next/link'
import { Container, CtaBanner } from '@/shared/ui'

//QA: 홈 카테고리 에셋 교체 — SVG 렌더링 깨짐을 방지하기 위해 Figma PNG를 적용한다.
const CATEGORIES = [
  {
    label: '고양이 찾기',
    href: '/explore?category=cat',
    compact: {
      default: '/images/category/cat-default-sm.png',
      active: '/images/category/cat-hover-sm.png',
    },
    desktop: {
      default: '/images/category/cat-default-md.png',
      active: '/images/category/cat-hover-md.png',
    },
  },
  {
    label: '강아지 찾기',
    href: '/explore?category=dog',
    compact: {
      default: '/images/category/dog-default-sm.png',
      active: '/images/category/dog-hover-sm.png',
    },
    desktop: {
      default: '/images/category/dog-default-md.png',
      active: '/images/category/dog-hover-md.png',
    },
  },
  {
    label: '도마뱀 찾기',
    href: '/explore?category=lizard',
    compact: {
      default: '/images/category/lizard-default-sm.png',
      active: '/images/category/lizard-hover-sm.png',
    },
    desktop: {
      default: '/images/category/lizard-default-md.png',
      active: '/images/category/lizard-hover-md.png',
    },
  },
  {
    label: '브리더 탐색',
    href: '/explore?type=breeder',
    //QA: 브리더 탭은 Figma Section에 PNG가 없어 기존 SVG를 동일한 PNG로 변환해 사용한다.
    compact: {
      default: '/images/category/explore-default-md.png',
      active: '/images/category/explore-hover-md.png',
    },
    desktop: {
      default: '/images/category/explore-default-md.png',
      active: '/images/category/explore-hover-md.png',
    },
  },
]

//QA: 반응형 에셋 처리 — 모바일·태블릿은 compact, PC는 desktop PNG를 사용한다.
//QA: 상태 처리 — 기본/hover PNG를 겹쳐 hover 시 노란색 상태로 전환한다.
const HomeCategoryButton = ({ label, href, compact, desktop }: (typeof CATEGORIES)[number]) => (
  <Link
    href={href}
    aria-label={label}
    className="group relative block aspect-[192/177] w-full max-w-[6.640625rem] pc:h-[10.3996rem] pc:w-[11.991rem] pc:max-w-none"
  >
    <div className="absolute inset-0 pc:hidden">
      <Image
        src={compact.default}
        alt={label}
        fill
        sizes="107px"
        className="object-contain transition-opacity group-hover:opacity-0"
        loading="eager"
      />
      <Image
        src={compact.active}
        alt=""
        fill
        sizes="107px"
        className="object-contain opacity-0 transition-opacity group-hover:opacity-100"
        loading="eager"
      />
    </div>
    <div className="absolute inset-0 hidden pc:block">
      <Image
        src={desktop.default}
        alt={label}
        fill
        sizes="192px"
        className="object-contain transition-opacity group-hover:opacity-0"
        loading="eager"
      />
      <Image
        src={desktop.active}
        alt=""
        fill
        sizes="192px"
        className="object-contain opacity-0 transition-opacity group-hover:opacity-100"
        loading="eager"
      />
    </div>
  </Link>
)

const CategoryBrowse = () => {
  return (
    <>
      {/* 브리더 CTA 스트립 (Figma 2937-336918) — PC와 모바일·탭의 발자국 배치를 분기한다. */}
      <Container className="px-4 py-3 tab:py-2">
        <CtaBanner text="신뢰할 수 있는 브리더 포퐁에서 만나요 !" tone="point" />
      </Container>

      {/*
        //QA: 모바일 카테고리 배치 수정 — 375~767px에서는 2x2, 탭·PC에서는 4개 한 줄로 정렬한다.
        //QA: 버튼 크기 수정 — 각 PNG의 원본 비율을 유지하면서 태블릿·PC 간격을 적용한다.
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
