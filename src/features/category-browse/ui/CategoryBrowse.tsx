import Image from 'next/image'
import Link from 'next/link'
import { cafe24Proup } from '@/shared/lib/fonts'
import { cn } from '@/shared/lib/cn'
import { Container } from '@/shared/ui'

// 브리더 CTA 스트립 픽셀 발자국 (Figma 2752-266393) — 회전 전 48px wrapper 좌표
const CTA_PAWS = [
  'left-[75.31%] top-[5.86%]',
  'left-[83.03%] top-[40.17%]',
  'left-[93.87%] top-[-5.32%]',
  'left-[87.75%] top-[-55.9%]',
]

const CtaArrowIcon = () => (
  <span className="flex h-4 shrink-0 items-center justify-center" aria-hidden>
    <svg
      viewBox="0 0 10.8333 16.6667"
      className="h-[0.8125rem] w-[0.5279rem] text-primary-600"
      fill="none"
    >
      <path d="M4.33333 0H0V4.16667H4.33333V0Z" fill="currentColor" />
      <path d="M7.58333 3.125H3.25V7.29167H7.58333V3.125Z" fill="currentColor" />
      <path d="M10.8333 6.25H6.5V10.4167H10.8333V6.25Z" fill="currentColor" />
      <path d="M7.58333 9.375H3.25V13.5417H7.58333V9.375Z" fill="currentColor" />
      <path d="M4.33333 12.5H0V16.6667H4.33333V12.5Z" fill="currentColor" />
    </svg>
  </span>
)

// Figma 2752-269487 — 카테고리 버튼(동물+pill+라벨)은 통짜 SVG. default/hover 2상태.
// ponytail: 3번째(도마뱀) 전용 아트가 없어 강아지 SVG로 임시 표기 — 리자드 SVG 나오면 src 교체.
const CATEGORIES = [
  { label: '고양이 찾기', href: '/explore?category=cat', src: 'cat' },
  { label: '강아지 찾기', href: '/explore?category=dog', src: 'dog' },
  { label: '도마뱀 찾기', href: '/explore?category=lizard', src: 'dog' },
  { label: '브리더 탐색', href: '/explore?type=breeder', src: 'explore' },
]

const HomeCategoryButton = ({ label, href, src }: (typeof CATEGORIES)[number]) => (
  <Link
    href={href}
    aria-label={label}
    className="group relative block h-[6.71875rem] w-[6.640625rem] pc:aspect-[192/177] pc:h-auto pc:w-full"
  >
    <Image
      src={`/images/category/${src}-default-md.svg`}
      alt={label}
      fill
      className="object-contain transition-opacity group-hover:opacity-0"
    />
    <Image
      src={`/images/category/${src}-hover-md.svg`}
      alt=""
      fill
      className="object-contain opacity-0 transition-opacity group-hover:opacity-100"
    />
  </Link>
)

const CategoryBrowse = () => {
  return (
    <>
      {/* 브리더 CTA 스트립 밴드 (Figma 2752-266432) — 밴드 py-8 flush.
          스트립 px-16 py-12(pc px-32) · 텍스트 12px→pc 14px */}
      <Container className="px-4 py-2">
        <div className="relative mx-auto flex w-full items-center justify-between overflow-hidden rounded-xl bg-secondary-200 px-4 py-3 pc:max-w-[70.875rem] pc:px-8">
          {/* 배경 픽셀 발자국 — 텍스트 뒤(z-0) */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {CTA_PAWS.map((pos, i) => (
              <span
                key={i}
                className={cn('absolute flex size-[3.02rem] items-center justify-center', pos)}
              >
                <Image
                  src="/images/category/cta-paw.svg"
                  alt=""
                  width={37}
                  height={32}
                  className="h-[1.9765rem] w-[2.2896rem] rotate-45"
                />
              </span>
            ))}
          </div>
          <div className="relative z-10 flex items-center gap-[0.4375rem]">
            <p
              className={cn(
                cafe24Proup.className,
                'text-xs leading-[1.5] text-primary-600 pc:text-sm',
              )}
            >
              신뢰할 수 있는 브리더 포퐁에서 만나요 !
            </p>
            <CtaArrowIcon />
          </div>
        </div>
      </Container>

      {/* 카테고리 밴드 (Figma 2752-269648) — 밴드 py-16(pc py-10) flush.
          모바일(~767px): 2×2 Grid / 태블릿 이상: 4개 한 줄 */}
      <Container className="px-4 py-4 pc:py-[0.625rem]">
        <div className="mx-auto grid w-full grid-cols-[repeat(2,6.640625rem)] place-items-center justify-center gap-x-[2.1875rem] gap-y-3 tab:flex tab:items-center tab:justify-center tab:gap-[2.1875rem] pc:grid pc:max-w-[60.5rem] pc:grid-cols-4 pc:gap-[4.1875rem]">
          {CATEGORIES.map((category) => (
            <HomeCategoryButton key={category.label} {...category} />
          ))}
        </div>
      </Container>
    </>
  )
}

export { CategoryBrowse }
