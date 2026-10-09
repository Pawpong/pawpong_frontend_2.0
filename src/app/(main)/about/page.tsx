import { createPageMetadata } from '@/shared/lib/metadata'

import { PawPrintIcon, PixelMessageIcon, PixelPencilIcon } from '@/shared/assets'
import { Container, NavigationBar } from '@/shared/ui'
import { FeatureIntro } from '@/shared/ui/FeatureIntro'
import { TicketLink } from '@/shared/ui/Ticket'

export const metadata = createPageMetadata({
  title: '서비스 소개',
  description: '반려동물과 가족의 좋은 만남을 연결하는 포퐁을 소개합니다.',
  path: '/about',
})

const STEPS = [
  '탐색에서 동물과 브리더의 공개 정보를 확인해요.',
  '관심 있는 동물의 상세 화면에서 입양 신청을 작성해요.',
  '채팅으로 브리더와 건강 상태·사육 환경·분양 조건을 상담해요.',
  '커뮤니티에서 반려동물의 일상을 나눠요.',
] as const

// 놀이터·앱 안내와 같은 티켓 카드로 실제 진입점을 잇는다.
const STARTS = [
  {
    href: '/explore',
    label: 'EXPLORE',
    title: '동물 탐색하기',
    body: '강아지·고양이·파충류와 브리더의 공개 정보를 살펴봐요.',
    cta: '탐색하러 가기',
    Icon: PawPrintIcon,
    accent: 'butter',
  },
  {
    href: '/community',
    label: 'COMMUNITY',
    title: '커뮤니티 둘러보기',
    body: '반려동물의 일상과 궁금한 이야기를 함께 나눠요.',
    cta: '이야기 보러 가기',
    Icon: PixelPencilIcon,
    accent: 'blue',
  },
  {
    href: '/faq',
    label: 'HELP',
    title: 'FAQ·문의 안내',
    body: '이용이 어렵다면 자주 묻는 질문과 문의 방법을 확인해요.',
    cta: '도움말 보기',
    Icon: PixelMessageIcon,
    accent: 'green',
  },
] as const

/** 현재 제공하는 서비스와 실제 진입점을 안내한다. */
const AboutPage = () => (
  <div className="flex w-full flex-1 flex-col bg-white pb-16">
    <NavigationBar title="서비스 소개" backHref="/" />
    <Container className="py-6 tab:py-10">
      <div className="mx-auto max-w-4xl space-y-8 tab:space-y-10">
        <FeatureIntro eyebrow="포퐁을 소개해요" title="새로운 가족과의 만남, 포퐁">
          포퐁은 반려동물을 만나고 브리더와 소통하는 공간이에요. 강아지·고양이·파충류를 탐색하고,
          입양 전에 필요한 정보를 확인해 주세요.
        </FeatureIntro>

        <section aria-labelledby="about-steps">
          <h2 id="about-steps" className="font-cafe24 text-xl text-neutral-850 tab:text-2xl">
            이렇게 이용해 보세요
          </h2>
          <ol className="mt-4 grid gap-3 tab:grid-cols-2">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-3 rounded-xl border border-secondary-200 bg-base-white p-4 text-sm leading-6 break-keep text-neutral-850"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-point-200 text-xs font-semibold">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-6 break-keep text-neutral-700">
            분양 조건과 비용은 브리더에게 직접 확인해 주세요.
          </p>
        </section>

        <section aria-labelledby="about-start">
          <h2 id="about-start" className="font-cafe24 text-xl text-neutral-850 tab:text-2xl">
            바로 시작하기
          </h2>
          <ul className="mt-4 grid gap-4 lap:grid-cols-3">
            {STARTS.map(({ href, label, title, body, cta, Icon, accent }) => (
              <li key={href}>
                <TicketLink
                  href={href}
                  label={label}
                  icon={<Icon aria-hidden className="size-4" />}
                  accent={accent}
                  title={title}
                  body={body}
                  cta={cta}
                  size="sm"
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Container>
  </div>
)

export default AboutPage
