import { Container, SectionHeader } from '@/shared/ui'

const CommunityShowcase = () => {
  return (
    <Container className="mt-[3rem]">
      <div className="flex flex-col gap-[0.75rem]">
        <SectionHeader
          title="우리 아이 자랑하기"
          linkText="커뮤니티 보러가기"
          linkHref="/community"
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

export { CommunityShowcase }
