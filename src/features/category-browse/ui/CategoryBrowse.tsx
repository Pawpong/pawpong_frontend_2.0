import Link from 'next/link'
import { Container, PixelTab } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { CatIcon, DogIcon, GekoIcon, SearchIcon } from './CategoryAnimalIcon'

//QA: 홈 카테고리 라벨 칩 — Figma "animal-tab"/"search"의 (home)tab-btn 은 온보딩 단계칩과
//QA: 같은 btn-pixel 에셋이라 기존 PixelTab 컴포넌트를 그대로 재사용한다. compactTablet 을
//QA: 쓰면 내부 SVG 아트는 pc: 에서만 커지지만, 루트 너비·높이·라벨 폰트는 PixelTab 자체
//QA: 로직상 tab: 에서 먼저 커져버리므로(w-[11.991rem]/h-[3.837rem]/text-base) 여기서 tab:
//QA: 값도 명시적으로 재정의해 pc: 에서만 커지게 맞춘다 — 안 하면 tab 구간에서 폭만 md로 커진다.
const CHIP_CLASS_NAME = 'h-[2.125rem] w-full tab:h-[2.125rem] tab:w-full pc:h-[3.837rem]'
const CHIP_LABEL_CLASS_NAME = 'text-[0.625rem] tab:text-[0.625rem] pc:text-base'

//QA: 카테고리 아이콘 — Figma 4041-597390(animal-tab)·2752-269024(search) 의 sm/md 두
//QA: 사이즈가 각각 균등 배율 관계라 벡터 하나를 CSS로만 키워 쓴다. 아이콘 박스 크기·안쪽
//QA: 여백도 그 비율 그대로 sm/md 두 지점 값을 써서 pc 이상에서만 커지도록 한다.
const CATEGORIES = [
  {
    label: '고양이 찾기',
    href: '/explore?category=cat',
    Icon: CatIcon,
    iconBoxClassName: 'mb-[-28px] size-[86.5px] pc:mb-[-50px] pc:size-[155px]',
    iconAlign: 'items-end',
    iconPadding: 'px-[13.952px] py-[16.742px] pc:px-[25px] pc:py-[30px]',
  },
  {
    label: '강아지 찾기',
    href: '/explore?category=dog',
    Icon: DogIcon,
    iconBoxClassName: 'mb-[-28px] size-[86.5px] pc:mb-[-50px] pc:size-[155px]',
    iconAlign: 'items-end',
    iconPadding: 'px-[13.952px] pt-[22.323px] pb-[16.742px] pc:px-[25px] pc:pt-[40px] pc:pb-[30px]',
  },
  {
    label: '도마뱀 찾기',
    href: '/explore?category=lizard',
    Icon: GekoIcon,
    iconBoxClassName: 'mb-[-28px] size-[86.5px] pc:mb-[-50px] pc:size-[155px]',
    iconAlign: 'items-end',
    // 다리 끝부분만 버튼 위쪽 얇은 여백(픽셀 테두리 계단 부분) 안으로 살짝 들어가 보이도록
    // 겹침을 얕게 잡는다 (몸통은 버튼 뒤로 가려지지 않고, 다리만 버튼 경계에 걸침).
    iconPadding: 'px-[2.79px] pb-[26px] pc:px-[5px] pc:pb-[46.6px]',
  },
  {
    label: '브리더 탐색',
    href: '/explore?type=breeder',
    Icon: SearchIcon,
    // search 아이콘은 겹침 없이 칩 바로 위에 붙는다 (animal-tab과 달리 mb 오프셋 없음).
    iconBoxClassName: 'size-[53.818px] pc:size-[106px]',
    iconAlign: 'items-center',
    iconPadding: 'p-[8.123px] pc:p-[16px]',
  },
] as const

const HomeCategoryButton = ({
  label,
  href,
  Icon,
  iconBoxClassName,
  iconAlign,
  iconPadding,
}: (typeof CATEGORIES)[number]) => (
  <Link
    href={href}
    aria-label={label}
    className="group relative flex w-full max-w-[6.640625rem] flex-col items-center pc:w-[11.991rem] pc:max-w-none"
  >
    {/* //QA: 겹침 순서 수정 — 아이콘은 버튼(칩) 뒤로 가야 하므로 z-index를 주지 않고
        //QA: DOM 순서(칩이 뒤에 옴)로만 쌓는다. 겹치는 부분은 칩에 자연스럽게 가려진다. */}
    <div
      className={cn(
        'relative flex justify-center overflow-hidden',
        iconBoxClassName,
        iconAlign,
        iconPadding,
      )}
    >
      <Icon className="h-auto w-full" />
    </div>
    <div className="relative w-full">
      <PixelTab
        compactTablet
        label={label}
        status="default"
        className={CHIP_CLASS_NAME}
        labelClassName={CHIP_LABEL_CLASS_NAME}
      />
      <PixelTab
        compactTablet
        label={label}
        status="active"
        className={cn(
          CHIP_CLASS_NAME,
          'absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100',
        )}
        labelClassName={CHIP_LABEL_CLASS_NAME}
      />
    </div>
  </Link>
)

const CategoryBrowse = () => {
  return (
    <>
      {/*
        //QA: 모바일 카테고리 배치 수정 — 375~767px에서는 2x2, 탭·PC에서는 4개 한 줄로 정렬한다.
        //QA: 버튼 크기 수정 — 각 카테고리의 원본 비율을 유지하면서 태블릿·PC 간격을 적용한다.
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
