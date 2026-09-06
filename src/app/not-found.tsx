import Link from 'next/link'
import { buttonVariants, FullPageMessage } from '@/shared/ui'

export default function NotFound() {
  return (
    <FullPageMessage
      badge="404"
      title="페이지를 찾을 수 없어요"
      description={<p>주소가 바뀌었거나 사라진 페이지예요. 홈에서 다시 찾아볼까요?</p>}
      actions={
        <Link
          href="/"
          className={buttonVariants({ variant: 'primary', size: 'lg', className: 'w-full px-5' })}
        >
          홈으로 돌아가기
        </Link>
      }
    />
  )
}
