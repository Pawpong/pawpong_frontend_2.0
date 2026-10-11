import * as React from 'react'
import { tv, type VariantProps } from '@/shared/lib/tv'

// 놀이터 도트 선택 버튼 — 누르면 그림자 쪽으로 내려앉고, 고르면(aria-pressed) 통 튄다.
// 색은 감싼 티켓(data-accent)의 --accent·--accent-edge·--accent-ink 를 따른다.
const pixelChoiceButton = tv({
  slots: {
    root: 'group flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-lg border-2 border-secondary-200 bg-white px-4 py-3 text-left text-[0.9375rem] leading-[1.45] font-semibold break-keep text-neutral-850 shadow-[0.1875rem_0.1875rem_0_var(--color-secondary-100)] transition-[translate,box-shadow,border-color,background-color] duration-120 ease-out focus-ring hover:border-(--accent-edge) active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0.0625rem_0.0625rem_0_var(--color-secondary-100)] aria-pressed:animate-pixel-pick aria-pressed:border-(--accent-edge) aria-pressed:bg-(--accent) aria-pressed:text-(--accent-ink) aria-pressed:shadow-[0.1875rem_0.1875rem_0_color-mix(in_srgb,var(--accent-edge)_35%,transparent)] motion-reduce:animate-none motion-reduce:transition-none motion-reduce:active:translate-none',
    // 고른 답은 진한 띠 글자색 바탕에 흰 글자(4.5:1 이상)
    mark: 'grid size-7 shrink-0 place-items-center rounded-sm bg-(--accent) font-cafe24 text-[0.8125rem] leading-none text-(--accent-ink) group-aria-pressed:bg-(--accent-ink) group-aria-pressed:text-white',
  },
  variants: {
    // 노트북부터 여러 칸으로 놓일 때 아이콘 위·글자 아래 타일로 세운다 (외출 준비함 목적)
    tile: { true: { root: 'lap:flex-col lap:justify-center lap:gap-2 lap:px-1' } },
  },
})

interface PixelChoiceButtonProps
  extends
    Omit<React.ComponentProps<'button'>, 'className' | 'type'>,
    VariantProps<typeof pixelChoiceButton> {
  /** 앞에 붙는 순서 글자 (A, B…) */
  mark?: string
}

export const PixelChoiceButton = ({ mark, tile, children, ...props }: PixelChoiceButtonProps) => {
  const styles = pixelChoiceButton({ tile })
  return (
    <button type="button" className={styles.root()} {...props}>
      {mark && (
        <span aria-hidden className={styles.mark()}>
          {mark}
        </span>
      )}
      {children}
    </button>
  )
}
