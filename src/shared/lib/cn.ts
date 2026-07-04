import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// 커스텀 폰트사이즈 토큰(text-body-*)을 font-size 그룹으로 등록.
// 기본 설정은 이를 텍스트 색상으로 오분류해 text-[#...] 등 색상 클래스를 잘못 제거함
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['body-s', 'body-sm', 'body-md', 'body-lg', 'body-xl'] }],
    },
  },
})

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))
