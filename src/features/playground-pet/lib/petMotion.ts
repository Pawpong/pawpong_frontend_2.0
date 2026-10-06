import { PET_ROOM_MOTION } from '../constants/pet-motion'

export type PetMotion = {
  x: number
  y: number
  targetX: number
  targetY: number
  facingLeft: boolean
  nextWanderAt: number
  walking: boolean
  speed: number
  gaitPhase: number
  visualTime: number
  resumeAt: number
  mode: 'room' | 'bed' | 'snack'
}
export function initialPetMotion(): PetMotion {
  const { x, y } = PET_ROOM_MOTION.home
  return {
    x,
    y,
    targetX: x,
    targetY: y,
    facingLeft: false,
    nextWanderAt: PET_ROOM_MOTION.pauseMin,
    walking: false,
    speed: 0,
    gaitPhase: 0,
    visualTime: 0,
    resumeAt: 0,
    mode: 'room',
  }
}

function sample(random: () => number) {
  const value = random()
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.5
}

function wanderTarget(current: PetMotion, random: () => number) {
  const { bounds, minimumWanderDistance } = PET_ROOM_MOTION
  for (let attempt = 0; attempt < 6; attempt++) {
    const x = bounds.left + sample(random) * (bounds.right - bounds.left)
    const y = bounds.top + sample(random) * (bounds.bottom - bounds.top)
    if (Math.hypot(x - current.x, y - current.y) >= minimumWanderDistance) return { x, y }
  }
  return {
    x: current.x < (bounds.left + bounds.right) / 2 ? bounds.right : bounds.left,
    y: Math.max(bounds.top, Math.min(bounds.bottom, current.y)),
  }
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
  const seconds = Math.max(0, Math.min(100, Number.isFinite(input.delta) ? input.delta : 0)) / 1000
  const next = { ...current, visualTime: current.visualTime + seconds * 1000 }
  const {
    home,
    bed,
    speed,
    acceleration,
    deceleration,
    arrivalDistance,
    strideLength,
    reactionPause,
    gameExitPause,
    pauseMin,
    pauseRange,
  } = PET_ROOM_MOTION
  if (input.snackX !== undefined)
    return {
      ...next,
      x: input.snackX,
      y: 213,
      targetX: home.x,
      targetY: home.y,
      walking: false,
      speed: 0,
      mode: 'snack',
    }
  if (input.reducedMotion) {
    const point = input.resting ? bed : home
    return {
      ...next,
      x: point.x,
      y: point.y,
      targetX: point.x,
      targetY: point.y,
      walking: false,
      speed: 0,
      mode: input.resting ? 'bed' : 'room',
      resumeAt: 0,
      nextWanderAt: input.time + pauseMin,
    }
  }
  const mode = input.resting ? 'bed' : 'room'
  if (next.mode !== mode) {
    next.mode = mode
    next.speed = 0
    next.resumeAt = current.mode === 'snack' ? input.time + gameExitPause : 0
    next.targetX = input.resting ? bed.x : home.x
    next.targetY = input.resting ? bed.y : home.y
  }
  if (input.reacting && !input.resting)
    return { ...next, walking: false, speed: 0, resumeAt: input.time + reactionPause }
  if (input.time < next.resumeAt) return { ...next, walking: false, speed: 0 }
  if (input.resting) {
    next.targetX = bed.x
    next.targetY = bed.y
  } else if (
    !current.walking &&
    Math.hypot(next.targetX - next.x, next.targetY - next.y) <= arrivalDistance &&
    input.time >= next.nextWanderAt
  ) {
    const target = wanderTarget(next, random)
    next.targetX = target.x
    next.targetY = target.y
  }
  const dx = next.targetX - next.x,
    dy = next.targetY - next.y
  const distance = Math.hypot(dx, dy)
  if (distance <= arrivalDistance) {
    if (current.walking && !input.resting)
      next.nextWanderAt = input.time + pauseMin + sample(random) * pauseRange
    return { ...next, x: next.targetX, y: next.targetY, walking: false, speed: 0 }
  }
  const desiredSpeed = Math.min(speed, Math.sqrt(2 * deceleration * distance))
  const change = (desiredSpeed > next.speed ? acceleration : deceleration) * seconds
  const previousSpeed = next.speed
  next.speed += Math.max(-change, Math.min(change, desiredSpeed - next.speed))
  const step = Math.min(distance, ((previousSpeed + next.speed) / 2) * seconds)
  next.x += (dx / distance) * step
  next.y += (dy / distance) * step
  next.gaitPhase = (next.gaitPhase + (step / strideLength) * Math.PI * 2) % (Math.PI * 2)
  if (Math.abs(dx) > 0.5) next.facingLeft = dx < 0
  next.walking = next.speed > 0
  if (distance - step <= arrivalDistance) {
    next.x = next.targetX
    next.y = next.targetY
    next.speed = 0
    next.walking = false
    if (!input.resting) next.nextWanderAt = input.time + pauseMin + sample(random) * pauseRange
  }
  return next
}

/** 보폭은 경과 시간이 아닌 이동 거리에 묶고 호흡은 발 기준점을 유지한다. */
export function petMotionPose(motion: PetMotion, still: boolean, resting: boolean) {
  if (still) return { frame: 0, bob: 0, angle: 0, width: 0, height: 0 }
  if (motion.walking) {
    const intensity = Math.min(1, motion.speed / PET_ROOM_MOTION.speed)
    const stride = Math.sin(motion.gaitPhase)
    return {
      frame: motion.gaitPhase >= Math.PI ? 1 : 0,
      bob: Math.abs(stride) * 0.6 * intensity,
      angle: stride * 0.35 * intensity,
      width: stride * 0.12 * intensity,
      height: -Math.abs(stride) * 0.25 * intensity,
    }
  }
  const breath = Math.sin((motion.visualTime / PET_ROOM_MOTION.breathDuration) * Math.PI * 2)
  return {
    frame: 0,
    bob: 0,
    angle: 0,
    width: -breath * 0.2,
    height: breath * (resting ? 0.2 : 0.4),
  }
}
