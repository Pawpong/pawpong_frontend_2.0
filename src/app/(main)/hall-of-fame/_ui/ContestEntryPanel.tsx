import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { buttonVariants } from '@/shared/ui'

interface ContestEntryPanelProps {
  /** 열려 있는 콘테스트가 없는 상태 — 참여해도 서버가 막으므로 문구로 먼저 알린다 */
  hasNoContest: boolean
  /** 후보가 한 명이라도 있는지 — 첫 참여자를 부르는 문구와 갈린다 */
  hasEntries: boolean
}

const copyFor = ({ hasNoContest, hasEntries }: ContestEntryPanelProps) => {
  if (hasNoContest) {
    return {
      headline: '다음 콘테스트를 준비하고 있어요',
      description:
        '지금은 열려 있는 콘테스트가 없어요. 열리면 이 자리에서 가장 먼저 도전할 수 있어요.',
    }
  }

  return {
    headline: hasEntries ? '우리 아이도 도전시켜보세요' : '이번주 첫 번째 주인공이 되어보세요',
    description: '사진 한 장이면 참여 끝. 지금 올리면 이번주 투표에 바로 올라가요.',
  }
}

/**
 * 콘테스트 참여 진입 배너.
 * 투표 섹션 맨 위에서 한 덩어리로 자리를 채워, 이 섹션이 무엇을 기다리는지 말한다.
 */
const ContestEntryPanel = (props: ContestEntryPanelProps) => {
  const { headline, description } = copyFor(props)

  return (
    <Link
      href="/hall-of-fame/participate"
      className="group flex w-full flex-col items-center gap-5 rounded-sm border-2 border-dashed border-secondary-400 bg-secondary-50 px-6 py-10 text-center transition-colors hover:border-secondary-600 hover:bg-secondary-100 tab:flex-row tab:justify-between tab:gap-6 tab:rounded-xl tab:px-10 tab:py-8 tab:text-left"
    >
      <div className="flex flex-col items-center gap-4 tab:flex-row tab:gap-5">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-secondary-200 transition-transform duration-200 group-hover:-translate-y-1">
          <Image
            src="/images/category/cta-paw.svg"
            alt=""
            width={37}
            height={32}
            className="h-[55%] w-auto"
          />
        </span>
        <div className="flex flex-col gap-1.5">
          <p className="font-cafe24 text-base leading-[1.4] text-neutral-850 tab:text-xl">
            {headline}
          </p>
          <p className="text-sm leading-[1.5] text-neutral-700">{description}</p>
        </div>
      </div>

      <span
        className={cn(
          buttonVariants({ variant: 'primary', size: 'sm' }),
          'shrink-0 px-5 whitespace-nowrap tab:h-10 tab:px-6 tab:text-base',
        )}
      >
        도전하러 가기
      </span>
    </Link>
  )
}

export { ContestEntryPanel }
