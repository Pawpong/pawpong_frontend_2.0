import { CheckRoundedIcon, PawIcon, PixelStarFillIcon } from '@/shared/assets'
import { Badge, Container, NavigationBar } from '@/shared/ui'

const LEVELS = [
  {
    id: 'new',
    label: '뉴 브리더',
    description: '포퐁의 기본 서류 심사를 통과한 브리더예요.',
    badgeVariant: 'primaryOutline' as const,
    icon: PawIcon,
    requirements: ['본인 확인이 가능한 신분증 사본', '유효한 동물생산업 등록증'],
  },
  {
    id: 'elite',
    label: '엘리트 브리더',
    description: '추가 전문성 자료까지 확인한 브리더예요.',
    badgeVariant: 'pointFilled' as const,
    icon: PixelStarFillIcon,
    requirements: [
      '뉴 브리더의 기본 확인 서류',
      '실제 사용하는 표준 입양계약서 샘플',
      '협회 활동 또는 브리더 전문성을 확인할 수 있는 증빙 1종 이상',
    ],
  },
] as const

const REVIEW_RULES = [
  '모든 브리더는 뉴 브리더 심사부터 시작하며, 승인된 정보만 서비스에 표시합니다.',
  '엘리트 등급은 뉴 브리더 승인 후 추가 자료를 제출한 경우에 별도로 심사합니다.',
  '제출 서류가 만료되거나 허위 정보·서약 위반이 확인되면 등급을 보류하거나 회수할 수 있습니다.',
  '등급은 포퐁의 서류 확인 범위를 뜻하며, 개별 동물의 건강이나 입양 결과를 보증하지 않습니다.',
] as const

const LevelCard = ({ level }: { level: (typeof LEVELS)[number] }) => {
  const Icon = level.icon

  return (
    <article className="flex h-full flex-col gap-5 rounded-xl border border-neutral-150 bg-white p-5 shadow-[0_7px_7px_rgba(55,55,55,0.06)] tab:p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-point-50 text-primary-500">
          <Icon className="size-7" aria-hidden />
        </span>
        <Badge variant={level.badgeVariant} size="lg">
          {level.label}
        </Badge>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="font-cafe24 text-xl text-neutral-850">{level.label}</h2>
        <p className="text-sm leading-[1.6] font-medium text-neutral-700 tab:text-base">
          {level.description}
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-neutral-150 pt-4">
        <h3 className="text-sm font-semibold text-neutral-850 tab:text-base">확인하는 자료</h3>
        <ul className="flex flex-col gap-2.5">
          {level.requirements.map((requirement) => (
            <li
              key={requirement}
              className="flex items-start gap-2 text-sm leading-[1.6] font-medium text-neutral-700 tab:text-base"
            >
              <CheckRoundedIcon className="mt-0.5 size-5 shrink-0 text-primary-500" aria-hidden />
              <span>{requirement}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

const GradePolicyContent = () => (
  <div className="flex w-full flex-1 flex-col bg-primary-50/20 pb-16">
    <NavigationBar title="브리더 등급 정책" backHref="/" />

    <Container className="py-5 tab:py-8 pc:py-10">
      <div className="mx-auto flex w-full max-w-168 flex-col gap-5 tab:gap-6 pc:max-w-[59.25rem]">
        <section className="overflow-hidden rounded-xl border border-primary-100 bg-white shadow-[0_7px_7px_rgba(55,55,55,0.06)]">
          <div className="flex flex-col gap-3 bg-point-50 px-5 py-6 tab:px-6 tab:py-8">
            <span className="text-sm font-semibold text-primary-600">Pawpong verification</span>
            <h1 className="font-cafe24 text-2xl leading-[1.35] text-neutral-850 tab:text-[2rem]">
              브리더를 더 투명하게 확인해요
            </h1>
            <p className="max-w-[42rem] text-sm leading-[1.7] font-medium text-neutral-700 tab:text-base">
              등급은 브리더가 제출한 자격·등록 자료를 포퐁이 확인한 범위를 보여줍니다. 입양 전에는
              각 분양글의 건강 정보와 계약 조건도 함께 확인해주세요.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 tab:grid-cols-2 tab:gap-5">
          {LEVELS.map((level) => (
            <LevelCard key={level.id} level={level} />
          ))}
        </section>

        <section className="rounded-xl border border-neutral-150 bg-white p-5 shadow-[0_7px_7px_rgba(55,55,55,0.06)] tab:p-6">
          <h2 className="font-cafe24 text-xl text-neutral-850">심사와 표시 원칙</h2>
          <ol className="mt-4 flex flex-col gap-3">
            {REVIEW_RULES.map((rule, index) => (
              <li
                key={rule}
                className="flex items-start gap-3 text-sm leading-[1.65] font-medium text-neutral-700 tab:text-base"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600">
                  {index + 1}
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ol>
        </section>

        <p className="px-1 text-xs leading-[1.6] font-medium text-neutral-500 tab:text-sm">
          시행일 2026.08.31 · 정책이 바뀌면 적용 전에 공지사항을 통해 안내합니다.
        </p>
      </div>
    </Container>
  </div>
)

export { GradePolicyContent }
