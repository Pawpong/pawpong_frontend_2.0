import { useState } from 'react'
import Image from 'next/image'
import type { PetCatalogItem } from '@/entities/playground-pet'
import { petAsset, type PetAsset, type PetAssetManifest } from '../lib/gameAssets'
import styles from './PetRoom.module.css'

export function PetAssetThumbnail({
  item,
  manifest,
}: {
  item: PetCatalogItem
  manifest: PetAssetManifest | null
}) {
  const asset = petAsset(manifest, item.assetKey)
  return (
    <div className={`${styles.itemArt} ${item.slot === 'floor' ? styles.floorArt : ''}`}>
      {asset ? (
        <AssetImage key={asset.url} asset={asset} name={item.name} />
      ) : (
        <span className={styles.artUnavailable}>그림 준비 중</span>
      )}
    </div>
  )
}

function AssetImage({ asset, name }: { asset: PetAsset; name: string }) {
  const [failed, setFailed] = useState(false)
  return failed ? (
    <span
      className={styles.artUnavailable}
      role="img"
      aria-label={`${name}의 그림을 불러오지 못했어요`}
    >
      그림을 불러오지 못했어요
    </span>
  ) : (
    <Image
      src={asset.url}
      alt=""
      width={asset.width}
      height={asset.height}
      unoptimized
      onError={() => setFailed(true)}
    />
  )
}
