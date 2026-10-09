import Link from 'next/link'
import {
  PawPrintIcon,
  PixelArrowRightIcon,
  PixelMessageIcon,
  PixelPencilIcon,
} from '@/shared/assets'
import { MOBILE_APP } from '@/shared/config/mobileApp'
import { createPageMetadata } from '@/shared/lib/metadata'
import { createMobileAppStructuredData } from '@/shared/lib/mobileApp'
import { Container, NavigationBar, buttonVariants } from '@/shared/ui'
import { FeatureIntro } from '@/shared/ui/FeatureIntro'
import { TicketLink } from '@/shared/ui/Ticket'

export const metadata = createPageMetadata({
  title: '포퐁 앱 다운로드 · iOS와 Android',
  description:
    '포퐁 iOS·Android 앱을 App Store와 Google Play에서 만나보세요. 반려동물 탐색, 브리더 상담과 채팅, 반려동물 일상 공유를 앱에서도 함께하세요.',
  path: '/app',
})

// 놀이터·서비스 소개와 같은 티켓 카드로 앱에서 할 수 있는 일을 잇는다.
const FEATURES = [
  {
    title: '새로운 가족을 만나요',
    body: '강아지·고양이·파충류와 브리더의 정보를 확인해요.',
    href: '/explore',
    label: '반려동물 탐색하기',
    tag: 'EXPLORE',
    accent: 'butter',
    Icon: PawPrintIcon,
  },
  {
    title: '궁금한 이야기를 나눠요',
    body: '브리더와 채팅으로 건강 상태와 입양 조건을 상담해요.',
    href: '/about',
    label: '포퐁 이용 방법 보기',
    tag: 'CHAT',
    accent: 'blue',
    Icon: PixelMessageIcon,
  },
  {
    title: '우리 아이의 일상을 함께해요',
    body: '커뮤니티에서 반려동물의 사진과 이야기를 나눠요.',
    href: '/community',
    label: '커뮤니티 둘러보기',
    tag: 'COMMUNITY',
    accent: 'green',
    Icon: PixelPencilIcon,
  },
] as const

export default function AppDownloadPage() {
  return (
    <div className="flex w-full flex-1 flex-col bg-white pb-12">
      <NavigationBar title="포퐁 앱" backHref="/" />
      <Container className="py-6 tab:py-10">
        <div className="mx-auto max-w-4xl space-y-8 tab:space-y-10">
          <FeatureIntro eyebrow="내 손안의 포퐁" title="좋은 만남을, 앱에서도">
            새로운 가족을 찾고, 브리더와 이야기하고, 우리 아이의 일상을 나눠요. iPhone과 Android에서
            포퐁을 만나보세요.
          </FeatureIntro>

          <section
            aria-labelledby="app-download-title"
            className="rounded-2xl border border-secondary-200 bg-base-white p-5 tab:p-8"
          >
            <h2
              id="app-download-title"
              className="font-cafe24 text-xl text-neutral-850 tab:text-2xl"
            >
              포퐁 앱 다운로드
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              사용하는 기기에 맞는 공식 스토어에서 무료로 다운로드할 수 있어요.
            </p>
            <div className="mt-5 grid gap-3 tab:grid-cols-2">
              <a
                href={MOBILE_APP.ios.storeUrl}
                className={buttonVariants({ intent: 'primary', width: 'full' })}
              >
                App Store에서 받기 <span aria-hidden>↗</span>
              </a>
              <a
                href={MOBILE_APP.android.storeUrl}
                className={buttonVariants({ intent: 'secondary', width: 'full' })}
              >
                Google Play에서 받기 <span aria-hidden>↗</span>
              </a>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-neutral-700">
              App Store는 iPhone·iPad, Google Play는 Android 기기용이에요.
            </p>
          </section>

          <section aria-labelledby="app-features-title">
            <h2
              id="app-features-title"
              className="font-cafe24 text-xl text-neutral-850 tab:text-2xl"
            >
              포퐁에서 함께하는 하루
            </h2>
            <ul className="mt-4 grid gap-4 lap:grid-cols-3">
              {FEATURES.map(({ href, tag, accent, Icon, title, body, label }) => (
                <li key={href}>
                  <TicketLink
                    href={href}
                    label={tag}
                    icon={<Icon aria-hidden className="size-4" />}
                    accent={accent}
                    title={title}
                    body={body}
                    cta={label}
                    size="sm"
                  />
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="app-links-title"
            className="space-y-3 text-sm leading-relaxed text-neutral-700"
          >
            <h2 id="app-links-title" className="font-semibold text-neutral-850">
              웹에서 보던 이야기를 앱에서도
            </h2>
            <p>
              포퐁 공유 링크는 웹에서도 볼 수 있어요. 앱이 설치되어 있고 기기의 앱 링크 열기가
              허용되어 있다면 해당 화면으로 이어집니다. 앱이 없다면 공유 화면의 다운로드 버튼을
              이용해 주세요.
            </p>
            <Link
              href="/faq"
              className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary-600 focus-ring hover:underline"
            >
              이용에 도움이 필요해요
              <PixelArrowRightIcon aria-hidden className="size-3" />
            </Link>
          </section>
        </div>
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createMobileAppStructuredData()).replace(/</g, '\\u003c'),
        }}
      />
    </div>
  )
}
