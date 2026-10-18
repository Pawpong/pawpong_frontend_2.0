import { useEffect, useRef } from 'react'

/** iOS 키보드가 열린 동안에도 입력창을 실제 보이는 영역 안에 둔다. */
export function useSupportViewport(open: boolean) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const viewport = window.visualViewport
    const update = () => {
      const content = contentRef.current
      if (!content) return
      content.style.setProperty(
        '--support-viewport-height',
        `${viewport?.height ?? window.innerHeight}px`,
      )
      content.style.setProperty('--support-viewport-top', `${viewport?.offsetTop ?? 0}px`)
    }
    update()
    viewport?.addEventListener('resize', update)
    viewport?.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      viewport?.removeEventListener('resize', update)
      viewport?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [open])

  return contentRef
}
