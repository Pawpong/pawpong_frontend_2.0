export type PetStartContext = {
  selected: boolean
  disabled: boolean
  revision: number
  activeId: string
}
type StartPhase = 'preparing' | 'sending'
export type PetStartAttempt = { readonly revision: number }

export class PetStartIntent {
  private active = false
  private context: PetStartContext | null = null
  private pending: { attempt: PetStartAttempt; phase: StartPhase } | null = null
  private cancelled = false
  private listeners = new Set<() => void>()

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
  snapshot = (): StartPhase | 'cancelled' | null =>
    this.pending?.phase ?? (this.cancelled ? 'cancelled' : null)

  activate() {
    this.active = true
  }

  update(context: PetStartContext) {
    const previous = this.context
    this.context = { ...context }
    if (
      previous &&
      (previous.selected !== context.selected ||
        previous.disabled !== context.disabled ||
        previous.revision !== context.revision ||
        previous.activeId !== context.activeId)
    )
      return this.cancelPreparation()
    return false
  }

  begin(): PetStartAttempt | null {
    const context = this.context
    if (!this.active || this.pending || !context?.selected || context.disabled || context.activeId)
      return null
    const attempt: PetStartAttempt = { revision: context.revision }
    this.cancelled = false
    this.pending = { attempt, phase: 'preparing' }
    this.emit()
    return attempt
  }

  isCurrent(attempt: PetStartAttempt) {
    return this.active && this.pending?.attempt === attempt
  }

  markSending(attempt: PetStartAttempt) {
    const context = this.context
    const pending = this.pending
    if (
      !this.isCurrent(attempt) ||
      !pending ||
      pending.phase !== 'preparing' ||
      !context?.selected ||
      context.disabled ||
      context.activeId ||
      context.revision !== attempt.revision
    )
      return false
    pending.phase = 'sending'
    this.emit()
    return true
  }

  cancelPreparation = () => {
    if (this.pending?.phase !== 'preparing') return false
    this.pending = null
    this.cancelled = true
    this.emit()
    return true
  }

  finish(attempt: PetStartAttempt) {
    if (!this.isCurrent(attempt)) return
    this.pending = null
    this.emit()
  }

  dispose() {
    this.active = false
    this.pending = null
    this.cancelled = false
    this.emit()
  }

  private emit() {
    this.listeners.forEach((listener) => listener())
  }
}
