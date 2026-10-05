import type { PetCommand, PetMutationView } from './types'

type RequestError = { status?: number; message?: string }
export type PetCommandResult =
  | { type: 'busy' }
  | { type: 'success'; data: PetMutationView }
  | { type: 'uncertain' | 'rejected'; error: RequestError }

/** 응답 유실 후에는 같은 본문·키만 재전송한다. 다른 행동으로 덮어쓰지 않는다. */
export class PetCommandQueue {
  private pending: PetCommand | null = null
  private controller = new AbortController()
  isRunning = false

  constructor(
    private readonly send: (command: PetCommand, signal: AbortSignal) => Promise<PetMutationView>,
  ) {}

  get isDisposed() {
    return this.controller.signal.aborted
  }
  activate() {
    if (this.isDisposed) this.controller = new AbortController()
  }
  dispose() {
    this.controller.abort()
    this.pending = null
  }

  async run(command?: PetCommand): Promise<PetCommandResult> {
    if (this.isDisposed || this.isRunning || (command && this.pending)) return { type: 'busy' }
    const request = command ?? this.pending
    if (!request) return { type: 'busy' }
    this.pending = request
    this.isRunning = true
    try {
      const data = await this.send(request, this.controller.signal)
      this.pending = null
      return { type: 'success', data }
    } catch (cause) {
      const error = cause && typeof cause === 'object' ? (cause as RequestError) : {}
      const uncertain = !error.status || error.status >= 500
      if (!uncertain) this.pending = null
      return { type: uncertain ? 'uncertain' : 'rejected', error }
    } finally {
      this.isRunning = false
    }
  }
}
