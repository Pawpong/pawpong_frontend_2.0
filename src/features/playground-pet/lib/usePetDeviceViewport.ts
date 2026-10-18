'use client'

import { useEffect, useRef } from 'react'

/** 고정된 방의 높이가 오류 안내로 커져도 아래 조작 영역을 가리지 않게 한다. */
export function usePetDeviceViewport() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = root.current
    const device = element?.querySelector<HTMLElement>('[data-pet-device]')
    if (!element || !device) return
    const update = () => {
      element.style.setProperty(
        '--pet-device-height',
        `${Math.ceil(device.getBoundingClientRect().height)}px`,
      )
    }
    update()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
    observer?.observe(device)
    window.addEventListener('resize', update)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', update)
      element.style.removeProperty('--pet-device-height')
    }
  }, [])
  return root
}
