'use client'

import { useEffect, useRef, useState } from 'react'
import { CtaModal } from '@/shared/ui/CtaModal'
import { hasNativeCapability, requestCameraPermission } from './nativeBridge'

/** Android 새 설치에서 카메라 권한 확인 후에도 파일 피커는 실제 사용자 탭으로 연다. */
export function NativePhotoPickerBridge() {
  const [picker, setPicker] = useState<{ input: HTMLInputElement; granted: boolean } | null>(null)
  const allowedInput = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let active = true
    let requested = false
    let pending = false
    const intercept = (event: MouseEvent) => {
      const input = event.target
      if (!(input instanceof HTMLInputElement) || input.type !== 'file' || input.disabled) return
      if (allowedInput.current === input) {
        allowedInput.current = null
        return
      }
      if (!hasNativeCapability('cameraPermission') || requested) return
      if (!/image|\.(jpe?g|png|heic|heif)/i.test(input.accept)) return
      event.preventDefault()
      if (pending) return
      pending = true
      void requestCameraPermission()
        .catch(() => false)
        .then((granted) => {
          pending = false
          requested = true
          if (active && input.isConnected) setPicker({ input, granted })
        })
    }
    document.addEventListener('click', intercept, true)
    return () => {
      active = false
      document.removeEventListener('click', intercept, true)
    }
  }, [])

  return (
    <CtaModal
      open={picker !== null}
      onOpenChange={(open) => {
        if (!open) setPicker(null)
      }}
      title="사진을 선택해주세요"
      description={
        picker?.granted
          ? '사진을 촬영하거나 보관함에서 선택할 수 있어요.'
          : '카메라 권한 없이도 보관함의 사진은 선택할 수 있어요.'
      }
      actions={[
        { label: '취소', variant: 'outline', onClick: () => setPicker(null) },
        {
          label: '사진 선택',
          variant: 'fill',
          onClick: () => {
            const input = picker?.input
            setPicker(null)
            if (!input?.isConnected || input.disabled) return
            allowedInput.current = input
            input.click()
          },
        },
      ]}
    />
  )
}
