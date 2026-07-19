import { Container, DetailLink, ProfileAvatar, SectionHeader } from '@/shared/ui'

// ponytail: 명예의 전당 API 미연결 — 카드 3개 정적 플레이스홀더. 연결 시 homeQueries에 추가하고 map으로 교체.
const PLACEHOLDER_TEXT =
  '명예의 전당 내용을 작성해주세요 명예의 전당 내용을 작성해주세요명예의 전당 내용을 작성해주세요명예의 전당 내용을 작성해주세요'

const CARDS = Array.from({ length: 3 }, (_, i) => i)

/** 아바타 + 이름 — large / md-avator 카드 공용 */
const CardProfile = () => (
  <div className="flex items-center gap-[0.5rem]">
    <ProfileAvatar size="small" className="shrink-0" />
    <span className="text-[0.875rem] leading-[1.5] font-semibold text-text-primary">profile</span>
  </div>
)

/** Figma card-vote: large — PC 세로형 (본문 14px + 브리더홈 링크) */
const HallOfFameCard = () => (
  <div className="flex w-[17.625rem] shrink-0 flex-col">
    {/* 이미지 — API 연결 전 회색 플레이스홀더 */}
    <div className="aspect-[348/284] w-full rounded-[0.5rem] bg-[#6b6b6b]" />

    <div className="flex flex-col gap-[0.75rem] p-[0.75rem]">
      <p className="line-clamp-2 text-[0.875rem] leading-[1.5] font-semibold text-[#6b6b6b]">
        {PLACEHOLDER_TEXT}
      </p>
      <div className="flex items-center justify-between">
        <CardProfile />
        <DetailLink href="/home" label="브리더홈" size="md" />
      </div>
    </div>
  </div>
)

/** Figma card-vote: md-avator — 모바일·태블릿 가로형 (본문 12px, 링크 없음) */
const HallOfFameCardCompact = () => (
  <div className="flex w-full items-center gap-[1rem] rounded-[0.5rem] bg-[#f6f6f6] p-[0.5rem]">
    <div className="size-[6.875rem] shrink-0 rounded-[0.25rem] bg-[#6b6b6b]" />
    <div className="flex flex-1 flex-col justify-between self-stretch">
      <p className="line-clamp-3 text-[0.75rem] leading-[1.5] font-semibold text-[#6b6b6b]">
        {PLACEHOLDER_TEXT}
      </p>
      <CardProfile />
    </div>
  </div>
)

const HallOfFame = () => {
  return (
    <Container className="py-6 tab:py-8 pc:py-12">
      <div className="flex flex-col gap-[0.75rem]">
        <SectionHeader title="명예의 전당" linkText="이번주 명예의 동물 투표하기" linkHref="/vote" />

        {/* 모바일·태블릿: 가로형 카드 세로 스택 (Figma 940-37598) */}
        <div className="flex flex-col gap-[0.75rem] pc:hidden">
          {CARDS.map((i) => (
            <HallOfFameCardCompact key={i} />
          ))}
        </div>

        {/* PC: 세로형 카드 가운데 정렬, gap 80px (Figma 1555-88218) */}
        <div className="hidden flex-wrap items-start justify-center gap-[5rem] pc:flex">
          {CARDS.map((i) => (
            <HallOfFameCard key={i} />
          ))}
        </div>
      </div>
    </Container>
  )
}

export { HallOfFame }
