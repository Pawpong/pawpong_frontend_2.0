// Imported only by PetStage's client effect; Phaser never enters a server render or a common bundle.
import Phaser from 'phaser'
import type {
  PetRoomState,
  PetSnackSession,
  SnackLane,
  PetAction,
  PetGameKind,
} from '@/entities/playground-pet'
import { PET_SLOT_AREAS, PET_SLOT_POSITIONS } from '@/entities/playground-pet/model/room'
import { SNACK_LANE_X, snackDropResult } from '@/entities/playground-pet/model/snack'
import { petAsset, type PetAssetManifest } from './gameAssets'
import { advancePetMotion, callPetTo, initialPetMotion, petMotionPose } from './petMotion'
import { PET_ROOM_MOTION } from '../constants/pet-motion'

export type PetStageSnapshot = {
  room: PetRoomState | null
  manifest: PetAssetManifest | null
  characterUrl: string | null
  resting: boolean
  reaction: number
  feedback: { action: PetAction | 'adopt' | null; stars: number; xp: number }
  reducedMotion: boolean
  /** origin(performance.now 기준)이 있으면 엔진이 매 프레임 경과 시간을 직접 계산한다. */
  snack: { session: PetSnackSession; elapsed: number; lane: SnackLane; origin?: number } | null
  /** 서버 수치에서 읽은 표시용 기분. 말풍선 그림만 바꾼다. */
  mood?: 'hungry' | 'sleepy' | 'bored' | 'happy' | 'resting' | null
  /** 꾸미기 미리보기 중인 슬롯을 방 안에서 강조한다. */
  highlight?: keyof PetRoomState | null
}
export type PetGameHandle = {
  sync: (snapshot: PetStageSnapshot) => void
  prepareGame: (kind: PetGameKind) => Promise<boolean>
  retry: () => void
  /** 방 좌표를 누른다. 캐릭터면 'pet', 바닥이면 'call'(걸어옴), 반응할 수 없으면 null. 보상은 없다. */
  poke: (x: number, y: number) => 'pet' | 'call' | null
  destroy: () => void
}

