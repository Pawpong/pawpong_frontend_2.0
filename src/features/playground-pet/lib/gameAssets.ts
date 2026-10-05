import type { PetRoomSlot } from '@/entities/playground-pet'

export type PetAsset = {
  url: string
  width: number
  height: number
  logicalWidth: number
  logicalHeight: number
  anchor: { x: number; y: number }
  frame?: { x: number; y: number; width: number; height: number }
}
export type PetAssetManifest = {
  version: string
  world: { width: number; height: number; wallHeight: number }
  assets: Record<string, PetAsset>
}
export const PET_ASSET_BASE = '/playground/pet/v2'

/** Only local original art. Unknown server asset IDs cannot cause an external image request. */
export function petAsset(manifest: PetAssetManifest | null, id: string | null): PetAsset | null {
  if (!id || !manifest) return null
  const asset = manifest.assets[id]
  if (!asset || !asset.url.startsWith(`${PET_ASSET_BASE}/`) || asset.url.includes('..')) return null
  return asset
}

export const PET_LAYER_SIZE: Record<PetRoomSlot, { width: number; height: number }> = {
  wallpaper: { width: 320, height: 128 },
  floor: { width: 320, height: 96 },
  bed: { width: 64, height: 64 },
  toy: { width: 40, height: 40 },
  plant: { width: 48, height: 64 },
  decoration: { width: 48, height: 48 },
}

export async function loadPetAssets(signal: AbortSignal): Promise<PetAssetManifest> {
  const response = await fetch(`${PET_ASSET_BASE}/manifest.json`, { signal, cache: 'no-cache' })
  if (!response.ok) throw new Error('방 그림을 준비하지 못했어요.')
  const manifest = (await response.json()) as PetAssetManifest
  if (
    !manifest.assets ||
    Object.keys(manifest.assets).length !== 24 ||
    manifest.world?.width !== 320 ||
    manifest.world?.height !== 224 ||
    manifest.world?.wallHeight !== 128
  )
    throw new Error('방 그림 목록을 확인하지 못했어요.')
  for (const id of Object.keys(manifest.assets)) {
    const asset = petAsset(manifest, id)
    if (
      !asset ||
      !Number.isSafeInteger(asset.width) ||
      !Number.isSafeInteger(asset.height) ||
      asset.width < 1 ||
      asset.height < 1 ||
      !Number.isSafeInteger(asset.logicalWidth) ||
      !Number.isSafeInteger(asset.logicalHeight) ||
      asset.logicalWidth < 1 ||
      asset.logicalHeight < 1
    )
      throw new Error('방 그림 정보가 올바르지 않아요.')
  }
  return manifest
}
