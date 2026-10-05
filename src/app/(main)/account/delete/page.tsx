import { createPageMetadata } from '@/shared/lib/metadata'

import { NavigationBar } from '@/shared/ui/NavigationBar'
import { AccountDeletionContent } from './_ui/AccountDeletionContent'

export const metadata = createPageMetadata({
  title: '계정 영구삭제',
  description: '포퐁 계정과 연결된 서비스 데이터의 영구삭제 절차를 안내합니다.',
  path: '/account/delete',
})

export default function AccountDeletionPage() {
  return (
    <div className="flex flex-1 flex-col pb-20">
      <NavigationBar title="계정 영구삭제" backHref="/" />
      <section className="mx-auto w-full max-w-168 px-4 py-6 tab:px-8 tab:py-10">
        <h1 className="mb-2 font-cafe24 text-xl text-neutral-850">포퐁 계정 영구삭제</h1>
        <p className="mb-6 text-sm leading-relaxed text-neutral-700">
          계정과 연결된 서비스 데이터를 영구삭제할 수 있어요.
        </p>
        <AccountDeletionContent />
      </section>
    </div>
  )
}
