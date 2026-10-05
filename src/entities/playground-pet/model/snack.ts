import type { PetSnackSession, SnackInput, SnackLane } from './types'

export const SNACK_INPUT_LIMIT = 180
export const SNACK_INPUT_INTERVAL_MS = 80
export const SNACK_LANE_X = [72, 160, 248] as const

export function nextSnackInput(
  inputs: readonly SnackInput[],
  lane: SnackLane,
  direction: -1 | 1,
  tMs: number,
  durationMs = 30_000,
): SnackInput | null {
  const next = lane + direction,
    at = Math.floor(tMs),
    last = inputs.at(-1)
  if (
    next < 0 ||
    next > 2 ||
    !Number.isSafeInteger(at) ||
    at < 0 ||
    at > durationMs ||
    inputs.length >= SNACK_INPUT_LIMIT ||
    (last && at - last.tMs < SNACK_INPUT_INTERVAL_MS)
  )
    return null
  return { tMs: at, lane: next as SnackLane }
}

/** Transient local inputs only. Score and rewards are committed exclusively by the server. */
export class SnackInputRecorder {
  private events: SnackInput[] = []
  lane: SnackLane = 1

  move(direction: -1 | 1, tMs: number, durationMs = 30_000): boolean {
    const input = nextSnackInput(this.events, this.lane, direction, tMs, durationMs)
    if (!input) return false
    this.lane = input.lane
    this.events.push(input)
    return true
  }

  snapshot(): SnackInput[] {
    return this.events.map((input) => ({ ...input }))
  }
}

/** A preview of the documented replay, labelled as practice points until the server replies. */
export function previewSnack(
  session: PetSnackSession,
  inputs: readonly SnackInput[],
  elapsed: number,
) {
  let lane: SnackLane = 1,
    cursor = 0,
    score = 0,
    catches = 0,
    hazards = 0,
    misses = 0
  for (const drop of session.drops) {
    if (drop.landingAtMs > elapsed) break
    while (cursor < inputs.length && inputs[cursor].tMs <= drop.landingAtMs) {
      lane = inputs[cursor].lane
      cursor++
    }
    if (lane === drop.lane) {
      if (drop.kind === 'snack') {
        catches++
        score++
      } else {
        hazards++
        score = Math.max(0, score - 2)
      }
    } else if (drop.kind === 'snack') misses++
  }
  return { score, catches, hazards, misses }
}
