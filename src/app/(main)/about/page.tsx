import Link from 'next/link'
import { Container, NavigationBar } from '@/shared/ui'

/** 현재 제공하는 서비스와 실제 진입점을 안내한다. */
const AboutPage = () => (
  <div className="flex w-full flex-1 flex-col bg-white pb-16">
    <NavigationBar title="서비스 소개" backHref="/" />
    <Container className="py-8 tab:py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <section className="space-y-4">
          <h1 className="font-cafe24 text-2xl text-primary-500">새로운 가족과의 만남, 포퐁</h1>
          <p className="leading-relaxed text-neutral-700">
            포퐁은 반려동물을 만나고 브리더와 소통하는 공간입니다. 강아지·고양이·파충류를 탐색하고,
            입양 전에 필요한 정보를 확인해 주세요.
          </p>
        </section>
        <section className="space-y-4 rounded-xl bg-point-50 p-6">
          <h2 className="font-semibold">이렇게 이용해 보세요</h2>
          <ol className="list-inside list-decimal space-y-3 text-sm leading-relaxed">
            <li>탐색에서 동물과 브리더의 공개 정보를 확인해요.</li>
            <li>관심 있는 동물의 상세 화면에서 입양 신청을 작성해요.</li>
            <li>채팅으로 브리더와 건강 상태·사육 환경·분양 조건을 상담해요.</li>
            <li>커뮤니티에서 반려동물의 일상을 나눠요.</li>
          </ol>
        </section>
        <p className="text-sm leading-relaxed text-neutral-700">
          분양 조건과 비용은 브리더에게 직접 확인해 주세요. 서비스 이용이 어렵다면 FAQ와 문의 안내를
          이용할 수 있어요.
        </p>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-primary-500">
          <Link href="/explore" className="underline underline-offset-4">
            동물 탐색하기
          </Link>
          <Link href="/community" className="underline underline-offset-4">
            커뮤니티 둘러보기
          </Link>
          <Link href="/faq" className="underline underline-offset-4">
            FAQ·문의 안내
          </Link>
        </div>
      </div>
    </Container>
  </div>
)

export default AboutPage