// 1칸=1 논리 픽셀인 연출용 도트. 새 래스터 파일 없이 기존 팔레트로 그린다.
const FX_BITMAPS = {
  heart: ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'],
  bone: ['1100011', '1111111', '1111111', '1100011'],
  ball: ['01110', '11111', '11111', '11111', '01110'],
  zed: ['11111', '00010', '00100', '01000', '11111'],
  star: ['00100', '01110', '11111', '01110', '00100'],
  cross: ['10001', '01010', '00100', '01010', '10001'],
} as const
const FX_COLORS = {
  heart: 0xe9778a,
  bone: 0xfff5d8,
  ball: 0xf2b84b,
  zed: 0x6f7fb5,
  star: 0xe7ba4b,
  cross: 0xb3443c,
} as const
const MOOD_ICON = { hungry: 'bone', sleepy: 'zed', bored: 'ball', happy: 'heart' } as const
const SNACK_FALL_MS = 1700

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
  let sceneTime = 0,
    pokeAt = -Infinity

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
    private dropResults: (ReturnType<typeof snackDropResult> | null)[] = []
    private dropResolvedAt: number[] = []

    heroPoint() {
      return { x: this.hero.x, y: this.hero.y }
    }
    callTo(point: { x: number; y: number }) {
      const next = callPetTo(this.motion, point)
      const moved = next !== this.motion
      this.motion = next
      return moved
    }

    private stamp(
      kind: keyof typeof FX_BITMAPS,
      x: number,
      y: number,
      alpha = 1,
      color: number = FX_COLORS[kind],
    ) {
      const rows = FX_BITMAPS[kind]
      // 2×2 논리 픽셀 한 칸: 휴대폰 화면에서도 읽히는 크기.
      const left = Math.round(x - rows[0].length),
        top = Math.round(y - rows.length)
      this.sparks.fillStyle(color, Math.max(0, Math.min(1, alpha)))
      rows.forEach((row, dy) => {
        for (let dx = 0; dx < row.length; dx++)
          if (row[dx] === '1') this.sparks.fillRect(left + dx * 2, top + dy * 2, 2, 2)
      })
    }

    private bubble(kind: keyof typeof FX_BITMAPS, x: number, y: number) {
      const left = Math.round(x - 11),
        top = Math.round(y - 10)
      this.sparks.fillStyle(0x765640, 1)
      this.sparks.fillRect(left + 1, top, 20, 20).fillRect(left, top + 1, 22, 18)
      this.sparks.fillRect(left + 4, top + 20, 4, 3)
      this.sparks.fillStyle(0xfffdf5, 1)
      this.sparks.fillRect(left + 2, top + 1, 18, 18).fillRect(left + 1, top + 2, 20, 16)
      this.sparks.fillRect(left + 5, top + 19, 2, 3)
      this.stamp(kind, left + 11, top + 10, 1, kind === 'bone' ? 0xb56822 : FX_COLORS[kind])
    }

    private frame(area: { x: number; y: number; width: number; height: number }) {
      const { x, y, width, height } = area
      const arm = 6
      this.sparks.fillStyle(0xfffdf5, 1)
      for (const [cx, cy, sx, sy] of [
        [x, y, 1, 1],
        [x + width, y, -1, 1],
        [x, y + height, 1, -1],
        [x + width, y + height, -1, -1],
      ] as const) {
        this.sparks.fillRect(Math.min(cx, cx + sx * arm), cy - 1, arm, 3)
        this.sparks.fillRect(cx - 1, Math.min(cy, cy + sy * arm), 3, arm)
      }
      this.sparks.fillStyle(0x765640, 1)
      for (const [cx, cy, sx, sy] of [
        [x, y, 1, 1],
        [x + width, y, -1, 1],
        [x, y + height, 1, -1],
        [x + width, y + height, -1, -1],
      ] as const) {
        this.sparks.fillRect(Math.min(cx, cx + sx * (arm - 1)), cy, arm - 1, 1)
        this.sparks.fillRect(cx, Math.min(cy, cy + sy * (arm - 1)), 1, arm - 1)
      }
    }

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
      // 방의 장난감이 떨어지는 간식·공과 헷갈리지 않게 게임 동안만 치운다.
      if (snapshot.snack) this.furniture.get('toy')?.setVisible(false)
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
        this.dropResults = []
        this.dropResolvedAt = []
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
      sceneTime = time
      if (!alive || !characterKey || !ready) return
      if (snapshot.reaction !== lastReaction) {
        lastReaction = snapshot.reaction
        reactionAt = time
      }
      const snack = snapshot.snack
      const poked = !snack && !snapshot.resting && time - pokeAt < PET_ROOM_MOTION.pokeDuration
      const reacting = (time - reactionAt < 700 && reactionAt > 0) || poked
      const room = snapshot.room
      this.motion = advancePetMotion(this.motion, {
        visits: room
          ? (['toy', 'plant'] as const).flatMap((slot) =>
              room[slot]
                ? [{ x: PET_SLOT_POSITIONS[slot].x + (slot === 'plant' ? 44 : -34), y: 190 }]
                : [],
            )
          : [],
        time,
        delta,
        reacting,
        resting: snapshot.resting,
        reducedMotion: snapshot.reducedMotion,
        ...(snack ? { snackX: SNACK_LANE_X[snack.lane] } : {}),
      })
      const pose = petMotionPose(
        this.motion,
        snapshot.reducedMotion || Boolean(snack) || reacting,
        snapshot.resting,
      )
      const frame =
        snapshot.resting && !this.motion.walking
          ? 5
          : reacting
            ? snapshot.feedback.action === 'play' && !poked
              ? 4
              : snapshot.reducedMotion
                ? 2
                : 2 + (Math.floor(time / 180) % 2)
            : snack
              ? 4
              : pose.frame
      this.hero.setFrame(frame)
      this.hero
        .setDisplaySize(
          PET_ROOM_MOTION.displaySize + pose.width,
          PET_ROOM_MOTION.displaySize + pose.height,
        )
        .setPosition(
          this.motion.x,
          this.motion.y -
            pose.bob -
            (poked && !snapshot.reducedMotion
              ? Math.round(Math.sin(((time - pokeAt) / PET_ROOM_MOTION.pokeDuration) * Math.PI) * 6)
              : 0),
        )
        .setFlipX(this.motion.facingLeft)
        .setAngle(pose.angle)
      this.sparks.clear()
      if (
        reactionAt > 0 &&
        time - reactionAt < 700 &&
        snapshot.feedback.stars > 0 &&
        !snapshot.reducedMotion
      ) {
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
      const still = snapshot.reducedMotion
      const headY = this.hero.y - 58
      if (!snack) {
        const area = snapshot.highlight ? PET_SLOT_AREAS[snapshot.highlight] : null
        if (area && (still || Math.floor(time / 400) % 2 === 0)) this.frame(area)
        const since = time - reactionAt
        const action = snapshot.feedback.action
        if (!still && reactionAt > 0 && since < 1100 && !poked) {
          const progress = since / 1100
          if (action === 'greet')
            for (let index = 0; index < 3; index++)
              this.stamp(
                'heart',
                this.hero.x + (index - 1) * 14,
                headY + 8 - progress * 22 - index * 4,
                1 - progress,
              )
          else if (action === 'feed') {
            if (progress < 0.55)
              this.stamp('bone', this.hero.x, headY - 20 + (progress / 0.55) * 38)
            else
              for (let index = 0; index < 4; index++)
                this.stamp(
                  'star',
                  this.hero.x + (index - 1.5) * 9,
                  this.hero.y - 30 - (progress - 0.55) * 20,
                  1 - progress,
                  0xfff5d8,
                )
          } else if (action === 'play')
            this.stamp(
              'ball',
              this.hero.x + (this.motion.facingLeft ? -1 : 1) * (22 + progress * 12),
              this.hero.y - 8 - Math.abs(Math.sin(progress * Math.PI * 2)) * 26,
            )
        }
        if (poked && !still) {
          const progress = (time - pokeAt) / PET_ROOM_MOTION.pokeDuration
          this.stamp('heart', this.hero.x + 12, headY + 6 - progress * 16, 1 - progress)
        }
        const mood = snapshot.mood
        if (mood === 'resting' || snapshot.resting) {
          if (!this.motion.walking && !still)
            for (let index = 0; index < 2; index++) {
              const phase = (((time / 1800 + index * 0.5) % 1) + 1) % 1
              this.stamp('zed', this.hero.x + 14 + phase * 10, headY + 14 - phase * 18, 1 - phase)
            }
        } else if (mood && !reacting && !still && Math.floor(time / 1000) % 8 < 3)
          this.bubble(MOOD_ICON[mood], this.hero.x + 6, headY - 8)
      }
      if (snack) {
        const duration = snack.session.durationMs ?? 30_000
        const elapsed =
          snack.origin === undefined
            ? snack.elapsed
            : Math.max(0, Math.min(duration, performance.now() - snack.origin))
        if (!still) {
          // lane 안내: 지금 서 있는 칸을 밝게 표시한다.
          SNACK_LANE_X.forEach((x, lane) => {
            this.sparks.fillStyle(0xfffdf5, lane === snack.lane ? 0.55 : 0.22)
            this.sparks.fillRect(x - 26, 216, 52, 3)
          })
        }
        this.drops.forEach((image, index) => {
          const drop = snack.session.drops[index]
          const remaining = drop.landingAtMs - elapsed
          if (remaining < 0 && this.dropResults[index] == null) {
            // 오래 전에 지난 낙하물(복원·탭 복귀)은 연출하지 않는다.
            this.dropResults[index] = snackDropResult(drop, snack.lane)
            this.dropResolvedAt[index] = remaining > -250 ? time : -Infinity
          }
          const result = this.dropResults[index]
          const passed = result === 'miss' || result === 'dodge'
          const visible =
            remaining <= SNACK_FALL_MS && (remaining >= 0 || (passed && remaining > -220))
          image.setVisible(visible)
          if (visible) image.setY(Math.round(22 + (1 - remaining / SNACK_FALL_MS) * 166))
          const age = time - (this.dropResolvedAt[index] ?? -Infinity)
          if (
            !still &&
            result &&
            age >= 0 &&
            age < 450 &&
            (result === 'catch' || result === 'hazard')
          ) {
            const progress = age / 450
            const x = SNACK_LANE_X[drop.lane]
            if (result === 'catch')
              for (let spark = 0; spark < 5; spark++) {
                const angle = (spark * Math.PI * 2) / 5 - Math.PI / 2
                this.stamp(
                  'star',
                  x + Math.cos(angle) * (8 + progress * 18),
                  176 + Math.sin(angle) * (6 + progress * 14),
                  1 - progress,
                )
              }
            else this.stamp('cross', x, 170 - progress * 8, 1 - progress)
          }
        })
        const hit = this.dropResults.some(
          (result, index) =>
            result === 'hazard' && time - (this.dropResolvedAt[index] ?? -Infinity) < 300,
        )
        if (hit && !still) this.hero.setAngle(Math.floor(time / 60) % 2 ? 6 : -6)
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
    poke(x, y) {
      if (!alive || !scene || !ready || !characterKey || snapshot.snack || snapshot.resting)
        return null
      const hero = scene.heroPoint()
      if (Math.hypot(x - hero.x, y - (hero.y - 28)) <= PET_ROOM_MOTION.pokeRadius) {
        pokeAt = sceneTime
        return 'pet'
      }
      if (y < 150 || snapshot.reducedMotion) return null
      return scene.callTo({ x, y }) ? 'call' : null
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
