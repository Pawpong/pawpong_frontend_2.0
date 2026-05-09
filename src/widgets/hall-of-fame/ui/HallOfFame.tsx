import { Container, SectionHeader } from '@/shared/ui'

const HallOfFame = () => {
  return (
    <Container className="mt-[3rem]">
      <div className="flex flex-col gap-[0.75rem]">
        <SectionHeader
          title="명예의 전당(주간베스트 동물)"
          linkText="이번주 투표하기"
          linkHref="/vote"
        />
        <div className="grid grid-cols-3 gap-[0.75rem] tab:gap-[1.25rem]">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-[6.5rem] rounded-[0.5rem] bg-[#c6c6c6] tab:h-[14rem] tab:rounded-[1.0625rem]"
            />
          ))}
        </div>
      </div>
    </Container>
  )
}

export { HallOfFame }
