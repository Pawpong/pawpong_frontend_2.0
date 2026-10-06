// Imported only by PetStage's client effect; Phaser never enters a server render or a common bundle.
import Phaser from 'phaser'
import type {
  PetRoomState,
  PetSnackSession,
  SnackLane,
  PetAction,
  PetGameKind,
} from '@/entities/playground-pet'
import { PET_SLOT_POSITIONS } from '@/entities/playground-pet/model/room'
import { SNACK_LANE_X } from '@/entities/playground-pet/model/snack'
import { petAsset, type PetAssetManifest } from './gameAssets'
import { advancePetMotion, initialPetMotion } from './petMotion'
import { PET_ROOM_MOTION } from '../constants/pet-motion'

export type PetStageSnapshot = {
  room: PetRoomState | null
  manifest: PetAssetManifest | null
  characterUrl: string | null
  resting: boolean
  reaction: number
  feedback: { action: PetAction | 'adopt' | null; stars: number; xp: number }
  reducedMotion: boolean
  snack: { session: PetSnackSession; elapsed: number; lane: SnackLane } | null
}
export type PetGameHandle = {
  sync: (snapshot: PetStageSnapshot) => void
  prepareGame: (kind: PetGameKind) => Promise<boolean>
  retry: () => void
  destroy: () => void
}

