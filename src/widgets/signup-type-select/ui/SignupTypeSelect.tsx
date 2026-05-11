'use client'

import { useRouter } from 'next/navigation'
import { UserTypeCard } from './UserTypeCard'

const USER_TYPE_OPTIONS = [
  { value: 'general' as const, label: '일반' },
  { value: 'breeder' as const, label: '브리더' },
]

const SignupTypeSelect = () => {
  const router = useRouter()

  const handleSelect = (type: 'general' | 'breeder') => {
    router.push(`/signup/${type}`)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex h-[5rem] w-full items-center justify-center py-[0.625rem] tab:h-[7.8125rem]">
        <h1 className="text-center text-[1.25rem] font-bold leading-snug text-[#5d5d5d] tab:text-[2rem]">
          회원 유형을 선택해 주세요
        </h1>
      </div>

      <div className="mt-[2rem] flex flex-col items-center gap-[1.3125rem] tab:mt-[13.9375rem] tab:flex-row tab:gap-[5.585rem]">
        {USER_TYPE_OPTIONS.map((option) => (
          <UserTypeCard
            key={option.value}
            label={option.label}
            onClick={() => handleSelect(option.value)}
          />
        ))}
      </div>
    </div>
  )
}

export { SignupTypeSelect }
