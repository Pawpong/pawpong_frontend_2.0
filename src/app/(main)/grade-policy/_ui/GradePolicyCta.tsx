'use client'

import Link from 'next/link'
import { useAuthStatus } from '@/features/auth'
import { cn } from '@/shared/lib/cn'
import { buttonVariants } from '@/shared/ui'

const GradePolicyCta = () => {
  const { isReady, isLoggedIn, userRole } = useAuthStatus()
  const isBreeder = isReady && isLoggedIn && userRole === 'breeder'

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-neutral-850 p-5 text-neutral-50 tab:flex-row tab:items-center tab:justify-between tab:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-cafe24 text-xl">
          {isBreeder ? '내 등급과 심사 상태를 확인해보세요' : '확인된 브리더를 만나보세요'}
        </h2>
        <p className="text-sm leading-[1.6] font-medium text-neutral-200 tab:text-base">
          {isBreeder
            ? 'New 승인 후에는 추가 자료만으로 Elite 심사를 신청할 수 있어요.'
            : '분양글과 공개 프로필에서 브리더의 확인 등급을 함께 살펴볼 수 있어요.'}
        </p>
      </div>
      <Link
        href={isBreeder ? '/grade-policy/apply' : '/explore'}
        className={cn(
          buttonVariants({ variant: 'primary', size: 'lg' }),
          'w-full shrink-0 px-6 tab:w-auto',
        )}
      >
        {isBreeder ? '등급 확인·신청' : '브리더 둘러보기'}
      </Link>
    </section>
  )
}

export { GradePolicyCta }
