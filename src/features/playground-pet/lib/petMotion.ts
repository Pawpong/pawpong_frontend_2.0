import { PET_ROOM_MOTION } from '../constants/pet-motion'

export type PetMotion = {
  x: number
  y: number
  targetX: number
  targetY: number
  facingLeft: boolean
  nextWanderAt: number
  walking: boolean
}
export function initialPetMotion(): PetMotion {
  const { x, y } = PET_ROOM_MOTION.home
  return { x, y, targetX: x, targetY: y, facingLeft: false, nextWanderAt: 2800, walking: false }
}

/** 화면의 움직임만 계산하며 성장 수치와 게임 판정은 변경하지 않는다. */
export function advancePetMotion(
  current: PetMotion,
  input: {
    time: number
    delta: number
    resting: boolean
    reducedMotion: boolean
    reacting: boolean
    snackX?: number
  },
  random = Math.random,
): PetMotion {
  const next = { ...current }
  const { home, bed, bounds, speed, pauseMin, pauseRange } = PET_ROOM_MOTION
  if (input.snackX !== undefined)
    return { ...next, x: input.snackX, y: 213, targetX: home.x, targetY: home.y, walking: false }
  if (input.reducedMotion) {
    const point = input.resting ? bed : home
    return { ...next, x: point.x, y: point.y, targetX: point.x, targetY: point.y, walking: false }
  }
  if (input.reacting && !input.resting)
    return { ...next, walking: false, nextWanderAt: Math.max(next.nextWanderAt, input.time + 1200) }
  if (input.resting) {
    next.targetX = bed.x
    next.targetY = bed.y
  } else if (next.targetX === bed.x && next.targetY === bed.y) {
    next.targetX = home.x
    next.targetY = home.y
  } else if (!next.walking && input.time >= next.nextWanderAt) {
    const sample = () => Math.max(0, Math.min(1, random()))
    next.targetX = bounds.left + sample() * (bounds.right - bounds.left)
    next.targetY = bounds.top + sample() * (bounds.bottom - bounds.top)
    next.nextWanderAt = input.time + pauseMin + sample() * pauseRange
  }
  const dx = next.targetX - next.x,
    dy = next.targetY - next.y
  const distance = Math.hypot(dx, dy)
  if (distance < 0.4) {
    if (current.walking && !input.resting)
      next.nextWanderAt = input.time + pauseMin + Math.max(0, Math.min(1, random())) * pauseRange
    return { ...next, x: next.targetX, y: next.targetY, walking: false }
  }
  const seconds = Math.max(0, Math.min(100, Number.isFinite(input.delta) ? input.delta : 0)) / 1000
  const step = Math.min(distance, speed * seconds * Math.min(1, 0.35 + distance / 18))
  next.x += (dx / distance) * step
  next.y += (dy / distance) * step
  if (Math.abs(dx) > 0.5) next.facingLeft = dx < 0
  next.walking = step > 0
  return next
}
