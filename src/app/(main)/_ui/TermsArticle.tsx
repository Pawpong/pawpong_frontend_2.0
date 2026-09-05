import { Container, NavigationBar } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'

export interface TermsContentItem {
  text: string
  /** -1: pl-1 / 0: pl-1.5 / 1: pl-4 / 2: pl-6 / 3: pl-10 / 4: pl-14 */
  indentLevel?: number
}

export interface TermsSection {
  heading: string
  contents: TermsContentItem[]
}

const INDENT_CLASS: Record<number, string> = {
  [-1]: 'pl-1',
  0: 'pl-1.5',
  1: 'pl-4',
  2: 'pl-6',
  3: 'pl-10',
  4: 'pl-14',
}

const BODY_CLASS = 'text-sm leading-[1.6] text-neutral-700'

interface TermsArticleProps {
  title: string
  intro: string
  sections: TermsSection[]
}

/**
 * 약관류 정적 문서 공통 레이아웃 (이용약관 · 개인정보처리방침).
 * 구 pawpong_frontend 의 terms 페이지 본문 구조(intro + 조항 섹션 + 들여쓰기)를
 * 2.0 토큰(NavigationBar·Container·neutral 팔레트)으로 옮겼다.
 */
const TermsArticle = ({ title, intro, sections }: TermsArticleProps) => (
  <div className="flex w-full flex-col">
    <NavigationBar title={title} backHref="/" />
    <Container className="px-4 py-6 tab:py-10">
      <div className="mx-auto flex w-full max-w-[41.25rem] flex-col gap-6">
        <h1 className="text-xl font-semibold text-neutral-850 tab:text-2xl">{title}</h1>
        <p className={BODY_CLASS}>{intro}</p>
        <div className="flex flex-col gap-5">
          {sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-neutral-850">{section.heading}</h2>
              <div className="flex flex-col gap-0.5">
                {section.contents.map((item) => (
                  <p
                    key={`${section.heading}-${item.text.slice(0, 24)}`}
                    className={cn(
                      BODY_CLASS,
                      item.indentLevel !== undefined && INDENT_CLASS[item.indentLevel],
                    )}
                  >
                    {item.text}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Container>
  </div>
)

export { TermsArticle }
