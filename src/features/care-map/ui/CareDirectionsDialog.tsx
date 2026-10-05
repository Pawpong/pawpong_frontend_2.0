'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import type { CarePlace } from '@/entities/care-place'
import { cafe24Proup } from '@/shared/lib/fonts'
import { getNativePlatform } from '@/shared/lib/nativeBridge'
import { careDirectionsHref, getCareDirections } from '../lib/care-directions'
import { CareMapIcon } from './CareMapIcon'

export function CareDirectionsDialog({ place }: { place: CarePlace }) {
  const [nativeApp, setNativeApp] = useState(false)
  const links = getCareDirections(place)
  if (!links.length) return null
  return (
    <Dialog.Root
      onOpenChange={(open) => {
        if (open) setNativeApp(getNativePlatform() !== null)
      }}
    >
      <Dialog.Trigger asChild>
        <button type="button" className="care-map-button care-map-button-primary flex-1">
          <CareMapIcon name="arrow" className="size-4" />
          길찾기
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="care-map-directions-overlay z-modal" />
        <Dialog.Content className="care-map-directions z-modal">
          <div className="care-map-directions-heading">
            <Dialog.Title className={cafe24Proup.className}>어떤 지도로 찾아갈까요?</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className="care-map-icon-button" aria-label="길찾기 선택 닫기">
                <CareMapIcon name="close" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="care-map-directions-destination">
            {place.name}
            <br />
            <span>{place.roadAddress || place.address}</span>
          </Dialog.Description>
          <div className="care-map-directions-options">
            {links.map((link) => (
              <a
                key={link.provider}
                href={careDirectionsHref(link, nativeApp)}
                target={nativeApp ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="care-map-directions-link"
                aria-label={`${link.label}에서 ${place.name} 길찾기${nativeApp ? '' : ' (새 창)'}`}
              >
                <span
                  className="care-map-directions-symbol"
                  data-provider={link.provider}
                  aria-hidden="true"
                >
                  {link.provider === 'kakao' ? 'K' : link.provider === 'naver' ? 'N' : 'G'}
                </span>
                <span>{link.label}</span>
                <CareMapIcon name="arrow" className="ml-auto size-4 shrink-0" />
              </a>
            ))}
          </div>
          <p className="care-map-directions-note">
            연결된 지도에서 출발지와 이동 방법을 확인해 주세요.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