export function createPetGame(
  parent: HTMLElement,
  initial: PetStageSnapshot,
  onState: (state: 'loading' | 'ready' | 'error') => void,
): PetGameHandle {
  let snapshot = initial,
    alive = true,
    ready = false,
    characterKey = ''
  let scene: RoomScene | null = null
  let loadVersion = 0
  let preparedGame: PetGameKind | null = null
  const pendingImages = new Set<HTMLImageElement>()
  const assetTextures = new Map<string, string>()
  const loading = new Map<string, Promise<void>>()
  const loadedImages = new Map<string, HTMLImageElement>()
  let keySerial = 0
  let reactionAt = 0,
    lastReaction = initial.reaction

  function requiredAssets(state: PetStageSnapshot) {
    const ids = Object.values(state.room ?? {}).filter((id): id is string => Boolean(id))
    if (state.snack || preparedGame === 'snack') ids.push('toy_bone', 'toy_ball')
    return [...new Set(ids)]
  }

  function imageFor(url: string): Promise<HTMLImageElement> {
    const existing = loadedImages.get(url)
    if (existing) return Promise.resolve(existing)
    return new Promise((resolve, reject) => {
      const img = new Image()
      pendingImages.add(img)
      img.onload = () => {
        pendingImages.delete(img)
        img.onload = null
        img.onerror = null
        if (!alive) {
          reject(new Error('disposed'))
          return
        }
        loadedImages.set(url, img)
        resolve(img)
      }
      img.onerror = () => {
        pendingImages.delete(img)
        img.onload = null
        img.onerror = null
        reject(new Error('asset unavailable'))
      }
      img.src = url
    })
  }

  async function ensureAsset(id: string) {
    if (!scene || assetTextures.has(id)) return
    const asset = petAsset(snapshot.manifest, id)
    if (!asset) throw new Error('unknown asset')
    const pending = loading.get(asset.url)
    if (pending) await pending
    else {
      const request = imageFor(asset.url).then(() => {})
      loading.set(asset.url, request)
      try {
        await request
      } finally {
        loading.delete(asset.url)
      }
    }
    if (!alive || !scene || assetTextures.has(id)) return
    const img = loadedImages.get(asset.url)
    if (!img) throw new Error('missing image')
    const key = `pet-art-${++keySerial}`
    const texture = scene.textures.addImage(key, img)
    if (!texture) throw new Error('texture failed')
    if (asset.frame) {
      const { x, y, width, height } = asset.frame
      texture.add('item', 0, x, y, width, height)
    }
    texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
    assetTextures.set(id, key)
  }

  async function loadSnapshot() {
    if (!alive || !scene || !snapshot.manifest) return false
    const version = ++loadVersion
    const url = snapshot.characterUrl
    ready = false
    onState('loading')
    try {
      // Load this room's layers first. Unused shop assets cannot delay or fail the room.
      await Promise.allSettled(requiredAssets(snapshot).map(ensureAsset))
      if (!alive || version !== loadVersion || !scene) return false
      scene.apply()
      if (url && url !== characterKey) {
        const img = await imageFor(url)
        if (!alive || version !== loadVersion || !scene) return false
        const oldKey = characterKey
        const texture = scene.textures.addSpriteSheet(url, img, {
          frameWidth: 96,
          frameHeight: 96,
          startFrame: 0,
          endFrame: 5,
        })
        if (!texture) throw new Error('character failed')
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
        characterKey = url
        scene.apply()
        if (oldKey && oldKey !== url) {
          scene.textures.remove(oldKey)
          loadedImages.delete(oldKey)
        }
      }
      if (!url && characterKey) {
        scene.textures.remove(characterKey)
        loadedImages.delete(characterKey)
        characterKey = ''
      }
      if (!alive || version !== loadVersion) return false
      if (requiredAssets(snapshot).some((id) => !assetTextures.has(id)))
        throw new Error('room asset unavailable')
      ready = true
      scene.apply()
      onState('ready')
      return true
    } catch {
      if (alive && version === loadVersion) onState('error')
      return false
    }
  }

  class RoomScene extends Phaser.Scene {
    private wall!: Phaser.GameObjects.Image
    private floor!: Phaser.GameObjects.TileSprite
    private hero!: Phaser.GameObjects.Sprite
    private shadow!: Phaser.GameObjects.Ellipse
    private furniture = new Map<string, Phaser.GameObjects.Image>()
    private drops: Phaser.GameObjects.Image[] = []
    private dropSession = ''
    private sparks!: Phaser.GameObjects.Graphics
    private motion = initialPetMotion()

    create() {
      scene = this
      this.cameras.main.roundPixels = true
      this.cameras.main.setBackgroundColor('#fff2d8')
      // Opaque room pixels exist before any texture load. Transparent/missing wallpaper
      // reveals this bright room, independently of GPU clearColor and DOM/CSS overlays.
      const base = this.add.graphics().setDepth(-10)
      base.fillStyle(0xfff2d8).fillRect(0, 0, 320, 128)
      base.fillStyle(0xe7c799).fillRect(0, 128, 320, 96)
      base.fillStyle(0xcaa372).fillRect(0, 124, 320, 4)
      for (let y = 144; y < 224; y += 16) base.fillRect(0, y, 320, 1)
      base.fillStyle(0xf7d18f).fillRect(53, 21, 70, 79)
      base.fillStyle(0x98d8ee).fillRect(59, 27, 58, 67)
      base.fillStyle(0xf9f7df).fillRect(60, 43, 17, 5).fillRect(94, 36, 16, 5)
      base.fillStyle(0xb8d695).fillRect(59, 73, 58, 21)
      base.fillStyle(0xf7d18f).fillRect(86, 27, 4, 67).fillRect(59, 59, 58, 4)
      base.fillStyle(0xfff9e6).fillTriangle(63, 100, 108, 100, 145, 124)
      this.wall = this.add.image(0, 0, '__WHITE').setDepth(-5).setOrigin(0).setVisible(false)
      this.floor = this.add
        .tileSprite(0, 128, 320, 96, '__WHITE')
        .setDepth(-4)
        .setOrigin(0)
        .setVisible(false)
      for (const [slot, position] of Object.entries(PET_SLOT_POSITIONS)) {
        this.furniture.set(
          slot,
          this.add
            .image(position.x, position.y, '__WHITE')
            .setDepth(10)
            .setOrigin(0.5, 1)
            .setVisible(false),
        )
      }
      this.shadow = this.add.ellipse(130, 190, 30, 6, 0x6c5341, 0.18).setDepth(20).setVisible(false)
      this.hero = this.add
        .sprite(130, 196, '__WHITE')
        .setOrigin(0.5, 0.875)
        .setDepth(21)
        .setVisible(false)
      this.sparks = this.add.graphics().setDepth(50)
      void loadSnapshot()
    }

    private showAsset(
      image: Phaser.GameObjects.Image,
      id: string | null,
      width: number,
      height: number,
    ) {
      const key = id ? assetTextures.get(id) : null
      if (!key || !id) {
        image.setVisible(false)
        return
      }
      const asset = petAsset(snapshot.manifest, id)
      image
        .setTexture(key, asset?.frame ? 'item' : undefined)
        .setDisplaySize(width, height)
        .setVisible(true)
    }

    apply() {
      if (!snapshot.room) return
      this.showAsset(this.wall, snapshot.room.wallpaper, 320, 128)
      const floorKey = snapshot.room.floor ? assetTextures.get(snapshot.room.floor) : null
      this.floor.setVisible(Boolean(floorKey))
      if (floorKey) this.floor.setTexture(floorKey).setSize(320, 96)
      for (const [slot, position] of Object.entries(PET_SLOT_POSITIONS)) {
        const image = this.furniture.get(slot)
        const id = snapshot.room[slot as keyof PetRoomState]
        const asset = petAsset(snapshot.manifest, id)
        if (image)
          this.showAsset(
            image,
            id,
            asset?.logicalWidth ?? position.width,
            asset?.logicalHeight ?? position.height,
          )
      }
      this.hero.setVisible(Boolean(characterKey))
      if (characterKey)
        this.hero
          .setTexture(characterKey, 0)
          .setDisplaySize(PET_ROOM_MOTION.displaySize, PET_ROOM_MOTION.displaySize)
          .setVisible(true)
      this.shadow.setVisible(Boolean(characterKey))
      const snack = snapshot.snack
      const changedSession = this.dropSession !== (snack?.session.sessionId ?? '')
      if (changedSession) {
        this.drops.forEach((drop) => drop.destroy())
        this.drops = []
        this.dropSession = snack?.session.sessionId ?? ''
        if (snack)
          this.drops = snack.session.drops.map((drop) => {
            const image = this.add
              .image(SNACK_LANE_X[drop.lane], 0, '__WHITE')
              .setDepth(30)
              .setVisible(false)
            if (drop.kind === 'hazard') image.setTint(0xb3443c)
            return image
          })
      }
      // The session can survive a failed download. Rebind every drop when assets retry.
      if (snack)
        this.drops.forEach((image, index) => {
          const id = snack.session.drops[index].kind === 'snack' ? 'toy_bone' : 'toy_ball'
          this.showAsset(image, id, 24, 24)
        })
    }

    update(time: number, delta = 1000 / 30) {
      if (!alive || !characterKey || !ready) return
      if (snapshot.reaction !== lastReaction) {
        lastReaction = snapshot.reaction
        reactionAt = time
      }
      const snack = snapshot.snack
      const reacting = time - reactionAt < 700 && reactionAt > 0
      this.motion = advancePetMotion(this.motion, {
        time,
        delta,
        reacting,
        resting: snapshot.resting,
        reducedMotion: snapshot.reducedMotion,
        ...(snack ? { snackX: SNACK_LANE_X[snack.lane] } : {}),
      })
      const frame =
        snapshot.resting && !this.motion.walking
          ? 5
          : reacting
            ? snapshot.feedback.action === 'play'
              ? 4
              : snapshot.reducedMotion
                ? 2
                : 2 + (Math.floor(time / 180) % 2)
            : snack
              ? 4
              : snapshot.reducedMotion
                ? 0
                : this.motion.walking
                  ? Math.floor(time / 240) % 2
                  : time % 4000 > 3800
                    ? 1
                    : 0
      this.hero.setFrame(frame)
      const bob =
        snapshot.reducedMotion || snack
          ? 0
          : this.motion.walking
            ? Math.abs(Math.sin(time / 110)) * 0.8
            : Math.sin(time / 900) * 0.35
      this.hero
        .setPosition(this.motion.x, this.motion.y - bob)
        .setFlipX(this.motion.facingLeft)
        .setAngle(
          this.motion.walking && !snapshot.reducedMotion && !snack ? Math.sin(time / 110) * 0.7 : 0,
        )
      this.sparks.clear()
      if (reacting && snapshot.feedback.stars > 0 && !snapshot.reducedMotion) {
        const progress = (time - reactionAt) / 700
        this.sparks.fillStyle(0xe7ba4b, 1 - progress)
        for (let index = 0; index < 7; index++) {
          const angle = (index * Math.PI * 2) / 7
          this.sparks.fillRect(
            Math.round(this.hero.x + Math.cos(angle) * (14 + progress * 28)),
            Math.round(this.hero.y - 44 + Math.sin(angle) * (12 + progress * 24)),
            3,
            3,
          )
        }
      }
      if (snack) {
        this.drops.forEach((image, index) => {
          const drop = snack.session.drops[index]
          const remaining = drop.landingAtMs - snack.elapsed
          const visible = remaining >= 0 && remaining <= 1700
          image.setVisible(visible)
          if (visible) image.setY(Math.round(22 + (1 - remaining / 1700) * 166))
        })
      }
      this.shadow.setPosition(this.motion.x, this.motion.y - 4)
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 320,
    height: 224,
    backgroundColor: '#fff2d8',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    banner: false,
    audio: { noAudio: true },
    input: { keyboard: false, mouse: false, touch: false, gamepad: false },
    fps: { target: 30 },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: RoomScene,
  })
  return {
    prepareGame(kind) {
      preparedGame = kind
      return loadSnapshot()
    },
    sync(next) {
      const reload =
        next.characterUrl !== snapshot.characterUrl ||
        next.manifest !== snapshot.manifest ||
        requiredAssets(next).join('|') !== requiredAssets(snapshot).join('|')
      snapshot = next
      if (reload) void loadSnapshot()
      else if (ready) scene?.apply()
    },
    retry: () => {
      void loadSnapshot()
    },
    destroy() {
      if (!alive) return
      alive = false
      loadVersion++
      for (const img of pendingImages) {
        img.onload = null
        img.onerror = null
        img.src = ''
      }
      pendingImages.clear()
      loadedImages.clear()
      loading.clear()
      game.destroy(true)
      // destroy is deferred to the next frame. A hidden tab may have paused that frame;
      // the public step checks pendingDestroy before touching any scene or renderer.
      if (game.isRunning) game.headlessStep(0, 0)
      else
        game.events.once(Phaser.Core.Events.READY, () => {
          // READY precedes Game.start. Let its synchronous boot finish before destruction.
          queueMicrotask(() => game.headlessStep(0, 0))
        })
      scene = null
    },
  }
}
