import { Container, SectionHeader } from '@/shared/ui'

const FAQ_ITEMS = [
  '혹시 사기나 허위 브리더가 있을까 걱정돼요',
  '혹시 사기나 허위 브리더가 있을까 걱정돼요',
  '혹시 사기나 허위 브리더가 있을까 걱정돼요',
  '혹시 사기나 허위 브리더가 있을까 걱정돼요',
  '혹시 사기나 허위 브리더가 있을까 걱정돼요',
]

const FaqSection = () => {
  return (
    <Container className="mt-[3rem] pb-[3rem]">
      {/* 서비스 소개 카드 */}
      <div className="flex h-[8rem] flex-col justify-between rounded-[1.0625rem] bg-[#ebebeb] p-[1.375rem] tab:h-[15.875rem] tab:w-[18.9375rem] tab:shrink-0">
        <div className="flex gap-[0.5rem] tab:flex-col tab:gap-0">
          <p className="text-[1rem] font-bold text-[#5d5d5d] tab:text-[1.25rem]">
            신뢰할 수 있는 브리더
          </p>
          <p className="text-[1rem] font-bold text-[#999] tab:text-[1.25rem]">
            포퐁에서 만나요
          </p>
        </div>
        <div className="flex h-[3rem] items-center justify-center gap-[0.625rem] rounded-full bg-[#d4d4d4]">
          <span className="text-[1rem] font-semibold text-[#5d5d5d]">
            서비스 소개
          </span>
          <span className="text-[#5d5d5d]">{`>`}</span>
        </div>
      </div>

      {/* 자주묻는 질문 */}
      <div className="mt-[2rem]">
        <SectionHeader
          title="자주 묻는 질문"
          linkText="자세히 보기"
          linkHref="/faq"
        />
        <div className="mt-[0.75rem] grid grid-cols-1 gap-0 tab:mt-[1rem] tab:grid-cols-2">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="border-b border-[#a8a8a8] py-[0.75rem] tab:py-[1.25rem]"
            >
              <p className="text-[0.875rem] font-semibold text-[#818181] tab:text-[1rem]">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}

export { FaqSection }
